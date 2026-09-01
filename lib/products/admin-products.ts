import "server-only";

import { createClient } from "@/lib/supabase/server";

export type AdminProductVariant = {
  id: string;
  product_id: string;
  material: string;
  sleeve_type: string | null;
  base_unit_price: number;
  large_size_surcharge: number;
  is_active: boolean;
};

export type AdminProduct = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price: number;
  available_sizes: string[];
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
  variants: AdminProductVariant[];
};

type AdminProductRow = Omit<AdminProduct, "price" | "sort_order" | "variants"> & {
  price: number | string;
  sort_order: number | string;
};

type AdminProductVariantRow = Omit<
  AdminProductVariant,
  "base_unit_price" | "large_size_surcharge"
> & {
  base_unit_price: number | string;
  large_size_surcharge: number | string;
};

const adminProductColumns =
  "id, slug, name, description, price, available_sizes, image_url, is_active, sort_order";

function normalizeVariant(row: AdminProductVariantRow): AdminProductVariant {
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
  row: AdminProductRow,
  variants: AdminProductVariant[],
): AdminProduct {
  const price = Number(row.price);
  const sortOrder = Number(row.sort_order);

  if (!Number.isFinite(price) || price < 0) {
    throw new Error("Invalid product price returned by the database.");
  }
  if (!Number.isSafeInteger(sortOrder) || sortOrder < 0) {
    throw new Error("Invalid product sort order returned by the database.");
  }

  return {
    ...row,
    price,
    sort_order: sortOrder,
    available_sizes: row.available_sizes.filter(
      (size): size is string => typeof size === "string" && size.trim() !== "",
    ),
    variants,
  };
}

async function getAdminProductVariants(productIds: string[]) {
  if (productIds.length === 0) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("product_variants")
    .select(
      "id, product_id, material, sleeve_type, base_unit_price, large_size_surcharge, is_active",
    )
    .in("product_id", productIds)
    .order("material", { ascending: true })
    .order("sleeve_type", { ascending: true })
    .returns<AdminProductVariantRow[]>();

  if (error || !data) {
    throw new Error("Varian produk gagal dimuat.");
  }

  return data.map(normalizeVariant);
}

export async function getAdminProducts(): Promise<AdminProduct[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(adminProductColumns)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true })
    .returns<AdminProductRow[]>();

  if (error || !data) {
    throw new Error("Daftar produk gagal dimuat.");
  }

  const variants = await getAdminProductVariants(data.map((product) => product.id));

  return data.map((product) =>
    normalizeProduct(
      product,
      variants.filter((variant) => variant.product_id === product.id),
    ),
  );
}

export async function getAdminProductById(
  id: string,
): Promise<AdminProduct | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(adminProductColumns)
    .eq("id", id)
    .maybeSingle<AdminProductRow>();

  if (error) {
    throw new Error("Produk gagal dimuat.");
  }
  if (!data) return null;

  const variants = await getAdminProductVariants([data.id]);
  return normalizeProduct(data, variants);
}
