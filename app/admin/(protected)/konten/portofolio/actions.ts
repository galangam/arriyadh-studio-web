"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/require-admin";
import { getAdminPortfolioItemById } from "@/lib/content/admin-portfolio";
import { validateContentImageUpload } from "@/lib/content/content-image-upload";
import { getAdminServiceById } from "@/lib/services/admin-services";
import { createClient } from "@/lib/supabase/server";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type PortfolioField =
  | "title"
  | "description"
  | "service_id"
  | "sort_order"
  | "portfolio_image";

export type PortfolioFormState = {
  status: "idle" | "success" | "error";
  message: string | null;
  errors: Partial<Record<PortfolioField, string>>;
};

export type DeletePortfolioState = {
  status: "idle" | "success" | "error";
  message: string | null;
};

type ValidatedFields = {
  title: string;
  description: string | null;
  serviceId: string | null;
  isPublished: boolean;
  sortOrder: number;
};

function readText(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function hasHtml(value: string) {
  return /<\/?[a-z][^>]*>/i.test(value);
}

async function validatePortfolioFields(formData: FormData): Promise<{
  fields: ValidatedFields | null;
  errors: PortfolioFormState["errors"];
}> {
  const title = readText(formData, "title");
  const description = readText(formData, "description");
  const serviceIdValue = readText(formData, "service_id");
  const serviceId = serviceIdValue || null;
  const sortOrderText = readText(formData, "sort_order");
  const sortOrder = /^\d+$/.test(sortOrderText)
    ? Number(sortOrderText)
    : Number.NaN;
  const isPublished = formData.get("is_published") === "on";
  const errors: PortfolioFormState["errors"] = {};

  if (!title) errors.title = "Judul portofolio wajib diisi.";
  else if (title.length > 180) {
    errors.title = "Judul portofolio maksimal 180 karakter.";
  } else if (hasHtml(title)) {
    errors.title = "Judul portofolio tidak boleh berisi HTML.";
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

  if (serviceId) {
    if (!uuidPattern.test(serviceId)) {
      errors.service_id = "Layanan yang dipilih tidak valid.";
    } else {
      try {
        const service = await getAdminServiceById(serviceId);
        if (!service) errors.service_id = "Layanan yang dipilih tidak ditemukan.";
      } catch (error) {
        console.error("[cms] Portfolio service validation failed", {
          serviceId,
          message: error instanceof Error ? error.message : "Unknown error",
        });
        errors.service_id = "Layanan yang dipilih gagal diperiksa.";
      }
    }
  }

  return {
    fields:
      Object.keys(errors).length === 0
        ? {
            title,
            description: description || null,
            serviceId,
            isPublished,
            sortOrder,
          }
        : null,
    errors,
  };
}

function revalidatePortfolioRoutes(itemId?: string) {
  revalidatePath("/admin/konten/portofolio");
  if (itemId) revalidatePath(`/admin/konten/portofolio/${itemId}`);
  revalidatePath("/");
  revalidatePath("/tentang-kami");
}

export async function createPortfolioItem(
  _previousState: PortfolioFormState,
  formData: FormData,
): Promise<PortfolioFormState> {
  await requireAdmin();

  const [{ fields, errors }, { image, error: imageError }] = await Promise.all([
    validatePortfolioFields(formData),
    validateContentImageUpload(formData.get("portfolio_image")),
  ]);

  if (!image && !imageError) {
    errors.portfolio_image = "Gambar portofolio wajib diunggah.";
  } else if (imageError) {
    errors.portfolio_image = imageError;
  }

  if (!fields || Object.keys(errors).length > 0 || !image) {
    return {
      status: "error",
      message: "Periksa kembali field yang ditandai.",
      errors,
    };
  }

  const supabase = await createClient();
  const uploadedPath = `portfolio/${crypto.randomUUID()}.${image.extension}`;
  const { error: uploadError } = await supabase.storage
    .from("content-images")
    .upload(uploadedPath, image.bytes, {
      contentType: image.file.type,
      upsert: false,
    });

  if (uploadError) {
    console.error("[cms] Portfolio image upload failed", {
      code: uploadError.name,
      message: uploadError.message,
    });
    return {
      status: "error",
      message: "Gambar portofolio gagal diunggah. Silakan coba lagi.",
      errors: {},
    };
  }

  const { data, error } = await supabase
    .from("portfolio")
    .insert({
      title: fields.title,
      description: fields.description,
      service_id: fields.serviceId,
      image_url: uploadedPath,
      is_published: fields.isPublished,
      sort_order: fields.sortOrder,
    })
    .select("id")
    .single<{ id: string }>();

  if (error || !data) {
    await supabase.storage.from("content-images").remove([uploadedPath]);
    if (error) {
      console.error("[cms] Portfolio insert failed", {
        code: error.code,
        message: error.message,
      });
    }
    return {
      status: "error",
      message: "Item portofolio gagal ditambahkan. Silakan coba lagi.",
      errors: {},
    };
  }

  revalidatePortfolioRoutes(data.id);
  return {
    status: "success",
    message: "Item portofolio berhasil ditambahkan.",
    errors: {},
  };
}

export async function updatePortfolioItem(
  itemId: string,
  _previousState: PortfolioFormState,
  formData: FormData,
): Promise<PortfolioFormState> {
  await requireAdmin();

  if (!uuidPattern.test(itemId)) {
    return { status: "error", message: "Item portofolio tidak valid.", errors: {} };
  }

  let existingItem;
  try {
    existingItem = await getAdminPortfolioItemById(itemId);
  } catch (error) {
    console.error("[cms] Existing portfolio read failed", {
      itemId,
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return {
      status: "error",
      message: "Item portofolio gagal diperiksa. Silakan coba lagi.",
      errors: {},
    };
  }

  if (!existingItem) {
    return { status: "error", message: "Item portofolio tidak ditemukan.", errors: {} };
  }

  const [{ fields, errors }, { image, error: imageError }] = await Promise.all([
    validatePortfolioFields(formData),
    validateContentImageUpload(formData.get("portfolio_image")),
  ]);
  if (imageError) errors.portfolio_image = imageError;

  if (!fields || Object.keys(errors).length > 0) {
    return {
      status: "error",
      message: "Periksa kembali field yang ditandai.",
      errors,
    };
  }

  const supabase = await createClient();
  let uploadedPath: string | null = null;
  let nextImageUrl = existingItem.image_url;

  if (image) {
    uploadedPath = `portfolio/${crypto.randomUUID()}.${image.extension}`;
    const { error: uploadError } = await supabase.storage
      .from("content-images")
      .upload(uploadedPath, image.bytes, {
        contentType: image.file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("[cms] Portfolio replacement upload failed", {
        itemId,
        code: uploadError.name,
        message: uploadError.message,
      });
      return {
        status: "error",
        message: "Gambar pengganti gagal diunggah. Silakan coba lagi.",
        errors: {},
      };
    }

    nextImageUrl = uploadedPath;
  }

  const { data, error } = await supabase
    .from("portfolio")
    .update({
      title: fields.title,
      description: fields.description,
      service_id: fields.serviceId,
      image_url: nextImageUrl,
      is_published: fields.isPublished,
      sort_order: fields.sortOrder,
    })
    .eq("id", existingItem.id)
    .select("id")
    .maybeSingle<{ id: string }>();

  if (error || !data) {
    if (uploadedPath) {
      await supabase.storage.from("content-images").remove([uploadedPath]);
    }
    if (error) {
      console.error("[cms] Portfolio update failed", {
        itemId,
        code: error.code,
        message: error.message,
      });
    }
    return {
      status: "error",
      message: "Item portofolio tidak ditemukan atau gagal diperbarui.",
      errors: {},
    };
  }

  revalidatePortfolioRoutes(existingItem.id);
  return {
    status: "success",
    message: "Item portofolio berhasil disimpan.",
    errors: {},
  };
}

export async function deletePortfolioItem(
  itemId: string,
  _previousState: DeletePortfolioState,
  _formData: FormData,
): Promise<DeletePortfolioState> {
  await requireAdmin();
  void _previousState;
  void _formData;

  if (!uuidPattern.test(itemId)) {
    return { status: "error", message: "Item portofolio tidak valid." };
  }

  let existingItem;
  try {
    existingItem = await getAdminPortfolioItemById(itemId);
  } catch (error) {
    console.error("[cms] Portfolio delete lookup failed", {
      itemId,
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return { status: "error", message: "Item portofolio gagal diperiksa." };
  }

  if (!existingItem) {
    return { status: "error", message: "Item portofolio tidak ditemukan." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("portfolio")
    .delete()
    .eq("id", existingItem.id);

  if (error) {
    console.error("[cms] Portfolio delete failed", {
      itemId,
      code: error.code,
      message: error.message,
    });
    return { status: "error", message: "Item portofolio gagal dihapus." };
  }

  revalidatePortfolioRoutes(existingItem.id);
  return { status: "success", message: "Item portofolio berhasil dihapus." };
}
