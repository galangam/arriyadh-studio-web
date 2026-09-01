"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/require-admin";
import {
  validateContentImageUpload,
  validateContentImageValue,
} from "@/lib/content/content-image-upload";
import { createClient } from "@/lib/supabase/server";

const textFieldNames = [
  "page_title",
  "page_subtitle",
  "history_title",
  "history_body",
  "strength_1_title",
  "strength_1_description",
  "strength_2_title",
  "strength_2_description",
  "strength_3_title",
  "strength_3_description",
  "workshop_title",
  "workshop_description",
  "workshop_image_url",
] as const;

type TextFieldName = (typeof textFieldNames)[number];
type FieldName = TextFieldName | "founded_year" | "workshop_image";

export type AboutContentFormState = {
  status: "idle" | "success" | "error";
  message: string | null;
  errors: Partial<Record<FieldName, string>>;
};

function readText(formData: FormData, name: TextFieldName) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function hasHtml(value: string) {
  return /<\/?[a-z][^>]*>/i.test(value);
}

function validateRequiredText(
  values: Record<TextFieldName, string>,
  errors: AboutContentFormState["errors"],
  name: TextFieldName,
  label: string,
  maxLength: number,
) {
  const value = values[name];

  if (!value) errors[name] = `${label} wajib diisi.`;
  else if (value.length > maxLength) {
    errors[name] = `${label} maksimal ${maxLength} karakter.`;
  } else if (hasHtml(value)) {
    errors[name] = `${label} tidak boleh berisi HTML.`;
  }
}

export async function updateAboutContent(
  _previousState: AboutContentFormState,
  formData: FormData,
): Promise<AboutContentFormState> {
  await requireAdmin();

  const values = Object.fromEntries(
    textFieldNames.map((name) => [name, readText(formData, name)]),
  ) as Record<TextFieldName, string>;
  const errors: AboutContentFormState["errors"] = {};

  validateRequiredText(values, errors, "page_title", "Judul halaman", 180);
  validateRequiredText(values, errors, "page_subtitle", "Subjudul halaman", 240);
  validateRequiredText(values, errors, "history_title", "Judul sejarah", 180);
  validateRequiredText(values, errors, "history_body", "Deskripsi sejarah", 5000);
  validateRequiredText(values, errors, "strength_1_title", "Judul keunggulan 1", 100);
  validateRequiredText(values, errors, "strength_1_description", "Deskripsi keunggulan 1", 200);
  validateRequiredText(values, errors, "strength_2_title", "Judul keunggulan 2", 100);
  validateRequiredText(values, errors, "strength_2_description", "Deskripsi keunggulan 2", 200);
  validateRequiredText(values, errors, "strength_3_title", "Judul keunggulan 3", 100);
  validateRequiredText(values, errors, "strength_3_description", "Deskripsi keunggulan 3", 200);
  validateRequiredText(values, errors, "workshop_title", "Judul workshop", 180);
  validateRequiredText(values, errors, "workshop_description", "Deskripsi workshop", 2000);

  const foundedYearValue = formData.get("founded_year");
  const foundedYearText =
    typeof foundedYearValue === "string" ? foundedYearValue.trim() : "";
  const foundedYear = /^\d+$/.test(foundedYearText)
    ? Number(foundedYearText)
    : Number.NaN;

  if (!foundedYearText) {
    errors.founded_year = "Tahun berdiri wajib diisi.";
  } else if (!Number.isInteger(foundedYear) || foundedYear < 1900 || foundedYear > 2100) {
    errors.founded_year = "Tahun berdiri harus berupa bilangan bulat antara 1900 dan 2100.";
  }

  const imageValueError = validateContentImageValue(
    values.workshop_image_url,
    "about",
  );
  if (imageValueError) errors.workshop_image_url = imageValueError;

  const { image: workshopImage, error: workshopImageError } =
    await validateContentImageUpload(formData.get("workshop_image"));
  if (workshopImageError) errors.workshop_image = workshopImageError;

  if (Object.keys(errors).length > 0) {
    return {
      status: "error",
      message: "Periksa kembali field yang ditandai.",
      errors,
    };
  }

  const supabase = await createClient();
  let uploadedPath: string | null = null;
  let workshopImageUrl = values.workshop_image_url || null;

  if (workshopImage) {
    uploadedPath = `about/${crypto.randomUUID()}.${workshopImage.extension}`;
    const { error: uploadError } = await supabase.storage
      .from("content-images")
      .upload(uploadedPath, workshopImage.bytes, {
        contentType: workshopImage.file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("[cms] About workshop upload failed", {
        code: uploadError.name,
        message: uploadError.message,
      });
      return {
        status: "error",
        message: "Gambar workshop gagal diunggah. Silakan coba lagi.",
        errors: {},
      };
    }

    workshopImageUrl = uploadedPath;
  }

  const { data, error } = await supabase
    .from("about_content")
    .update({
      page_title: values.page_title,
      page_subtitle: values.page_subtitle,
      history_title: values.history_title,
      history_body: values.history_body,
      founded_year: foundedYear,
      strength_1_title: values.strength_1_title,
      strength_1_description: values.strength_1_description,
      strength_2_title: values.strength_2_title,
      strength_2_description: values.strength_2_description,
      strength_3_title: values.strength_3_title,
      strength_3_description: values.strength_3_description,
      workshop_title: values.workshop_title,
      workshop_description: values.workshop_description,
      workshop_image_url: workshopImageUrl,
    })
    .eq("id", 1)
    .select("id")
    .maybeSingle<{ id: number }>();

  if (error || !data) {
    if (uploadedPath) {
      await supabase.storage.from("content-images").remove([uploadedPath]);
    }

    if (error) {
      console.error("[cms] About content update failed", {
        code: error.code,
        message: error.message,
      });
    }

    return {
      status: "error",
      message: data
        ? "Konten Tentang Kami gagal disimpan. Silakan coba lagi."
        : "Data Tentang Kami utama tidak ditemukan atau gagal diperbarui.",
      errors: {},
    };
  }

  revalidatePath("/tentang-kami");
  revalidatePath("/admin/konten/tentang-kami");

  return {
    status: "success",
    message: "Konten Tentang Kami berhasil disimpan.",
    errors: {},
  };
}
