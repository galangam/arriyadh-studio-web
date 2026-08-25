import "server-only";

import { notFound } from "next/navigation";

import { createAdminClient } from "@/lib/supabase/admin";

const paymentStatuses = [
  "menunggu_pembayaran_dp",
  "menunggu_konfirmasi_dp",
  "menunggu_verifikasi",
] as const;

type PublicPaymentStatus = (typeof paymentStatuses)[number];
type PaymentMethod = "transfer" | "cod";

type PaymentOrderRow = {
  order_code: string;
  order_kind: "service";
  status: PublicPaymentStatus;
  service_name_snapshot: string | null;
  quantity: number;
  price: number | null;
  dp_amount: number | null;
  payment_method: PaymentMethod | null;
};

export type PublicPaymentOrder = Omit<
  PaymentOrderRow,
  "price" | "dp_amount"
> & {
  price: number;
  dp_amount: number;
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

export async function getPublicPaymentOrder(
  token: string,
): Promise<PublicPaymentOrder> {
  if (!isValidPaymentToken(token)) notFound();

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .select(
      "order_code, order_kind, status, service_name_snapshot, quantity, price, dp_amount, payment_method",
    )
    .eq("payment_token", token)
    .eq("order_kind", "service")
    .in("status", [...paymentStatuses])
    .maybeSingle<PaymentOrderRow>();

  if (error || !data || data.price === null || data.dp_amount === null) {
    notFound();
  }

  return {
    ...data,
    price: data.price,
    dp_amount: data.dp_amount,
  };
}

async function submitPublicServicePaymentInternal(
  token: string,
  formData: FormData,
): Promise<PublicPaymentResult> {
  if (!isValidPaymentToken(token)) {
    return {
      ok: false,
      error: "Pesanan tidak dapat menerima pembayaran saat ini.",
    };
  }

  const method = formData.get("paymentMethod");

  if (method !== "transfer" && method !== "cod") {
    return { ok: false, error: "Pilih metode pembayaran terlebih dahulu." };
  }

  const supabase = createAdminClient();
  const { data: order, error: lookupError } = await supabase
    .from("orders")
    .select("id")
    .eq("payment_token", token)
    .eq("order_kind", "service")
    .eq("status", "menunggu_pembayaran_dp")
    .is("payment_method", null)
    .maybeSingle<{ id: string }>();

  if (lookupError || !order) {
    return {
      ok: false,
      error: "Pesanan tidak dapat menerima pembayaran saat ini.",
    };
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

    if (!data) {
      return {
        ok: false,
        error: "Pesanan tidak dapat menerima pembayaran saat ini.",
      };
    }

    return { ok: true, orderId: data.id };
  }

  const proof = formData.get("paymentProof");

  if (!(proof instanceof File) || proof.size === 0) {
    return { ok: false, error: "Bukti pembayaran wajib dipilih." };
  }

  if (proof.size > maxProofSize) {
    return { ok: false, error: "Ukuran bukti pembayaran maksimal 5 MB." };
  }

  if (!(proof.type in proofMimeTypes)) {
    return { ok: false, error: "Format bukti pembayaran tidak didukung." };
  }

  const bytes = new Uint8Array(await proof.arrayBuffer());

  if (!hasValidFileSignature(bytes, proof.type)) {
    return { ok: false, error: "Format bukti pembayaran tidak didukung." };
  }

  const extension = proofMimeTypes[proof.type as keyof typeof proofMimeTypes];
  const proofPath = `orders/${order.id}/${crypto.randomUUID()}.${extension}`;
  const storage = supabase.storage.from("payment-proofs");
  const { error: uploadError } = await storage.upload(proofPath, bytes, {
    contentType: proof.type,
    upsert: false,
  });

  if (uploadError) {
    return {
      ok: false,
      error: "Pembayaran gagal dikirim. Silakan coba lagi.",
    };
  }

  const { data, error } = await supabase
    .from("orders")
    .update({
      payment_method: "transfer",
      payment_proof_path: proofPath,
      status: "menunggu_verifikasi",
    })
    .eq("id", order.id)
    .eq("order_kind", "service")
    .eq("status", "menunggu_pembayaran_dp")
    .is("payment_method", null)
    .select("id")
    .maybeSingle<{ id: string }>();

  if (error || !data) {
    try {
      await storage.remove([proofPath]);
    } catch {
      // Cleanup is best-effort; never expose Storage failures to the customer.
    }

    return {
      ok: false,
      error: error
        ? "Pembayaran gagal dikirim. Silakan coba lagi."
        : "Pesanan tidak dapat menerima pembayaran saat ini.",
    };
  }

  return { ok: true, orderId: data.id };
}

export async function submitPublicServicePayment(
  token: string,
  formData: FormData,
): Promise<PublicPaymentResult> {
  try {
    return await submitPublicServicePaymentInternal(token, formData);
  } catch {
    return {
      ok: false,
      error: "Pembayaran gagal dikirim. Silakan coba lagi.",
    };
  }
}
