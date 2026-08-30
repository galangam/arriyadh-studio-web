import "server-only";

import type { ProductVariant } from "@/lib/products/product-pricing";
import { createClient } from "@/lib/supabase/server";

export type PublicProduct = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price: number;
  available_sizes: string[];
  image_url: string | null;
  variants: ProductVariant[];
};

type ProductRow = Omit<PublicProduct, "price" | "variants"> & {
  price: number | string;
};

type ProductVariantRow = Omit<
  ProductVariant,
  "base_unit_price" | "large_size_surcharge"
> & {
  base_unit_price: number | string;
  large_size_surcharge: number | string;
};

const productColumns =
  "id, slug, name, description, price, available_sizes, image_url";

function normalizeVariant(row: ProductVariantRow): ProductVariant {
  const baseUnitPrice = Number(row.base_unit_price);
  const largeSizeSurcharge = Number(row.large_size_surcharge);

  if (
    !Number.isFinite(baseUnitPrice) ||
    baseUnitPrice < 0 ||
    !Number.isFinite(largeSizeSurcharge) ||
    largeSizeSurcharge < 0
  ) {
    throw new Error("Invalid product variant price returned by the database.");
  }

  return {
    ...row,
    base_unit_price: baseUnitPrice,
    large_size_surcharge: largeSizeSurcharge,
  };
}

function normalizeProduct(
  row: ProductRow,
  variants: ProductVariant[],
): PublicProduct {
  const price = Number(row.price);

  if (!Number.isFinite(price) || price < 0) {
    throw new Error("Invalid product price returned by the database.");
  }

  return {
    ...row,
    price,
    available_sizes: row.available_sizes.filter(
      (size): size is string => typeof size === "string" && size.trim() !== "",
    ),
    variants,
  };
}

async function getActiveVariants(productIds: string[]) {
  if (productIds.length === 0) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("product_variants")
    .select(
      "id, product_id, material, sleeve_type, base_unit_price, large_size_surcharge",
    )
    .in("product_id", productIds)
    .eq("is_active", true)
    .order("material", { ascending: true })
    .order("sleeve_type", { ascending: true })
    .returns<ProductVariantRow[]>();

  if (error || !data) {
    throw new Error("Active product variants could not be loaded.");
  }

  return data.map(normalizeVariant);
}

export async function getActiveProducts(): Promise<PublicProduct[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(productColumns)
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true })
    .returns<ProductRow[]>();

  if (error || !data) {
    throw new Error("Active products could not be loaded.");
  }

  const variants = await getActiveVariants(data.map((product) => product.id));

  return data.map((product) =>
    normalizeProduct(
      product,
      variants.filter((variant) => variant.product_id === product.id),
    ),
  );
}

export async function getActiveProductBySlug(
  slug: string,
): Promise<PublicProduct | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(productColumns)
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle<ProductRow>();

  if (error) {
    throw new Error("Product could not be loaded.");
  }

  if (!data) return null;

  const variants = await getActiveVariants([data.id]);
  return normalizeProduct(data, variants);
}
