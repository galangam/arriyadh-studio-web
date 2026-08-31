export const productionWorkflows = {
  konveksi_sablon: [
    "sample_mockup",
    "desain",
    "pecah_warna",
    "potong",
    "sablon",
    "jahit",
    "iron",
    "packing",
    "selesai",
  ],
  permak: ["diterima", "dikerjakan", "quality_check", "selesai"],
  product: ["diproses", "selesai"],
} as const;

const preProductionStatuses = [
  "menunggu_harga",
  "menunggu_pembayaran_dp",
  "menunggu_konfirmasi_dp",
  "menunggu_verifikasi",
] as const;

export const cancellableOrderStatuses = [
  ...preProductionStatuses,
  ...productionWorkflows.konveksi_sablon.filter(
    (status) => status !== "selesai",
  ),
  ...productionWorkflows.permak.filter((status) => status !== "selesai"),
  ...productionWorkflows.product.filter((status) => status !== "selesai"),
] as const;

export function isOrderCancellableStatus(status: string) {
  return cancellableOrderStatuses.some((candidate) => candidate === status);
}

export type ProductionWorkflowStatus =
  (typeof productionWorkflows)[keyof typeof productionWorkflows][number];

export type OrderWorkflowInput = {
  order_kind: "service" | "product";
  service_flow: string | null;
  status: string;
};

export function getOrderWorkflow(
  order: Pick<OrderWorkflowInput, "order_kind" | "service_flow">,
): readonly ProductionWorkflowStatus[] | null {
  if (order.order_kind === "product") {
    return productionWorkflows.product;
  }

  if (order.service_flow === "konveksi_sablon") {
    return productionWorkflows.konveksi_sablon;
  }

  if (order.service_flow === "permak") {
    return productionWorkflows.permak;
  }

  return null;
}

export function getNextOrderStatus(
  order: OrderWorkflowInput,
): ProductionWorkflowStatus | null {
  const workflow = getOrderWorkflow(order);

  if (!workflow) return null;

  const currentIndex = workflow.findIndex((status) => status === order.status);

  if (currentIndex < 0 || currentIndex === workflow.length - 1) {
    return null;
  }

  return workflow[currentIndex + 1];
}
