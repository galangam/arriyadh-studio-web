"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createServiceOrder } from "@/lib/orders/service-orders";
import {
  serviceVariantSizes,
  type ServiceVariantInput,
} from "@/lib/services/service-requirements";

export type ServiceOrderField =
  | "customerName"
  | "customerWhatsapp"
  | "quantity"
  | "customerCompany"
  | "customerEmail"
  | "shippingAddress"
  | "requirement"
  | "material"
  | "variants"
  | "designDescription"
  | "designReferences";

export type SubmittedServiceVariant = {
  variantType: string | null;
  material: string;
  sleeveType: string;
  sizes: Record<string, string>;
};

export type ServiceOrderSubmittedValues = {
  customerName: string;
  customerWhatsapp: string;
  quantity: string;
  customerCompany: string;
  customerEmail: string;
  shippingAddress: string;
  requirement: string;
  material: string;
  designDescription: string;
  variants: SubmittedServiceVariant[];
};

export type ServiceOrderState = {
  formError: string | null;
  fieldErrors: Partial<Record<ServiceOrderField, string>>;
  submittedValues: ServiceOrderSubmittedValues | null;
  revision: number;
};

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function rawFormString(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function optionalString(value: string) {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function formFiles(formData: FormData, name: string) {
  return formData
    .getAll(name)
    .filter((value): value is File => value instanceof File)
    .filter((file) => file.size > 0 || file.name !== "");
}

function parseSubmittedVariants(formData: FormData) {
  const variantTypes = formData.getAll("variantType");
  const materials = formData.getAll("variantMaterial");
  const sleeves = formData.getAll("variantSleeveType");
  const submittedSizeNames = Array.from(formData.keys())
    .filter((name) => name.startsWith("variantSize:"))
    .map((name) => name.slice("variantSize:".length));
  const sizeNames = Array.from(
    new Set([...serviceVariantSizes, ...submittedSizeNames]),
  );
  const sizeValues = new Map(
    sizeNames.map((size) => [
      size,
      formData.getAll(`variantSize:${size}`),
    ]),
  );
  const variantCount = Math.max(
    variantTypes.length,
    materials.length,
    sleeves.length,
    ...Array.from(sizeValues.values(), (values) => values.length),
  );

  return Array.from({ length: variantCount }, (_, index) => ({
    variantType:
      typeof variantTypes[index] === "string"
        ? variantTypes[index].trim() || null
        : null,
    material:
      typeof materials[index] === "string" ? materials[index].trim() : "",
    sleeveType:
      typeof sleeves[index] === "string" ? sleeves[index].trim() : "",
    sizes: Object.fromEntries(
      sizeNames.map((size) => {
        const value = sizeValues.get(size)?.[index];
        return [size, typeof value === "string" ? value : ""];
      }),
    ),
  }));
}

function normalizeVariants(
  variants: SubmittedServiceVariant[],
): ServiceVariantInput[] {
  return variants.map((variant) => ({
    variantType: variant.variantType,
    material: variant.material,
    sleeveType: variant.sleeveType,
    sizes: Object.entries(variant.sizes).map(([size, value]) => ({
      size,
      quantity: value.trim() === "" ? 0 : Number(value),
    })),
  }));
}

export async function submitServiceOrder(
  serviceId: string,
  previousState: ServiceOrderState,
  formData: FormData,
): Promise<ServiceOrderState> {
  const submittedValues: ServiceOrderSubmittedValues = {
    customerName: rawFormString(formData, "customerName"),
    customerWhatsapp: rawFormString(formData, "customerWhatsapp"),
    quantity: rawFormString(formData, "quantity"),
    customerCompany: rawFormString(formData, "customerCompany"),
    customerEmail: rawFormString(formData, "customerEmail"),
    shippingAddress: rawFormString(formData, "shippingAddress"),
    requirement: rawFormString(formData, "requirement"),
    material: rawFormString(formData, "material"),
    designDescription: rawFormString(formData, "designDescription"),
    variants: parseSubmittedVariants(formData),
  };
  const revision = previousState.revision + 1;
  const customerName = submittedValues.customerName.trim();
  const customerWhatsappValue = submittedValues.customerWhatsapp.trim();
  const quantityValue = submittedValues.quantity.trim();
  const customerCompany = submittedValues.customerCompany.trim();
  const customerEmail = submittedValues.customerEmail.trim();
  const shippingAddress = submittedValues.shippingAddress.trim();
  const requirement = submittedValues.requirement.trim();
  const material = submittedValues.material.trim();
  const designDescription = submittedValues.designDescription.trim();
  const designReferences = formFiles(formData, "designReferences");
  const customerWhatsapp = customerWhatsappValue.replace(/\D/g, "");
  const quantity = quantityValue === "" ? null : Number(quantityValue);
  const variants = normalizeVariants(submittedValues.variants);
  const fieldErrors: ServiceOrderState["fieldErrors"] = {};

  const result = (
    errors: ServiceOrderState["fieldErrors"],
    formError: string | null = null,
  ): ServiceOrderState => ({
    formError,
    fieldErrors: errors,
    submittedValues,
    revision,
  });

  if (!uuidPattern.test(serviceId)) {
    return result({}, "Layanan tidak tersedia.");
  }

  if (!customerName) {
    fieldErrors.customerName = "Nama pemesan wajib diisi.";
  } else if (customerName.length > 120) {
    fieldErrors.customerName = "Nama pemesan terlalu panjang.";
  }

  if (customerWhatsapp.length < 8 || customerWhatsapp.length > 15) {
    fieldErrors.customerWhatsapp =
      "Nomor WhatsApp harus terdiri dari 8–15 digit.";
  }

  if (
    quantityValue &&
    (!/^\d+$/.test(quantityValue) || !Number.isSafeInteger(quantity))
  ) {
    fieldErrors.quantity = "Jumlah harus berupa angka bulat.";
  } else if (
    quantity !== null &&
    (quantity < 1 || quantity > 10000)
  ) {
    fieldErrors.quantity = "Jumlah harus antara 1 dan 10.000.";
  }

  if (customerCompany.length > 160) {
    fieldErrors.customerCompany = "Nama perusahaan terlalu panjang.";
  }
  if (customerEmail && !emailPattern.test(customerEmail)) {
    fieldErrors.customerEmail = "Format email tidak valid.";
  } else if (customerEmail.length > 254) {
    fieldErrors.customerEmail = "Alamat email terlalu panjang.";
  }
  if (shippingAddress.length > 1000) {
    fieldErrors.shippingAddress = "Alamat terlalu panjang.";
  }
  if (requirement.length > 2000) {
    fieldErrors.requirement = "Detail kebutuhan terlalu panjang.";
  }
  if (material.length > 2000) {
    fieldErrors.material = "Material atau bahan terlalu panjang.";
  }
  if (designDescription.length > 2000) {
    fieldErrors.designDescription = "Detail desain terlalu panjang.";
  }

  if (Object.keys(fieldErrors).length > 0) return result(fieldErrors);

  let paymentToken: string;
  let referenceUploadFailed = false;

  try {
    const createdOrder = await createServiceOrder({
      serviceId,
      customerName,
      customerWhatsapp,
      quantity,
      customerCompany: optionalString(customerCompany),
      customerEmail: optionalString(customerEmail),
      shippingAddress: optionalString(shippingAddress),
      requirement,
      material,
      designDescription,
      designReferences,
      variants,
    });
    paymentToken = createdOrder.paymentToken;
    referenceUploadFailed = createdOrder.referenceUploadFailed;
  } catch (error) {
    const code = error instanceof Error ? error.message : "";

    if (code === "SERVICE_UNAVAILABLE") {
      return result(
        {},
        "Layanan ini sudah tidak tersedia. Pilih layanan lain dari katalog.",
      );
    }
    if (code === "REQUIREMENT_REQUIRED") {
      return result({ requirement: "Detail kebutuhan wajib diisi." });
    }
    if (code === "MATERIAL_REQUIRED") {
      return result({ material: "Material atau bahan wajib diisi." });
    }
    if (code.startsWith("VARIANT_")) {
      const messages: Record<string, string> = {
        VARIANT_REQUIRED: "Tambahkan minimal satu varian.",
        VARIANT_TOO_MANY: "Maksimal 8 varian dalam satu pesanan.",
        VARIANT_TYPE_REQUIRED: "Jenis Jersey wajib dipilih.",
        VARIANT_TYPE_INVALID: "Jenis Jersey tidak tersedia.",
        VARIANT_TYPE_NOT_ALLOWED:
          "Jenis Jersey hanya berlaku untuk layanan Jersey.",
        VARIANT_MATERIAL_INVALID: "Material tidak tersedia untuk jenis Jersey ini.",
        VARIANT_SLEEVE_INVALID: "Jenis lengan tidak tersedia.",
        VARIANT_DUPLICATE:
          "Kombinasi jenis Jersey, material, dan jenis lengan tidak boleh duplikat.",
        VARIANT_SIZE_INVALID:
          "Jumlah ukuran harus berupa angka bulat antara 0 dan 10.000.",
        VARIANT_SIZE_DUPLICATE:
          "Ukuran dalam satu varian tidak boleh duplikat.",
        VARIANT_SIZE_REQUIRED:
          "Setiap varian harus memiliki minimal satu ukuran.",
        VARIANT_TOTAL_INVALID:
          "Total pesanan harus antara 1 dan 10.000 pcs.",
        VARIANT_NOT_ALLOWED:
          "Rincian varian tidak berlaku untuk layanan ini.",
      };
      return result({
        variants: messages[code] ?? "Rincian varian tidak valid.",
      });
    }
    if (code === "DESIGN_DESCRIPTION_REQUIRED") {
      return result({
        designDescription:
          "Detail desain wajib diisi minimal 10 karakter.",
      });
    }
    if (code === "REFERENCE_REQUIRED") {
      return result({
        designReferences: "Unggah minimal 1 referensi desain.",
      });
    }
    if (code === "REFERENCE_NOT_ALLOWED") {
      return result({
        designReferences: "Referensi desain tidak berlaku untuk layanan ini.",
      });
    }
    if (code === "REFERENCE_TOO_MANY") {
      return result({
        designReferences: "Maksimal 5 file referensi desain.",
      });
    }
    if (code === "REFERENCE_EMPTY") {
      return result({
        designReferences: "File referensi tidak boleh kosong.",
      });
    }
    if (code === "REFERENCE_TOO_LARGE") {
      return result({
        designReferences: "Ukuran setiap referensi maksimal 10 MB.",
      });
    }
    if (code === "REFERENCE_FORMAT_INVALID") {
      return result({
        designReferences:
          "Gunakan file JPEG, PNG, WebP, atau PDF yang valid.",
      });
    }

    return result(
      {},
      "Pesanan belum berhasil dibuat. Silakan coba lagi.",
    );
  }

  revalidatePath("/admin");
  revalidatePath("/admin/pesanan");
  redirect(
    `/pesanan/berhasil/${paymentToken}${
      referenceUploadFailed ? "?reference=failed" : ""
    }`,
  );
}
