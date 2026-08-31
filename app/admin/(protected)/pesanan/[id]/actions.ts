"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth/require-admin";
import { getAdminDesignReferenceSignedUrl } from "@/lib/orders/admin-design-reference";
import { getAdminPaymentProofSignedUrl } from "@/lib/orders/admin-payment";
import {
  getNextOrderStatus,
  isOrderCancellableStatus,
} from "@/lib/orders/order-workflows";
import { createClient } from "@/lib/supabase/server";

export type SetOrderPriceState = {
  error: string | null;
};

export type AdminPaymentActionState = {
  error: string | null;
};

export type PaymentProofLinkState = {
  error: string | null;
  signedUrl: string | null;
};

export type DesignReferenceLinkState = PaymentProofLinkState;

export type AdvanceOrderStatusState = {
  error: string | null;
};

export type CancelOrderState = {
  error: string | null;
};

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function setOrderPrice(
  orderId: string,
  _previousState: SetOrderPriceState,
  formData: FormData,
): Promise<SetOrderPriceState> {
  await requireAdmin();

  if (!uuidPattern.test(orderId)) {
    return { error: "Pesanan tidak valid." };
  }

  const submittedPrice = formData.get("totalPrice");

  if (typeof submittedPrice !== "string" || submittedPrice.trim() === "") {
    return { error: "Total harga wajib diisi." };
  }

  const normalizedPrice = submittedPrice.trim();

  if (!/^\d+$/.test(normalizedPrice)) {
    return { error: "Total harga tidak valid." };
  }

  const price = Number(normalizedPrice);

  if (!Number.isSafeInteger(price) || price <= 0) {
    return { error: "Total harga tidak valid." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .update({
      price,
      status: "menunggu_pembayaran_dp",
    })
    .eq("id", orderId)
    .eq("order_kind", "service")
    .eq("status", "menunggu_harga")
    .select("id")
    .maybeSingle<{ id: string }>();

  if (error) {
    console.error("Failed to set service order quotation", {
      orderId,
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });

    return {
      error: "Harga pesanan gagal disimpan. Silakan coba lagi.",
    };
  }

  if (!data) {
    return {
      error: "Pesanan sudah berubah atau tidak dapat diberi harga.",
    };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/pesanan");
  revalidatePath(`/admin/pesanan/${orderId}`);
  redirect(`/admin/pesanan/${orderId}`);
}

export async function createPaymentProofLink(
  orderId: string,
  _previousState: PaymentProofLinkState,
  _formData: FormData,
): Promise<PaymentProofLinkState> {
  void _previousState;
  void _formData;
  const result = await getAdminPaymentProofSignedUrl(orderId);

  if (!result.ok) {
    return { error: result.error, signedUrl: null };
  }

  return { error: null, signedUrl: result.signedUrl };
}

export async function createDesignReferenceLink(
  orderId: string,
  _previousState: DesignReferenceLinkState,
  _formData: FormData,
): Promise<DesignReferenceLinkState> {
  void _previousState;
  void _formData;
  const result = await getAdminDesignReferenceSignedUrl(orderId);

  if (!result.ok) {
    return { error: result.error, signedUrl: null };
  }

  return { error: null, signedUrl: result.signedUrl };
}

export async function verifyTransferPayment(
  orderId: string,
  _previousState: AdminPaymentActionState,
  _formData: FormData,
): Promise<AdminPaymentActionState> {
  void _previousState;
  void _formData;
  await requireAdmin();

  if (!uuidPattern.test(orderId)) {
    return {
      error: "Status pesanan sudah berubah atau pembayaran tidak dapat diverifikasi.",
    };
  }

  const supabase = await createClient();
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("order_kind, service_flow")
    .eq("id", orderId)
    .in("order_kind", ["service", "product"])
    .eq("payment_method", "transfer")
    .eq("status", "menunggu_verifikasi")
    .not("payment_proof_path", "is", null)
    .maybeSingle<{
      order_kind: "service" | "product";
      service_flow: string | null;
    }>();

  if (orderError) {
    return {
      error: "Pembayaran gagal diverifikasi. Silakan coba lagi.",
    };
  }

  if (!order) {
    return {
      error: "Status pesanan sudah berubah atau pembayaran tidak dapat diverifikasi.",
    };
  }

  const nextStatus =
    order.order_kind === "product"
      ? "diproses"
      : order.service_flow === "konveksi_sablon"
        ? "sample_mockup"
        : order.service_flow === "permak"
          ? "diterima"
          : null;

  if (!nextStatus) {
    return {
      error: "Pembayaran gagal diverifikasi. Silakan coba lagi.",
    };
  }

  let updateQuery = supabase
    .from("orders")
    .update({ status: nextStatus })
    .eq("id", orderId)
    .eq("order_kind", order.order_kind)
    .eq("payment_method", "transfer")
    .eq("status", "menunggu_verifikasi")
    .not("payment_proof_path", "is", null);

  if (order.order_kind === "service") {
    updateQuery = updateQuery.eq("service_flow", order.service_flow);
  }

  const { data, error } = await updateQuery
    .select("id")
    .maybeSingle<{ id: string }>();

  if (error) {
    return {
      error: "Pembayaran gagal diverifikasi. Silakan coba lagi.",
    };
  }

  if (!data) {
    return {
      error: "Status pesanan sudah berubah atau pembayaran tidak dapat diverifikasi.",
    };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/pesanan");
  revalidatePath(`/admin/pesanan/${orderId}`);
  redirect(`/admin/pesanan/${orderId}`);
}

export async function confirmCodPayment(
  orderId: string,
  _previousState: AdminPaymentActionState,
  _formData: FormData,
): Promise<AdminPaymentActionState> {
  void _previousState;
  void _formData;
  await requireAdmin();

  if (!uuidPattern.test(orderId)) {
    return {
      error: "Status pesanan sudah berubah atau pembayaran tidak dapat diverifikasi.",
    };
  }

  const supabase = await createClient();
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("service_flow")
    .eq("id", orderId)
    .eq("order_kind", "service")
    .eq("payment_method", "cod")
    .eq("status", "menunggu_konfirmasi_dp")
    .maybeSingle<{ service_flow: string | null }>();

  if (orderError) {
    return { error: "Konfirmasi COD gagal. Silakan coba lagi." };
  }

  if (!order) {
    return {
      error: "Status pesanan sudah berubah atau pembayaran tidak dapat diverifikasi.",
    };
  }

  const nextStatus =
    order.service_flow === "konveksi_sablon"
      ? "sample_mockup"
      : order.service_flow === "permak"
        ? "diterima"
        : null;

  if (!nextStatus) {
    return { error: "Konfirmasi COD gagal. Silakan coba lagi." };
  }

  const { data, error } = await supabase
    .from("orders")
    .update({ status: nextStatus })
    .eq("id", orderId)
    .eq("order_kind", "service")
    .eq("service_flow", order.service_flow)
    .eq("payment_method", "cod")
    .eq("status", "menunggu_konfirmasi_dp")
    .select("id")
    .maybeSingle<{ id: string }>();

  if (error) {
    return { error: "Konfirmasi COD gagal. Silakan coba lagi." };
  }

  if (!data) {
    return {
      error: "Status pesanan sudah berubah atau pembayaran tidak dapat diverifikasi.",
    };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/pesanan");
  revalidatePath(`/admin/pesanan/${orderId}`);
  redirect(`/admin/pesanan/${orderId}`);
}

export async function advanceOrderStatus(
  orderId: string,
  _previousState: AdvanceOrderStatusState,
  _formData: FormData,
): Promise<AdvanceOrderStatusState> {
  void _previousState;
  void _formData;
  await requireAdmin();

  if (!uuidPattern.test(orderId)) {
    return {
      error: "Status pesanan sudah berubah. Muat ulang halaman dan coba lagi.",
    };
  }

  const supabase = await createClient();
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("order_kind, service_flow, status")
    .eq("id", orderId)
    .maybeSingle<{
      order_kind: "service" | "product";
      service_flow: string | null;
      status: string;
    }>();

  if (orderError) {
    return {
      error: "Status pesanan gagal diperbarui. Silakan coba lagi.",
    };
  }

  if (!order) {
    return {
      error: "Status pesanan sudah berubah. Muat ulang halaman dan coba lagi.",
    };
  }

  const nextStatus = getNextOrderStatus(order);

  if (!nextStatus) {
    return {
      error: "Status pesanan gagal diperbarui. Silakan coba lagi.",
    };
  }

  let updateQuery = supabase
    .from("orders")
    .update({ status: nextStatus })
    .eq("id", orderId)
    .eq("order_kind", order.order_kind)
    .eq("status", order.status);

  if (order.order_kind === "service") {
    updateQuery = updateQuery.eq("service_flow", order.service_flow);
  }

  const { data, error } = await updateQuery
    .select("id")
    .maybeSingle<{ id: string }>();

  if (error) {
    return {
      error: "Status pesanan gagal diperbarui. Silakan coba lagi.",
    };
  }

  if (!data) {
    return {
      error: "Status pesanan sudah berubah. Muat ulang halaman dan coba lagi.",
    };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/pesanan");
  revalidatePath(`/admin/pesanan/${orderId}`);
  redirect(`/admin/pesanan/${orderId}`);
}

export async function cancelOrder(
  orderId: string,
  expectedStatus: string,
  _previousState: CancelOrderState,
  _formData: FormData,
): Promise<CancelOrderState> {
  void _previousState;
  void _formData;
  await requireAdmin();

  if (
    !uuidPattern.test(orderId) ||
    !isOrderCancellableStatus(expectedStatus)
  ) {
    return {
      error: "Pesanan tidak dapat dibatalkan dari status saat ini.",
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .update({ status: "dibatalkan" })
    .eq("id", orderId)
    .eq("status", expectedStatus)
    .select("id")
    .maybeSingle<{ id: string }>();

  if (error) {
    return {
      error:
        "Pesanan gagal dibatalkan. Status ini mungkin tidak mengizinkan pembatalan.",
    };
  }

  if (!data) {
    return {
      error: "Status pesanan sudah berubah. Muat ulang halaman lalu coba lagi.",
    };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/pesanan");
  revalidatePath("/admin/pesanan/" + orderId);
  redirect("/admin/pesanan/" + orderId);
}

export async function confirmProductCodOrder(
  orderId: string,
  _previousState: AdminPaymentActionState,
  _formData: FormData,
): Promise<AdminPaymentActionState> {
  void _previousState;
  void _formData;
  await requireAdmin();

  if (!uuidPattern.test(orderId)) {
    return {
      error: "Status pesanan sudah berubah atau pesanan COD tidak dapat dikonfirmasi.",
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .update({ status: "diproses" })
    .eq("id", orderId)
    .eq("order_kind", "product")
    .eq("payment_method", "cod")
    .eq("status", "menunggu_verifikasi")
    .select("id")
    .maybeSingle<{ id: string }>();

  if (error) {
    return { error: "Konfirmasi pesanan COD gagal. Silakan coba lagi." };
  }

  if (!data) {
    return {
      error: "Status pesanan sudah berubah atau pesanan COD tidak dapat dikonfirmasi.",
    };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/pesanan");
  revalidatePath(`/admin/pesanan/${orderId}`);
  redirect(`/admin/pesanan/${orderId}`);
}
