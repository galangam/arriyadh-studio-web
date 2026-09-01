import "server-only";

import { connection } from "next/server";

import { isOrderStatus, type OrderStatus } from "@/lib/orders/order-status";
import { createAdminClient } from "@/lib/supabase/admin";

const orderCodePattern = /^ARS-[0-9]{6}-[A-F0-9]{12}$/;

type TrackingPaymentMethod = "transfer" | "cod";

export type TrackingVariantSize = {
  size: string;
  quantity: number;
};

export type TrackingServiceVariant = {
  variantType: string | null;
  material: string;
  sleeveType: string;
  quantity: number;
  sizes: TrackingVariantSize[];
};

type TrackingOrderCommon = {
  orderCode: string;
  status: OrderStatus;
  createdAt: string;
  quantity: number;
  price: number | null;
  paymentMethod: TrackingPaymentMethod | null;
  completedAt: string | null;
  cancelledAt: string | null;
};

export type TrackingServiceOrder = TrackingOrderCommon & {
  kind: "service";
  serviceName: string | null;
  serviceFlow: "konveksi_sablon" | "permak";
  material: string | null;
  dpAmount: number | null;
  variants: TrackingServiceVariant[];
  designReferenceCount: number;
};

export type TrackingProductOrder = TrackingOrderCommon & {
  kind: "product";
  productName: string | null;
  size: string | null;
  material: string | null;
  sleeveType: string | null;
  unitPrice: number | null;
};

export type TrackingOrder = TrackingServiceOrder | TrackingProductOrder;

export type TrackingLookupResult =
  | { ok: true; order: TrackingOrder }
  | { ok: false; reason: "invalid_input" | "not_found" | "unavailable" };

type TrackingOrderRow = {
  id: string;
  order_code: string;
  order_kind: string;
  status: string;
  service_name_snapshot: string | null;
  service_flow: string | null;
  material: string | null;
  product_name_snapshot: string | null;
  product_size: string | null;
  product_sleeve_type: string | null;
  quantity: number;
  unit_price: number | string | null;
  price: number | string | null;
  dp_amount: number | string | null;
  payment_method: string | null;
  created_at: string;
  completed_at: string | null;
  cancelled_at: string | null;
};

type TrackingServiceVariantRow = {
  variant_type: string | null;
  material: string;
  sleeve_type: string;
  quantity: number;
  order_service_variant_sizes: TrackingVariantSize[];
};

function normalizeOrderCode(value: string) {
  return value.trim().toUpperCase();
}

function maskOrderCode(orderCode: string) {
  return `${orderCode.slice(0, 11)}********${orderCode.slice(-4)}`;
}

function toOptionalMoney(value: number | string | null) {
  if (value === null) return null;
  const amount = Number(value);
  return Number.isSafeInteger(amount) && amount >= 0 ? amount : undefined;
}

function isValidQuantity(value: number) {
  return Number.isSafeInteger(value) && value > 0;
}

function isPaymentMethod(
  value: string | null,
): value is TrackingPaymentMethod | null {
  return value === null || value === "transfer" || value === "cod";
}

function logUnavailable(operation: string, orderCode: string, error?: unknown) {
  console.error("[tracking] Order lookup unavailable", {
    operation,
    orderCode: maskOrderCode(orderCode),
    message: error instanceof Error ? error.message : undefined,
  });
}

export async function getPublicTrackingOrder(
  submittedCode: string,
): Promise<TrackingLookupResult> {
  if (typeof submittedCode !== "string") {
    return { ok: false, reason: "invalid_input" };
  }

  const normalizedCode = normalizeOrderCode(submittedCode);

  if (normalizedCode.length !== 23 || !orderCodePattern.test(normalizedCode)) {
    return { ok: false, reason: "invalid_input" };
  }

  await connection();
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, order_code, order_kind, status, service_name_snapshot, service_flow, material, product_name_snapshot, product_size, product_sleeve_type, quantity, unit_price, price, dp_amount, payment_method, created_at, completed_at, cancelled_at",
    )
    .eq("order_code", normalizedCode)
    .maybeSingle<TrackingOrderRow>();

  if (error) {
    logUnavailable("parent", normalizedCode, error);
    return { ok: false, reason: "unavailable" };
  }
  if (!data) return { ok: false, reason: "not_found" };

  const price = toOptionalMoney(data.price);
  const unitPrice = toOptionalMoney(data.unit_price);
  const dpAmount = toOptionalMoney(data.dp_amount);

  if (
    !isOrderStatus(data.status) ||
    !isValidQuantity(data.quantity) ||
    !isPaymentMethod(data.payment_method) ||
    Number.isNaN(Date.parse(data.created_at)) ||
    price === undefined ||
    unitPrice === undefined ||
    dpAmount === undefined
  ) {
    logUnavailable("normalization", normalizedCode);
    return { ok: false, reason: "unavailable" };
  }

  const common: TrackingOrderCommon = {
    orderCode: data.order_code,
    status: data.status,
    createdAt: data.created_at,
    quantity: data.quantity,
    price,
    paymentMethod: data.payment_method,
    completedAt: data.completed_at,
    cancelledAt: data.cancelled_at,
  };

  if (data.order_kind === "product") {
    return {
      ok: true,
      order: {
        ...common,
        kind: "product",
        productName: data.product_name_snapshot,
        size: data.product_size,
        material: data.material,
        sleeveType: data.product_sleeve_type,
        unitPrice,
      },
    };
  }

  if (
    data.order_kind !== "service" ||
    (data.service_flow !== "konveksi_sablon" &&
      data.service_flow !== "permak")
  ) {
    logUnavailable("order-shape", normalizedCode);
    return { ok: false, reason: "unavailable" };
  }

  const [variantResult, referenceResult] = await Promise.all([
    supabase
      .from("order_service_variants")
      .select(
        "variant_type, material, sleeve_type, quantity, order_service_variant_sizes(size, quantity)",
      )
      .eq("order_id", data.id)
      .order("created_at", { ascending: true })
      .returns<TrackingServiceVariantRow[]>(),
    supabase
      .from("order_design_references")
      .select("id", { count: "exact", head: true })
      .eq("order_id", data.id),
  ]);

  if (
    variantResult.error ||
    !variantResult.data ||
    referenceResult.error ||
    referenceResult.count === null
  ) {
    logUnavailable("service-children", normalizedCode);
    return { ok: false, reason: "unavailable" };
  }

  const variants = variantResult.data.map((variant) => ({
    variantType: variant.variant_type,
    material: variant.material,
    sleeveType: variant.sleeve_type,
    quantity: variant.quantity,
    sizes: variant.order_service_variant_sizes.map((size) => ({
      size: size.size,
      quantity: size.quantity,
    })),
  }));

  if (
    variants.some(
      (variant) =>
        !variant.material ||
        !variant.sleeveType ||
        !isValidQuantity(variant.quantity) ||
        variant.sizes.some(
          (size) => !size.size || !isValidQuantity(size.quantity),
        ),
    )
  ) {
    logUnavailable("service-variant-shape", normalizedCode);
    return { ok: false, reason: "unavailable" };
  }

  return {
    ok: true,
    order: {
      ...common,
      kind: "service",
      serviceName: data.service_name_snapshot,
      serviceFlow: data.service_flow,
      material: variants.length === 0 ? data.material : null,
      dpAmount,
      variants,
      designReferenceCount: referenceResult.count,
    },
  };
}
