"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";

export type SetOrderPriceState = {
  error: string | null;
};

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function calculateDpAmount(price: number) {
  const dpAmount = Math.round(price / 2);
  const ratio = dpAmount / price;

  if (
    !Number.isSafeInteger(dpAmount) ||
    dpAmount <= 0 ||
    dpAmount > price ||
    ratio < 0.45 ||
    ratio > 0.55
  ) {
    return null;
  }

  return dpAmount;
}

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

  const dpAmount = calculateDpAmount(price);

  if (dpAmount === null) {
    return { error: "Total harga tidak valid." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .update({
      price,
      dp_amount: dpAmount,
      status: "menunggu_pembayaran_dp",
    })
    .eq("id", orderId)
    .eq("order_kind", "service")
    .eq("status", "menunggu_harga")
    .select("id")
    .maybeSingle<{ id: string }>();

  if (error) {
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
