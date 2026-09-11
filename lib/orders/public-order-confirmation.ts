import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

type ConfirmationRow = {
  id: string;
  order_code: string;
  order_kind: "service" | "product";
  status: string;
  services: { slug: string } | null;
  service_name_snapshot: string | null;
  service_flow: string | null;
  material: string | null;
  job_description: string | null;
  design_description: string | null;
  product_name_snapshot: string | null;
  product_sleeve_type: string | null;
  product_size: string | null;
  quantity: number;
  unit_price: number | string | null;
  price: number | string | null;
  payment_method: "transfer" | "cod" | null;
};

export type PublicOrderVariantSize = {
  size: string;
  quantity: number;
};

export type PublicOrderVariant = {
  variant_type: string | null;
  material: string;
  sleeve_type: string;
  quantity: number;
  sizes: PublicOrderVariantSize[];
};

type PublicOrderVariantRow = Omit<PublicOrderVariant, "sizes"> & {
  id: string;
  order_service_variant_sizes: PublicOrderVariantSize[];
};

export type PublicOrderConfirmation = Omit<
  ConfirmationRow,
  "id" | "services" | "unit_price" | "price"
> & {
  service_slug: string | null;
  unit_price: number | null;
  price: number | null;
  design_reference_count: number;
  service_variants: PublicOrderVariant[];
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
      "id, order_code, order_kind, status, services(slug), service_name_snapshot, service_flow, material, job_description, design_description, product_name_snapshot, product_sleeve_type, product_size, quantity, unit_price, price, payment_method",
    )
    .eq("payment_token", token)
    .in("order_kind", ["service", "product"])
    .maybeSingle<ConfirmationRow>();

  if (error || !data) return null;

  const price = data.price === null ? null : Number(data.price);
  const unitPrice = data.unit_price === null ? null : Number(data.unit_price);
  if (price !== null && !Number.isFinite(price)) return null;
  if (unitPrice !== null && !Number.isFinite(unitPrice)) return null;

  const { id: orderId, services, ...customerSafeData } = data;

  const [referenceResult, variantResult] = await Promise.all([
    supabase
      .from("order_design_references")
      .select("id", { count: "exact", head: true })
      .eq("order_id", orderId),
    supabase
      .from("order_service_variants")
      .select("id, variant_type, material, sleeve_type, quantity, order_service_variant_sizes(size, quantity)")
      .eq("order_id", orderId)
      .order("created_at", { ascending: true })
      .returns<PublicOrderVariantRow[]>(),
  ]);

  if (referenceResult.error || variantResult.error || !variantResult.data) return null;

  return {
    ...customerSafeData,
    service_slug: services?.slug ?? null,
    unit_price: unitPrice,
    price,
    design_reference_count: referenceResult.count ?? 0,
    service_variants: variantResult.data.map((variant) => ({
      variant_type: variant.variant_type,
      material: variant.material,
      sleeve_type: variant.sleeve_type,
      quantity: variant.quantity,
      sizes: variant.order_service_variant_sizes,
    })),
  };
}
