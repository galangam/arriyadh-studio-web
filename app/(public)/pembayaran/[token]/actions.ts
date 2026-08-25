"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { submitPublicServicePayment } from "@/lib/orders/public-payment";

export type PaymentSubmissionState = {
  error: string | null;
};

export async function submitPayment(
  token: string,
  _previousState: PaymentSubmissionState,
  formData: FormData,
): Promise<PaymentSubmissionState> {
  const result = await submitPublicServicePayment(token, formData);

  if (!result.ok) {
    return { error: result.error };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/pesanan");
  revalidatePath(`/admin/pesanan/${result.orderId}`);
  revalidatePath(`/pembayaran/${token}`);
  redirect(`/pembayaran/${token}`);
}
