"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/require-admin";
import {
  validateContentImageUpload,
  validateContentImageValue,
} from "@/lib/content/content-image-upload";
import { getAdminProductById } from "@/lib/products/admin-products";
import { adminProductSizes } from "@/lib/products/product-sizes";
import { createClient } from "@/lib/supabase/server";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type ProductField =
  | "name"
  | "description"
  | "image_url"
  | "product_image"
  | "sort_order"
  | "available_sizes";

export type ProductFormState = {
  status: "idle" | "success" | "error";
  message: string | null;
  errors: Partial<Record<ProductField, string>>;
};

function readText(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function hasHtml(value: string) {
  return /<\/?[a-z][^>]*>/i.test(value);
}

function readAvailableSizes(formData: FormData) {
  const submitted = formData.getAll("available_sizes");
  if (submitted.some((value) => typeof value !== "string")) return null;

  const sizes = submitted.map((value) => String(value).trim());
  const allowedSizes = new Set<string>(adminProductSizes);

  if (
    sizes.some((size) => !allowedSizes.has(size)) ||
    new Set(sizes).size !== sizes.length
  ) {
    return null;
  }

  const selectedSizes = new Set(sizes);
  return adminProductSizes.filter((size) => selectedSizes.has(size));
}

function revalidateProductRoutes(productId: string, slug: string) {
  revalidatePath("/admin/konten/produk");
  revalidatePath(`/admin/konten/produk/${productId}`);
  revalidatePath("/produk");
  revalidatePath(`/produk/${slug}/checkout`);
  revalidatePath("/");
}

export async function updateProduct(
  productId: string,
  _previousState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  await requireAdmin();

  if (!uuidPattern.test(productId)) {
    return { status: "error", message: "Produk tidak valid.", errors: {} };
  }

  let existingProduct;
  try {
    existingProduct = await getAdminProductById(productId);
  } catch (error) {
    console.error("[cms] Existing product read failed", {
      productId,
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return {
      status: "error",
      message: "Produk gagal diperiksa. Silakan coba lagi.",
      errors: {},
    };
  }

  if (!existingProduct) {
    return { status: "error", message: "Produk tidak ditemukan.", errors: {} };
  }

  const name = readText(formData, "name");
  const description = readText(formData, "description");
  const imageUrl = readText(formData, "image_url");
  const sortOrderText = readText(formData, "sort_order");
  const sortOrder = /^\d+$/.test(sortOrderText)
    ? Number(sortOrderText)
    : Number.NaN;
  const isActive = formData.get("is_active") === "on";
  const availableSizes = readAvailableSizes(formData);
  const errors: ProductFormState["errors"] = {};

  if (!name) errors.name = "Nama produk wajib diisi.";
  else if (name.length > 160) {
    errors.name = "Nama produk maksimal 160 karakter.";
  } else if (hasHtml(name)) {
    errors.name = "Nama produk tidak boleh berisi HTML.";
  }

  if (description.length > 2000) {
    errors.description = "Deskripsi maksimal 2.000 karakter.";
  } else if (hasHtml(description)) {
    errors.description = "Deskripsi tidak boleh berisi HTML.";
  }

  if (
    !Number.isSafeInteger(sortOrder) ||
    sortOrder < 0 ||
    sortOrder > 100000
  ) {
    errors.sort_order =
      "Urutan tampil harus berupa bilangan bulat antara 0 dan 100.000.";
  }

  if (!availableSizes || availableSizes.length === 0) {
    errors.available_sizes =
      "Pilih minimal satu ukuran tanpa duplikasi dari pilihan yang tersedia.";
  }

  const imageValueError = validateContentImageValue(imageUrl, "products");
  if (imageValueError) errors.image_url = imageValueError;

  const { image: productImage, error: productImageError } =
    await validateContentImageUpload(formData.get("product_image"));
  if (productImageError) errors.product_image = productImageError;

  if (Object.keys(errors).length > 0) {
    return {
      status: "error",
      message: "Periksa kembali field yang ditandai.",
      errors,
    };
  }

  const supabase = await createClient();
  let uploadedPath: string | null = null;
  let nextImageUrl = imageUrl || null;

  if (productImage) {
    uploadedPath = `products/${crypto.randomUUID()}.${productImage.extension}`;
    const { error: uploadError } = await supabase.storage
      .from("content-images")
      .upload(uploadedPath, productImage.bytes, {
        contentType: productImage.file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("[cms] Product image upload failed", {
        productId,
        code: uploadError.name,
        message: uploadError.message,
      });
      return {
        status: "error",
        message: "Gambar produk gagal diunggah. Silakan coba lagi.",
        errors: {},
      };
    }

    nextImageUrl = uploadedPath;
  }

  const { data, error } = await supabase
    .from("products")
    .update({
      name,
      description: description || null,
      image_url: nextImageUrl,
      is_active: isActive,
      sort_order: sortOrder,
      available_sizes: availableSizes,
    })
    .eq("id", existingProduct.id)
    .select("id")
    .maybeSingle<{ id: string }>();

  if (error || !data) {
    if (uploadedPath) {
      await supabase.storage.from("content-images").remove([uploadedPath]);
    }

    if (error) {
      console.error("[cms] Product update failed", {
        productId,
        code: error.code,
        message: error.message,
      });
    }

    return {
      status: "error",
      message: data
        ? "Produk gagal disimpan. Silakan coba lagi."
        : "Produk tidak ditemukan atau gagal diperbarui.",
      errors: {},
    };
  }

  revalidateProductRoutes(existingProduct.id, existingProduct.slug);

  return {
    status: "success",
    message: "Produk berhasil disimpan.",
    errors: {},
  };
}
