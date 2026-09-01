"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/require-admin";
import {
  validateContentImageUpload,
  validateContentImageValue,
} from "@/lib/content/content-image-upload";
import { getActiveProducts } from "@/lib/products/public-products";
import { getActiveServices } from "@/lib/services/public-services";
import { createClient } from "@/lib/supabase/server";

const contentFieldNames = [
  "hero_eyebrow",
  "hero_title",
  "hero_description",
  "hero_image_url",
  "intro_title",
  "intro_description",
  "experience_value",
  "experience_label",
  "portfolio_title",
  "portfolio_description",
] as const;

type ContentFieldName = (typeof contentFieldNames)[number];

export type HomepageContentFormState = {
  status: "idle" | "success" | "error";
  message: string | null;
  errors: Partial<Record<ContentFieldName | "hero_image", string>>;
};

export type FeaturedFormState = {
  status: "idle" | "success" | "error";
  message: string | null;
};

type RelationConfig = {
  relationTable:
    | "homepage_featured_services"
    | "homepage_featured_products";
  relationIdColumn: "service_id" | "product_id";
  getAllowedIds: () => Promise<string[]>;
  label: "layanan" | "produk";
};

type RelationRow = {
  itemId: string;
  sortOrder: number;
};

function readText(formData: FormData, name: ContentFieldName) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function validateRequired(
  values: Record<ContentFieldName, string>,
  errors: HomepageContentFormState["errors"],
  name: ContentFieldName,
  label: string,
  maxLength: number,
) {
  if (!values[name]) errors[name] = `${label} wajib diisi.`;
  else if (values[name].length > maxLength) {
    errors[name] = `${label} maksimal ${maxLength} karakter.`;
  }
}

function revalidateHomepage() {
  revalidatePath("/");
  revalidatePath("/admin/konten/beranda");
}

export async function updateHomepageContent(
  _previousState: HomepageContentFormState,
  formData: FormData,
): Promise<HomepageContentFormState> {
  await requireAdmin();

  const values = Object.fromEntries(
    contentFieldNames.map((name) => [name, readText(formData, name)]),
  ) as Record<ContentFieldName, string>;
  const errors: HomepageContentFormState["errors"] = {};

  validateRequired(values, errors, "hero_eyebrow", "Eyebrow hero", 100);
  validateRequired(values, errors, "hero_title", "Judul hero", 180);
  validateRequired(values, errors, "hero_description", "Deskripsi hero", 1000);
  validateRequired(values, errors, "intro_title", "Judul pengantar", 180);
  validateRequired(values, errors, "intro_description", "Deskripsi pengantar", 2000);
  validateRequired(values, errors, "portfolio_title", "Judul portofolio", 180);
  validateRequired(values, errors, "portfolio_description", "Deskripsi portofolio", 1000);

  if (values.experience_value.length > 30) {
    errors.experience_value = "Nilai pengalaman maksimal 30 karakter.";
  }
  if (values.experience_label.length > 100) {
    errors.experience_label = "Label pengalaman maksimal 100 karakter.";
  }

  const heroImageValueError = validateContentImageValue(
    values.hero_image_url,
    "homepage",
  );
  if (heroImageValueError) errors.hero_image_url = heroImageValueError;

  const { image: heroImage, error: heroImageError } =
    await validateContentImageUpload(formData.get("hero_image"));
  if (heroImageError) errors.hero_image = heroImageError;

  if (Object.keys(errors).length > 0) {
    return {
      status: "error",
      message: "Periksa kembali field yang ditandai.",
      errors,
    };
  }

  const supabase = await createClient();
  let uploadedPath: string | null = null;
  let heroImageUrl = values.hero_image_url || null;

  if (heroImage) {
    uploadedPath = `homepage/${crypto.randomUUID()}.${heroImage.extension}`;
    const { error: uploadError } = await supabase.storage
      .from("content-images")
      .upload(uploadedPath, heroImage.bytes, {
        contentType: heroImage.file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("[cms] Homepage hero upload failed", {
        code: uploadError.name,
        message: uploadError.message,
      });
      return {
        status: "error",
        message: "Gambar hero gagal diunggah. Silakan coba lagi.",
        errors: {},
      };
    }

    heroImageUrl = uploadedPath;
  }

  const { data, error } = await supabase
    .from("homepage_content")
    .update({
      hero_eyebrow: values.hero_eyebrow,
      hero_title: values.hero_title,
      hero_description: values.hero_description,
      hero_image_url: heroImageUrl,
      intro_title: values.intro_title,
      intro_description: values.intro_description,
      experience_value: values.experience_value || null,
      experience_label: values.experience_label || null,
      portfolio_title: values.portfolio_title,
      portfolio_description: values.portfolio_description,
    })
    .eq("id", 1)
    .select("id")
    .maybeSingle<{ id: number }>();

  if (error || !data) {
    if (uploadedPath) {
      await supabase.storage.from("content-images").remove([uploadedPath]);
    }
    if (error) {
      console.error("[cms] Homepage content update failed", {
        code: error.code,
        message: error.message,
      });
    }
    return {
      status: "error",
      message: data
        ? "Konten beranda gagal disimpan. Silakan coba lagi."
        : "Data beranda utama tidak ditemukan atau gagal diperbarui.",
      errors: {},
    };
  }

  revalidateHomepage();
  return {
    status: "success",
    message: "Konten beranda berhasil disimpan.",
    errors: {},
  };
}

function readOrderedIds(formData: FormData) {
  return formData
    .getAll("featured_ids")
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim())
    .filter(Boolean);
}

async function replaceFeaturedRelations(
  formData: FormData,
  config: RelationConfig,
): Promise<FeaturedFormState> {
  await requireAdmin();
  const ids = readOrderedIds(formData);
  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (ids.some((id) => !uuidPattern.test(id)) || new Set(ids).size !== ids.length) {
    return {
      status: "error",
      message: `Pilihan ${config.label} tidak valid atau mengandung duplikasi.`,
    };
  }

  const supabase = await createClient();

  if (ids.length > 0) {
    let allowedIds: string[];

    try {
      allowedIds = await config.getAllowedIds();
    } catch (error) {
      console.error("[cms] Featured catalog validation failed", {
        relation: config.relationTable,
        message: error instanceof Error ? error.message : "Unknown error",
      });
      return {
        status: "error",
        message: `Daftar ${config.label} yang tersedia gagal diperiksa.`,
      };
    }

    const allowedIdSet = new Set(allowedIds);
    if (ids.some((id) => !allowedIdSet.has(id))) {
      return {
        status: "error",
        message: `Salah satu ${config.label} tidak aktif atau tidak tersedia.`,
      };
    }
  }

  const { data: currentRows, error: snapshotError } = await supabase
    .from(config.relationTable)
    .select(`${config.relationIdColumn}, sort_order`)
    .eq("homepage_id", 1)
    .order("sort_order", { ascending: true })
    .returns<
      Array<{
        service_id?: string;
        product_id?: string;
        sort_order: number;
      }>
    >();

  if (snapshotError || !currentRows) {
    return {
      status: "error",
      message: `Urutan ${config.label} saat ini gagal dibaca.`,
    };
  }

  const snapshot: RelationRow[] = currentRows.map((row) => ({
    itemId: String(row[config.relationIdColumn]),
    sortOrder: Number(row.sort_order),
  }));
  const { error: deleteError } = await supabase
    .from(config.relationTable)
    .delete()
    .eq("homepage_id", 1);

  if (deleteError) {
    return {
      status: "error",
      message: `Daftar ${config.label} gagal diperbarui.`,
    };
  }

  const replacement = ids.map((id, sortOrder) => ({
    homepage_id: 1,
    [config.relationIdColumn]: id,
    sort_order: sortOrder,
  }));
  const { error: insertError } = replacement.length
    ? await supabase.from(config.relationTable).insert(replacement)
    : { error: null };

  if (insertError) {
    await supabase.from(config.relationTable).delete().eq("homepage_id", 1);
    const restoration = snapshot.map((row) => ({
      homepage_id: 1,
      [config.relationIdColumn]: row.itemId,
      sort_order: row.sortOrder,
    }));
    const { error: restoreError } = restoration.length
      ? await supabase.from(config.relationTable).insert(restoration)
      : { error: null };

    console.error("[cms] Featured relation replacement failed", {
      relation: config.relationTable,
      code: insertError.code,
      restoreCode: restoreError?.code,
    });
    return {
      status: "error",
      message: restoreError
        ? `Daftar ${config.label} gagal diperbarui dan perlu diperiksa kembali.`
        : `Daftar ${config.label} gagal diperbarui; urutan sebelumnya dipulihkan.`,
    };
  }

  revalidateHomepage();
  return {
    status: "success",
    message: `Daftar ${config.label} beranda berhasil disimpan.`,
  };
}

export async function updateFeaturedServices(
  _previousState: FeaturedFormState,
  formData: FormData,
) {
  return replaceFeaturedRelations(formData, {
    relationTable: "homepage_featured_services",
    relationIdColumn: "service_id",
    getAllowedIds: async () =>
      (await getActiveServices()).map((service) => service.id),
    label: "layanan",
  });
}

export async function updateFeaturedProducts(
  _previousState: FeaturedFormState,
  formData: FormData,
) {
  return replaceFeaturedRelations(formData, {
    relationTable: "homepage_featured_products",
    relationIdColumn: "product_id",
    getAllowedIds: async () =>
      (await getActiveProducts()).map((product) => product.id),
    label: "produk",
  });
}
