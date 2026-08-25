import "server-only";

import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";

export type AdminProofUrlResult =
  | { ok: true; signedUrl: string }
  | { ok: false; error: string };

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getAdminPaymentProofSignedUrl(
  orderId: string,
): Promise<AdminProofUrlResult> {
  await requireAdmin();

  if (!uuidPattern.test(orderId)) {
    return { ok: false, error: "Bukti pembayaran tidak tersedia." };
  }

  const supabase = await createClient();
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("order_kind, payment_method, payment_proof_path")
    .eq("id", orderId)
    .in("order_kind", ["service", "product"])
    .eq("payment_method", "transfer")
    .not("payment_proof_path", "is", null)
    .maybeSingle<{ payment_proof_path: string }>();

  if (orderError || !order?.payment_proof_path) {
    return { ok: false, error: "Bukti pembayaran tidak tersedia." };
  }

  const { data, error } = await supabase.storage
    .from("payment-proofs")
    .createSignedUrl(order.payment_proof_path, 300);

  if (error || !data?.signedUrl) {
    return { ok: false, error: "Bukti pembayaran tidak tersedia." };
  }

  return { ok: true, signedUrl: data.signedUrl };
}
