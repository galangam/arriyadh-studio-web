import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

type ConfirmationRow = {
  id: string;
  order_code: string;
  order_kind: "service" | "product";
  status: string;
  service_name_snapshot: string | null;
  service_flow: string | null;
  material: string | null;
  job_description: string | null;
  design_description: string | null;
  product_name_snapshot: string | null;
  product_size: string | null;
  quantity: number;
  price: number | string | null;
  payment_method: "transfer" | "cod" | null;
};

export type PublicOrderConfirmation = Omit<
  ConfirmationRow,
  "id" | "price"
> & {
  price: number | null;
  design_reference_count: number;
};

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getPublicOrderConfirmation(
  token: string,
): Promise<PublicOrderConfirmation | null> {
  if (!uuidPattern.test(token)) return null;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, order_code, order_kind, status, service_name_snapshot, service_flow, material, job_description, design_description, product_name_snapshot, product_size, quantity, price, payment_method",
    )
    .eq("payment_token", token)
    .in("order_kind", ["service", "product"])
    .maybeSingle<ConfirmationRow>();

  if (error || !data) return null;

  const price = data.price === null ? null : Number(data.price);
  if (price !== null && !Number.isFinite(price)) return null;

  const { id: orderId, ...customerSafeData } = data;

  const { count: designReferenceCount, error: referenceError } = await supabase
    .from("order_design_references")
    .select("id", { count: "exact", head: true })
    .eq("order_id", orderId);

  if (referenceError) return null;

  return {
    ...customerSafeData,
    price,
    design_reference_count: designReferenceCount ?? 0,
  };
}
