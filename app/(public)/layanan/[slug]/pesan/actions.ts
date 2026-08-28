"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createServiceOrder } from "@/lib/orders/service-orders";

export type ServiceOrderField =
  | "customerName"
  | "customerWhatsapp"
  | "quantity"
  | "customerCompany"
  | "customerEmail"
  | "shippingAddress"
  | "requirement"
  | "material"
  | "designDescription"
  | "designReferences";

export type ServiceOrderState = {
  error: string | null;
  fieldErrors: Partial<Record<ServiceOrderField, string>>;
};

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function formString(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function optionalString(value: string) {
  return value === "" ? null : value;
}

function formFiles(formData: FormData, name: string) {
  return formData
    .getAll(name)
    .filter((value): value is File => value instanceof File)
    .filter((file) => file.size > 0 || file.name !== "");
}

export async function submitServiceOrder(
  serviceId: string,
  _previousState: ServiceOrderState,
  formData: FormData,
): Promise<ServiceOrderState> {
  const customerName = formString(formData, "customerName");
  const customerWhatsappValue = formString(formData, "customerWhatsapp");
  const quantityValue = formString(formData, "quantity");
  const customerCompany = formString(formData, "customerCompany");
  const customerEmail = formString(formData, "customerEmail");
  const shippingAddress = formString(formData, "shippingAddress");
  const requirement = formString(formData, "requirement");
  const material = formString(formData, "material");
  const designDescription = formString(formData, "designDescription");
  const designReferences = formFiles(formData, "designReferences");
  const customerWhatsapp = customerWhatsappValue.replace(/\D/g, "");
  const quantity = Number(quantityValue);
  const fieldErrors: ServiceOrderState["fieldErrors"] = {};

  if (!uuidPattern.test(serviceId)) {
    return { error: "Layanan tidak tersedia.", fieldErrors: {} };
  }

  if (!customerName) {
    fieldErrors.customerName = "Nama pemesan wajib diisi.";
  } else if (customerName.length > 120) {
    fieldErrors.customerName = "Nama pemesan terlalu panjang.";
  }

  if (customerWhatsapp.length < 8 || customerWhatsapp.length > 15) {
    fieldErrors.customerWhatsapp = "Nomor WhatsApp harus berisi 8–15 digit.";
  }

  if (!/^\d+$/.test(quantityValue) || !Number.isSafeInteger(quantity)) {
    fieldErrors.quantity = "Jumlah harus berupa angka bulat.";
  } else if (quantity < 1 || quantity > 10000) {
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

  if (Object.keys(fieldErrors).length > 0) {
    return { error: null, fieldErrors };
  }

  let paymentToken: string;
  let referenceUploadFailed = false;

  try {
    const result = await createServiceOrder({
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
    });
    paymentToken = result.paymentToken;
    referenceUploadFailed = result.referenceUploadFailed;
  } catch (error) {
    const code = error instanceof Error ? error.message : "";

    if (code === "SERVICE_UNAVAILABLE") {
      return {
        error: "Layanan ini sudah tidak tersedia. Pilih layanan lain dari katalog.",
        fieldErrors: {},
      };
    }
    if (code === "REQUIREMENT_REQUIRED") {
      return {
        error: null,
        fieldErrors: { requirement: "Detail kebutuhan wajib diisi." },
      };
    }
    if (code === "MATERIAL_REQUIRED") {
      return {
        error: null,
        fieldErrors: { material: "Material atau bahan wajib diisi." },
      };
    }
    if (code === "DESIGN_DESCRIPTION_REQUIRED") {
      return {
        error: null,
        fieldErrors: {
          designDescription: "Detail desain wajib diisi minimal 10 karakter.",
        },
      };
    }
    if (code === "REFERENCE_TOO_MANY") {
      return {
        error: null,
        fieldErrors: { designReferences: "Maksimal 5 file referensi desain." },
      };
    }
    if (code === "REFERENCE_EMPTY") {
      return {
        error: null,
        fieldErrors: { designReferences: "File referensi tidak boleh kosong." },
      };
    }
    if (code === "REFERENCE_TOO_LARGE") {
      return {
        error: null,
        fieldErrors: { designReferences: "Ukuran setiap referensi maksimal 10 MB." },
      };
    }
    if (code === "REFERENCE_FORMAT_INVALID") {
      return {
        error: null,
        fieldErrors: {
          designReferences: "Gunakan file JPEG, PNG, WebP, atau PDF yang valid.",
        },
      };
    }

    return {
      error: "Pesanan belum berhasil dibuat. Silakan coba lagi.",
      fieldErrors: {},
    };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/pesanan");
  redirect(
    `/pesanan/berhasil/${paymentToken}${referenceUploadFailed ? "?reference=failed" : ""}`,
  );
}
