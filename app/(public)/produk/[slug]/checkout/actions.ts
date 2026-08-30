"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createProductOrder } from "@/lib/orders/product-orders";

export type ProductCheckoutField =
  | "productMaterial"
  | "productSleeveType"
  | "productSize"
  | "quantity"
  | "customerName"
  | "customerWhatsapp"
  | "paymentMethod";

export type ProductCheckoutState = {
  error: string | null;
  fieldErrors: Partial<Record<ProductCheckoutField, string>>;
};

function formString(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

export async function submitProductCheckout(
  productId: string,
  _previousState: ProductCheckoutState,
  formData: FormData,
): Promise<ProductCheckoutState> {
  const productMaterial = formString(formData, "productMaterial");
  const productSleeveType = formString(formData, "productSleeveType");
  const productSize = formString(formData, "productSize");
  const quantityValue = formString(formData, "quantity");
  const customerName = formString(formData, "customerName");
  const customerWhatsappValue = formString(formData, "customerWhatsapp");
  const paymentMethodValue = formString(formData, "paymentMethod");
  const quantity = Number(quantityValue);
  const customerWhatsapp = customerWhatsappValue.replace(/\D/g, "");
  const fieldErrors: ProductCheckoutState["fieldErrors"] = {};

  if (!productSize) {
    fieldErrors.productSize = "Pilih ukuran produk.";
  }

  if (!/^\d+$/.test(quantityValue) || !Number.isSafeInteger(quantity)) {
    fieldErrors.quantity = "Jumlah harus berupa angka bulat.";
  } else if (quantity < 1 || quantity > 10000) {
    fieldErrors.quantity = "Jumlah harus antara 1 dan 10.000.";
  }

  if (!customerName) {
    fieldErrors.customerName = "Nama pemesan wajib diisi.";
  }

  if (customerWhatsapp.length < 8 || customerWhatsapp.length > 15) {
    fieldErrors.customerWhatsapp =
      "Nomor WhatsApp harus berisi 8–15 digit.";
  }

  if (paymentMethodValue !== "transfer" && paymentMethodValue !== "cod") {
    fieldErrors.paymentMethod = "Pilih metode pembayaran.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { error: null, fieldErrors };
  }

  let paymentToken: string;

  try {
    const result = await createProductOrder({
      productId,
      productMaterial,
      productSleeveType,
      productSize,
      quantity,
      customerName,
      customerWhatsapp,
      paymentMethod: paymentMethodValue as "transfer" | "cod",
    });

    paymentToken = result.paymentToken;
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_MATERIAL") {
      return {
        error: null,
        fieldErrors: { productMaterial: "Bahan yang dipilih tidak tersedia." },
      };
    }

    if (error instanceof Error && error.message === "INVALID_SLEEVE") {
      return {
        error: null,
        fieldErrors: {
          productSleeveType: "Jenis lengan yang dipilih tidak tersedia.",
        },
      };
    }

    if (error instanceof Error && error.message === "INVALID_SIZE") {
      return {
        error: null,
        fieldErrors: { productSize: "Ukuran yang dipilih tidak tersedia." },
      };
    }

    if (error instanceof Error && error.message === "PRODUCT_UNAVAILABLE") {
      return {
        error: "Produk ini sudah tidak tersedia. Kembali ke katalog untuk memilih produk lain.",
        fieldErrors: {},
      };
    }

    return {
      error: "Pesanan belum berhasil dibuat. Silakan coba lagi.",
      fieldErrors: {},
    };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/pesanan");
  redirect(paymentMethodValue === "transfer" ? `/pembayaran/${paymentToken}` : `/pesanan/berhasil/${paymentToken}`);
}
