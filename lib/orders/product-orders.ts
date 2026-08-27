import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

export type ProductPaymentMethod = "transfer" | "cod";

export type ProductOrderInput = {
  productId: string;
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
  available_sizes: string[];
};

type CreatedProductOrder = {
  payment_token: string;
};

type ConfirmationRow = Omit<ProductOrderConfirmation, "price"> & {
  price: number | string;
};

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function createProductOrder(
  input: ProductOrderInput,
): Promise<{ paymentToken: string }> {
  if (!uuidPattern.test(input.productId)) {
    throw new Error("PRODUCT_UNAVAILABLE");
  }

  const supabase = createAdminClient();
  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id, available_sizes")
    .eq("id", input.productId)
    .eq("is_active", true)
    .maybeSingle<ActiveProductForOrder>();

  if (productError) {
    throw new Error("ORDER_CREATE_FAILED");
  }

  if (!product) {
    throw new Error("PRODUCT_UNAVAILABLE");
  }

  if (!product.available_sizes.includes(input.productSize)) {
    throw new Error("INVALID_SIZE");
  }

  const { data, error } = await supabase
    .from("orders")
    .insert({
      order_kind: "product",
      product_id: product.id,
      product_size: input.productSize,
      quantity: input.quantity,
      customer_name: input.customerName,
      customer_whatsapp: input.customerWhatsapp,
      payment_method: input.paymentMethod,
    })
    .select("payment_token")
    .single<CreatedProductOrder>();

  if (error || !data?.payment_token) {
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
