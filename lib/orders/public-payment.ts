import "server-only";

import { notFound } from "next/navigation";

import { createAdminClient } from "@/lib/supabase/admin";

const servicePaymentStatuses = [
  "menunggu_pembayaran_dp",
  "menunggu_konfirmasi_dp",
  "menunggu_verifikasi",
] as const;

type ServicePaymentStatus = (typeof servicePaymentStatuses)[number];
type PaymentMethod = "transfer" | "cod";

type PublicServicePaymentOrder = {
  order_code: string;
  order_kind: "service";
  status: ServicePaymentStatus;
  service_slug: string | null;
  service_name_snapshot: string | null;
  quantity: number;
  price: number;
  dp_amount: number;
  payment_method: PaymentMethod | null;
};

type PublicProductPaymentOrder = {
  order_code: string;
  order_kind: "product";
  status: "menunggu_verifikasi";
  product_name_snapshot: string;
  material: string | null;
  product_sleeve_type: string | null;
  product_size: string;
  quantity: number;
  unit_price: number | null;
  price: number;
  payment_method: "transfer";
  has_payment_proof: boolean;
};

export type PublicPaymentOrder =
  | PublicServicePaymentOrder
  | PublicProductPaymentOrder;

type PaymentOrderRow = {
  order_code: string;
  order_kind: "service" | "product";
  status: string;
  services: { slug: string } | null;
  service_name_snapshot: string | null;
  product_name_snapshot: string | null;
  material: string | null;
  product_sleeve_type: string | null;
  product_size: string | null;
  quantity: number;
  unit_price: number | string | null;
  price: number | string | null;
  dp_amount: number | string | null;
  payment_method: PaymentMethod | null;
  payment_proof_path: string | null;
};

type SubmittableOrder = {
  id: string;
  order_kind: "service" | "product";
  status: string;
  payment_method: PaymentMethod | null;
  payment_proof_path: string | null;
};

export type PublicPaymentResult =
  | { ok: true; orderId: string }
  | { ok: false; error: string };

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const maxProofSize = 5 * 1024 * 1024;
const proofMimeTypes = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

function isValidPaymentToken(token: string) {
  return uuidPattern.test(token);
}

function hasValidFileSignature(bytes: Uint8Array, mimeType: string) {
  if (mimeType === "image/jpeg") {
    return (
      bytes.length >= 3 &&
      bytes[0] === 0xff &&
      bytes[1] === 0xd8 &&
      bytes[2] === 0xff
    );
  }

  if (mimeType === "image/png") {
    const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
    return signature.every((value, index) => bytes[index] === value);
  }

  if (mimeType === "image/webp") {
    return (
      bytes.length >= 12 &&
      String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
      String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
    );
  }

  return false;
}

function paymentUnavailable(): PublicPaymentResult {
  return {
    ok: false,
    error: "Pesanan tidak dapat menerima pembayaran saat ini.",
  };
}

function normalizePaymentOrder(row: PaymentOrderRow): PublicPaymentOrder | null {
  const price = Number(row.price);
  if (row.price === null || !Number.isFinite(price)) return null;

  if (row.order_kind === "product") {
    const unitPrice = row.unit_price === null ? null : Number(row.unit_price);
    if (
      row.status !== "menunggu_verifikasi" ||
      row.payment_method !== "transfer" ||
      !row.product_name_snapshot ||
      !row.product_size ||
      (unitPrice !== null && !Number.isFinite(unitPrice))
    ) {
      return null;
    }

    return {
      order_code: row.order_code,
      order_kind: "product",
      status: "menunggu_verifikasi",
      product_name_snapshot: row.product_name_snapshot,
      material: row.material,
      product_sleeve_type: row.product_sleeve_type,
      product_size: row.product_size,
      quantity: row.quantity,
      unit_price: unitPrice,
      price,
      payment_method: "transfer",
      has_payment_proof: row.payment_proof_path !== null,
    };
  }

  const dpAmount = Number(row.dp_amount);
  if (
    !servicePaymentStatuses.includes(row.status as ServicePaymentStatus) ||
    row.dp_amount === null || !Number.isFinite(dpAmount)
  ) {
    return null;
  }

  return {
    order_code: row.order_code,
    order_kind: "service",
    status: row.status as ServicePaymentStatus,
    service_slug: row.services?.slug ?? null,
    service_name_snapshot: row.service_name_snapshot,
    quantity: row.quantity,
    price,
    dp_amount: dpAmount,
    payment_method: row.payment_method,
  };
}

export async function getPublicPaymentOrder(
  token: string,
): Promise<PublicPaymentOrder> {
  if (!isValidPaymentToken(token)) notFound();

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .select(
      "order_code, order_kind, status, services(slug), service_name_snapshot, product_name_snapshot, material, product_sleeve_type, product_size, quantity, unit_price, price, dp_amount, payment_method, payment_proof_path",
    )
    .eq("payment_token", token)
    .in("order_kind", ["service", "product"])
    .maybeSingle<PaymentOrderRow>();

  if (error || !data) notFound();

  const order = normalizePaymentOrder(data);
  if (!order) notFound();

  return order;
}

function validatePaymentProof(formData: FormData) {
  const proof = formData.get("paymentProof");

  if (!(proof instanceof File) || proof.size === 0) {
    return { ok: false, error: "Bukti pembayaran wajib dipilih." } as const;
  }

  if (proof.size > maxProofSize) {
    return { ok: false, error: "Ukuran bukti pembayaran maksimal 5 MB." } as const;
  }

  if (!(proof.type in proofMimeTypes)) {
    return { ok: false, error: "Format bukti pembayaran tidak didukung." } as const;
  }

  return { ok: true, proof } as const;
}

async function uploadPaymentProof(
  orderId: string,
  proof: File,
  supabase: ReturnType<typeof createAdminClient>,
) {
  const bytes = new Uint8Array(await proof.arrayBuffer());

  if (!hasValidFileSignature(bytes, proof.type)) {
    return { ok: false, error: "Format bukti pembayaran tidak didukung." } as const;
  }

  const extension = proofMimeTypes[proof.type as keyof typeof proofMimeTypes];
  const proofPath = `orders/${orderId}/${crypto.randomUUID()}.${extension}`;
  const storage = supabase.storage.from("payment-proofs");
  const { error } = await storage.upload(proofPath, bytes, {
    contentType: proof.type,
    upsert: false,
  });

  if (error) {
    return {
      ok: false,
      error: "Pembayaran gagal dikirim. Silakan coba lagi.",
    } as const;
  }

  return { ok: true, proofPath, storage } as const;
}

async function submitPublicPaymentInternal(
  token: string,
  formData: FormData,
): Promise<PublicPaymentResult> {
  if (!isValidPaymentToken(token)) return paymentUnavailable();

  const method = formData.get("paymentMethod");
  if (method !== "transfer" && method !== "cod") {
    return { ok: false, error: "Pilih metode pembayaran terlebih dahulu." };
  }

  const supabase = createAdminClient();
  const { data: order, error: lookupError } = await supabase
    .from("orders")
    .select("id, order_kind, status, payment_method, payment_proof_path")
    .eq("payment_token", token)
    .in("order_kind", ["service", "product"])
    .maybeSingle<SubmittableOrder>();

  if (lookupError || !order) return paymentUnavailable();

  if (order.order_kind === "product") {
    if (
      method !== "transfer" ||
      order.status !== "menunggu_verifikasi" ||
      order.payment_method !== "transfer" ||
      order.payment_proof_path !== null
    ) {
      return paymentUnavailable();
    }

    const validatedProof = validatePaymentProof(formData);
    if (!validatedProof.ok) {
      return { ok: false, error: validatedProof.error };
    }

    const uploaded = await uploadPaymentProof(
      order.id,
      validatedProof.proof,
      supabase,
    );
    if (!uploaded.ok) return { ok: false, error: uploaded.error };

    const { data, error } = await supabase
      .from("orders")
      .update({ payment_proof_path: uploaded.proofPath })
      .eq("id", order.id)
      .eq("order_kind", "product")
      .eq("payment_method", "transfer")
      .eq("status", "menunggu_verifikasi")
      .is("payment_proof_path", null)
      .select("id")
      .maybeSingle<{ id: string }>();

    if (error || !data) {
      await uploaded.storage.remove([uploaded.proofPath]);
      return error
        ? {
            ok: false,
            error: "Pembayaran gagal dikirim. Silakan coba lagi.",
          }
        : paymentUnavailable();
    }

    return { ok: true, orderId: data.id };
  }

  if (
    order.status !== "menunggu_pembayaran_dp" ||
    order.payment_method !== null
  ) {
    return paymentUnavailable();
  }

  if (method === "cod") {
    const { data, error } = await supabase
      .from("orders")
      .update({
        payment_method: "cod",
        status: "menunggu_konfirmasi_dp",
      })
      .eq("id", order.id)
      .eq("order_kind", "service")
      .eq("status", "menunggu_pembayaran_dp")
      .is("payment_method", null)
      .select("id")
      .maybeSingle<{ id: string }>();

    if (error) {
      return {
        ok: false,
        error: "Pembayaran gagal dikirim. Silakan coba lagi.",
      };
    }

    return data ? { ok: true, orderId: data.id } : paymentUnavailable();
  }

  const validatedProof = validatePaymentProof(formData);
  if (!validatedProof.ok) {
    return { ok: false, error: validatedProof.error };
  }

  const uploaded = await uploadPaymentProof(
    order.id,
    validatedProof.proof,
    supabase,
  );
  if (!uploaded.ok) return { ok: false, error: uploaded.error };

  const { data, error } = await supabase
    .from("orders")
    .update({
      payment_method: "transfer",
      payment_proof_path: uploaded.proofPath,
      status: "menunggu_verifikasi",
    })
    .eq("id", order.id)
    .eq("order_kind", "service")
    .eq("status", "menunggu_pembayaran_dp")
    .is("payment_method", null)
    .select("id")
    .maybeSingle<{ id: string }>();

  if (error || !data) {
    await uploaded.storage.remove([uploaded.proofPath]);
    return error
      ? {
          ok: false,
          error: "Pembayaran gagal dikirim. Silakan coba lagi.",
        }
      : paymentUnavailable();
  }

  return { ok: true, orderId: data.id };
}

export async function submitPublicPayment(
  token: string,
  formData: FormData,
): Promise<PublicPaymentResult> {
  try {
    return await submitPublicPaymentInternal(token, formData);
  } catch {
    return {
      ok: false,
      error: "Pembayaran gagal dikirim. Silakan coba lagi.",
    };
  }
}
