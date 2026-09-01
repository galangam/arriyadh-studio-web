"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";
import { normalizeWhatsappNumber } from "@/lib/whatsapp";

const fieldNames = [
  "business_name",
  "whatsapp",
  "phone",
  "email",
  "address",
  "operating_hours",
  "maps_url",
  "instagram_url",
  "facebook_url",
  "tiktok_url",
] as const;

type FieldName = (typeof fieldNames)[number];

export type SiteSettingsFormState = {
  status: "idle" | "success" | "error";
  message: string | null;
  errors: Partial<Record<FieldName, string>>;
};

function readField(formData: FormData, name: FieldName) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function validateUrl(value: string, label: string) {
  if (!value) return null;

  if (value.length > 2048) return `${label} terlalu panjang.`;

  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol)
      ? null
      : `${label} harus menggunakan http atau https.`;
  } catch {
    return `${label} tidak valid.`;
  }
}

export async function updateSiteSettings(
  _previousState: SiteSettingsFormState,
  formData: FormData,
): Promise<SiteSettingsFormState> {
  await requireAdmin();

  const values = Object.fromEntries(
    fieldNames.map((name) => [name, readField(formData, name)]),
  ) as Record<FieldName, string>;
  const errors: Partial<Record<FieldName, string>> = {};

  if (!values.business_name) {
    errors.business_name = "Nama bisnis wajib diisi.";
  } else if (values.business_name.length > 120) {
    errors.business_name = "Nama bisnis maksimal 120 karakter.";
  }

  if (!values.whatsapp) {
    errors.whatsapp = "Nomor WhatsApp wajib diisi.";
  } else if (!/^[+\d\s().-]+$/.test(values.whatsapp)) {
    errors.whatsapp = "Nomor WhatsApp hanya boleh berisi angka dan pemisah umum.";
  }

  const normalizedWhatsapp = normalizeWhatsappNumber(values.whatsapp);
  if (values.whatsapp && !/^62\d{8,13}$/.test(normalizedWhatsapp)) {
    errors.whatsapp = "Gunakan nomor Indonesia yang valid, misalnya 0812... atau +62812...";
  }

  if (values.phone.length > 50) {
    errors.phone = "Nomor telepon maksimal 50 karakter.";
  }

  if (values.email) {
    if (values.email.length > 254) {
      errors.email = "Email terlalu panjang.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      errors.email = "Format email tidak valid.";
    }
  }

  if (!values.address) {
    errors.address = "Alamat wajib diisi.";
  } else if (values.address.length > 1000) {
    errors.address = "Alamat maksimal 1000 karakter.";
  }

  if (values.operating_hours.length > 500) {
    errors.operating_hours = "Jam operasional maksimal 500 karakter.";
  }

  const urlFields = [
    ["maps_url", "Google Maps URL"],
    ["instagram_url", "Instagram URL"],
    ["facebook_url", "Facebook URL"],
    ["tiktok_url", "TikTok URL"],
  ] as const;

  for (const [name, label] of urlFields) {
    const error = validateUrl(values[name], label);
    if (error) errors[name] = error;
  }

  if (Object.keys(errors).length > 0) {
    return {
      status: "error",
      message: "Periksa kembali field yang ditandai.",
      errors,
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("site_settings")
    .update({
      business_name: values.business_name,
      whatsapp: normalizedWhatsapp,
      phone: values.phone || null,
      email: values.email ? values.email.toLowerCase() : null,
      address: values.address,
      operating_hours: values.operating_hours || null,
      maps_url: values.maps_url || null,
      instagram_url: values.instagram_url || null,
      facebook_url: values.facebook_url || null,
      tiktok_url: values.tiktok_url || null,
    })
    .eq("id", 1)
    .select("id")
    .maybeSingle<{ id: number }>();

  if (error) {
    console.error("[cms] Site settings update failed", {
      code: error.code,
      message: error.message,
    });
    return {
      status: "error",
      message: "Informasi bisnis gagal disimpan. Silakan coba lagi.",
      errors: {},
    };
  }

  if (!data) {
    return {
      status: "error",
      message: "Data informasi bisnis utama tidak ditemukan.",
      errors: {},
    };
  }

  revalidatePath("/admin/konten/informasi-bisnis");
  revalidatePath("/");
  revalidatePath("/tentang-kami");
  revalidatePath("/layanan");
  revalidatePath("/produk");

  return {
    status: "success",
    message: "Informasi bisnis berhasil disimpan.",
    errors: {},
  };
}
