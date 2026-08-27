import "server-only";

import { createClient } from "@/lib/supabase/server";

export type PublicProduct = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price: number;
  available_sizes: string[];
  image_url: string | null;
};

type ProductRow = Omit<PublicProduct, "price"> & {
  price: number | string;
};

const productColumns =
  "id, slug, name, description, price, available_sizes, image_url";

function normalizeProduct(row: ProductRow): PublicProduct {
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
  };
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

  return data.map(normalizeProduct);
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

  return data ? normalizeProduct(data) : null;
}
