import "server-only";

import {
  calculateProductUnitPrice,
  findProductVariant,
  type ProductVariant,
} from "@/lib/products/product-pricing";
import { createAdminClient } from "@/lib/supabase/admin";

export type ProductPaymentMethod = "transfer" | "cod";

export type ProductOrderInput = {
  productId: string;
  productMaterial: string;
  productSleeveType: string;
  productSize: string;
  quantity: number;
  customerName: string;
  customerWhatsapp: string;
  paymentMethod: ProductPaymentMethod;
};

export type ProductOrderConfirmation = {
  order_code: string;
  product_name_snapshot: string;
  product_size: string;
  quantity: number;
  price: number;
  payment_method: ProductPaymentMethod;
};

type ActiveProductForOrder = {
  id: string;
  price: number | string;
  available_sizes: string[];
};

type ProductVariantRow = Omit<
  ProductVariant,
  "base_unit_price" | "large_size_surcharge"
> & {
  base_unit_price: number | string;
  large_size_surcharge: number | string;
  is_active: boolean;
};

type CreatedProductOrder = {
  payment_token: string;
};

type ConfirmationRow = Omit<ProductOrderConfirmation, "price"> & {
  price: number | string;
};

type SupabaseErrorMetadata = {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
  constraint?: string;
};

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function logProductOrderDatabaseError(
  operation: string,
  error: SupabaseErrorMetadata,
) {
  console.error("Product order database operation failed", {
    operation,
    code: error.code,
    message: error.message,
    details: error.details,
    hint: error.hint,
    constraint: error.constraint,
  });
}

export async function createProductOrder(
  input: ProductOrderInput,
): Promise<{ paymentToken: string }> {
  if (!uuidPattern.test(input.productId)) {
    throw new Error("PRODUCT_UNAVAILABLE");
  }

  const supabase = createAdminClient();
  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id, price, available_sizes")
    .eq("id", input.productId)
    .eq("is_active", true)
    .maybeSingle<ActiveProductForOrder>();

  if (productError) {
    logProductOrderDatabaseError("active product lookup", productError);
    throw new Error("ORDER_CREATE_FAILED");
  }

  if (!product) {
    throw new Error("PRODUCT_UNAVAILABLE");
  }

  if (!product.available_sizes.includes(input.productSize)) {
    throw new Error("INVALID_SIZE");
  }

  const { data: variantRows, error: variantError } = await supabase
    .from("product_variants")
    .select(
      "id, product_id, material, sleeve_type, base_unit_price, large_size_surcharge, is_active",
    )
    .eq("product_id", product.id)
    .returns<ProductVariantRow[]>();

  if (variantError || !variantRows) {
    if (variantError) {
      logProductOrderDatabaseError("product variant lookup", variantError);
    }
    throw new Error("ORDER_CREATE_FAILED");
  }

  const variants = variantRows
    .filter((variant) => variant.is_active)
    .map((variant) => ({
      id: variant.id,
      product_id: variant.product_id,
      material: variant.material,
      sleeve_type: variant.sleeve_type,
      base_unit_price: Number(variant.base_unit_price),
      large_size_surcharge: Number(variant.large_size_surcharge),
    }));
  const variant = findProductVariant(
    variants,
    input.productMaterial,
    input.productSleeveType,
  );

  if (variantRows.length > 0 && !variant) {
    const materialExists = variants.some(
      (candidate) => candidate.material === input.productMaterial,
    );
    throw new Error(materialExists ? "INVALID_SLEEVE" : "INVALID_MATERIAL");
  }

  const unitPrice = variant
    ? calculateProductUnitPrice(variant, input.productSize)
    : Number(product.price);
  const total = unitPrice * input.quantity;

  if (
    !Number.isSafeInteger(unitPrice) ||
    unitPrice < 0 ||
    !Number.isSafeInteger(total) ||
    total < 0
  ) {
    throw new Error("ORDER_CREATE_FAILED");
  }

  const { data, error } = await supabase
    .from("orders")
    .insert({
      order_kind: "product",
      product_id: product.id,
      material: variant?.material ?? null,
      product_sleeve_type: variant?.sleeve_type ?? null,
      product_size: input.productSize,
      quantity: input.quantity,
      unit_price: unitPrice,
      price: total,
      customer_name: input.customerName,
      customer_whatsapp: input.customerWhatsapp,
      payment_method: input.paymentMethod,
    })
    .select("payment_token")
    .single<CreatedProductOrder>();

  if (error || !data?.payment_token) {
    if (error) {
      logProductOrderDatabaseError("product order insert", error);
    }
    throw new Error("ORDER_CREATE_FAILED");
  }

  return { paymentToken: data.payment_token };
}

export async function getProductOrderConfirmation(
  paymentToken: string,
): Promise<ProductOrderConfirmation | null> {
  if (!uuidPattern.test(paymentToken)) return null;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .select(
      "order_code, product_name_snapshot, product_size, quantity, price, payment_method",
    )
    .eq("payment_token", paymentToken)
    .eq("order_kind", "product")
    .maybeSingle<ConfirmationRow>();

  if (error || !data) return null;

  const price = Number(data.price);
  if (!Number.isFinite(price)) return null;

  return { ...data, price };
}
