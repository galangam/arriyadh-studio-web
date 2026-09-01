"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/require-admin";
import {
  validateContentImageUpload,
  validateContentImageValue,
} from "@/lib/content/content-image-upload";
import { getAdminServiceById } from "@/lib/services/admin-services";
import { createClient } from "@/lib/supabase/server";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type ServiceField =
  | "name"
  | "description"
  | "image_url"
  | "service_image"
  | "sort_order";

export type ServiceFormState = {
  status: "idle" | "success" | "error";
  message: string | null;
  errors: Partial<Record<ServiceField, string>>;
};

function readText(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function hasHtml(value: string) {
  return /<\/?[a-z][^>]*>/i.test(value);
}

function revalidateServiceRoutes(serviceId: string, slug: string) {
  revalidatePath("/admin/konten/layanan");
  revalidatePath(`/admin/konten/layanan/${serviceId}`);
  revalidatePath("/layanan");
  revalidatePath(`/layanan/${slug}/pesan`);
  revalidatePath("/");
}

export async function updateService(
  serviceId: string,
  _previousState: ServiceFormState,
  formData: FormData,
): Promise<ServiceFormState> {
  await requireAdmin();

  if (!uuidPattern.test(serviceId)) {
    return {
      status: "error",
      message: "Layanan tidak valid.",
      errors: {},
    };
  }

  let existingService;

  try {
    existingService = await getAdminServiceById(serviceId);
  } catch (error) {
    console.error("[cms] Existing service read failed", {
      serviceId,
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return {
      status: "error",
      message: "Layanan gagal diperiksa. Silakan coba lagi.",
      errors: {},
    };
  }

  if (!existingService) {
    return {
      status: "error",
      message: "Layanan tidak ditemukan.",
      errors: {},
    };
  }

  const name = readText(formData, "name");
  const description = readText(formData, "description");
  const imageUrl = readText(formData, "image_url");
  const sortOrderText = readText(formData, "sort_order");
  const sortOrder = /^\d+$/.test(sortOrderText)
    ? Number(sortOrderText)
    : Number.NaN;
  const isActive = formData.get("is_active") === "on";
  const errors: ServiceFormState["errors"] = {};

  if (!name) errors.name = "Nama layanan wajib diisi.";
  else if (name.length > 160) {
    errors.name = "Nama layanan maksimal 160 karakter.";
  } else if (hasHtml(name)) {
    errors.name = "Nama layanan tidak boleh berisi HTML.";
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

  const imageValueError = validateContentImageValue(imageUrl, "services");
  if (imageValueError) errors.image_url = imageValueError;

  const { image: serviceImage, error: serviceImageError } =
    await validateContentImageUpload(formData.get("service_image"));
  if (serviceImageError) errors.service_image = serviceImageError;

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

  if (serviceImage) {
    uploadedPath = `services/${crypto.randomUUID()}.${serviceImage.extension}`;
    const { error: uploadError } = await supabase.storage
      .from("content-images")
      .upload(uploadedPath, serviceImage.bytes, {
        contentType: serviceImage.file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("[cms] Service image upload failed", {
        serviceId,
        code: uploadError.name,
        message: uploadError.message,
      });
      return {
        status: "error",
        message: "Gambar layanan gagal diunggah. Silakan coba lagi.",
        errors: {},
      };
    }

    nextImageUrl = uploadedPath;
  }

  const { data, error } = await supabase
    .from("services")
    .update({
      name,
      description: description || null,
      image_url: nextImageUrl,
      is_active: isActive,
      sort_order: sortOrder,
    })
    .eq("id", existingService.id)
    .select("id")
    .maybeSingle<{ id: string }>();

  if (error || !data) {
    if (uploadedPath) {
      await supabase.storage.from("content-images").remove([uploadedPath]);
    }

    if (error) {
      console.error("[cms] Service update failed", {
        serviceId,
        code: error.code,
        message: error.message,
      });
    }

    return {
      status: "error",
      message: data
        ? "Layanan gagal disimpan. Silakan coba lagi."
        : "Layanan tidak ditemukan atau gagal diperbarui.",
      errors: {},
    };
  }

  revalidateServiceRoutes(existingService.id, existingService.slug);

  return {
    status: "success",
    message: "Layanan berhasil disimpan.",
    errors: {},
  };
}
