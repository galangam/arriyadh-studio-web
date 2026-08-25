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
