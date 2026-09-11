import {
  orderStatusLabels,
  type OrderStatus,
} from "@/lib/orders/order-status";

export const otherServiceSlug = "lainnya";

export function isOtherService(serviceSlug: string | null | undefined) {
  return serviceSlug === otherServiceSlug;
}

export function getOrderStatusLabel(
  status: OrderStatus,
  serviceSlug?: string | null,
) {
  if (isOtherService(serviceSlug) && status === "diterima") {
    return "Pesanan Dikonfirmasi";
  }

  return orderStatusLabels[status];
}

export function shouldShowOrderQuantity(
  orderKind: "service" | "product",
  serviceSlug?: string | null,
) {
  return orderKind === "product" || !isOtherService(serviceSlug);
}

export function getServiceTypeLabel(
  serviceSlug: string | null | undefined,
  serviceFlow: string | null,
) {
  if (isOtherService(serviceSlug)) return "Lainnya";
  if (serviceFlow === "konveksi_sablon") return "Konveksi / Sablon";
  if (serviceFlow === "permak") return "Permak";
  return "Layanan Custom";
}
