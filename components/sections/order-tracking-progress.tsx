import { orderStatusLabels, type OrderStatus } from "@/lib/orders/order-status";
import { getOrderWorkflow } from "@/lib/orders/order-workflows";

type OrderTrackingProgressProps =
  | {
      kind: "service";
      serviceFlow: "konveksi_sablon" | "permak";
      status: OrderStatus;
    }
  | {
      kind: "product";
      status: OrderStatus;
    };

type VisibleStage = {
  key: OrderStatus;
  label: string;
};

function getVisibleStages(
  props: OrderTrackingProgressProps,
): readonly VisibleStage[] | null {
  const workflow = getOrderWorkflow({
    order_kind: props.kind,
    service_flow: props.kind === "service" ? props.serviceFlow : null,
  });

  if (!workflow || props.status === "dibatalkan") return null;

  if (props.kind === "product") {
    if (props.status === "menunggu_verifikasi") return null;

    const productStages: readonly VisibleStage[] = [
      { key: "menunggu_verifikasi", label: "Verifikasi" },
      ...workflow.map((status) => ({
        key: status,
        label: orderStatusLabels[status],
      })),
    ];

    return productStages.some((stage) => stage.key === props.status)
      ? productStages
      : null;
  }

  if (!workflow.some((status) => status === props.status)) return null;

  return workflow.map((status) => ({
    key: status,
    label: orderStatusLabels[status],
  }));
}

export function OrderTrackingProgress(props: OrderTrackingProgressProps) {
  const stages = getVisibleStages(props);
  if (!stages) return null;

  const completed = props.status === "selesai";
  const currentIndex = stages.findIndex((stage) => stage.key === props.status);

  return (
    <section
      aria-labelledby="tracking-progress-heading"
      className="border-t border-outline-variant pt-6"
    >
      <h3
        id="tracking-progress-heading"
        className="font-heading text-heading-sm text-primary"
      >
        {props.kind === "product" ? "Progres Pesanan" : "Alur Produksi"}
      </h3>

      <ol
        aria-label={
          props.kind === "product"
            ? "Tahapan penyiapan produk"
            : "Tahapan produksi pesanan"
        }
        className="mt-5 flex flex-col gap-3 md:grid md:gap-2"
        style={{ gridTemplateColumns: `repeat(${stages.length}, minmax(0, 1fr))` }}
      >
        {stages.map((stage, index) => {
          const isCurrent = !completed && index === currentIndex;
          const isStageCompleted = completed || index < currentIndex;
          const stateLabel = isStageCompleted
            ? "Selesai"
            : isCurrent
              ? "Tahap saat ini"
              : "Belum dimulai";
          const stateClassName = isCurrent
            ? "border-primary bg-surface-container-low"
            : isStageCompleted
              ? "border-success-green bg-surface-white"
              : "border-outline-variant bg-surface-white";

          return (
            <li
              key={stage.key}
              aria-current={isCurrent ? "step" : undefined}
              className={`grid min-w-0 grid-cols-[2rem_minmax(0,1fr)] gap-3 border-l-2 px-3 py-2.5 md:block md:border-l-0 md:border-t-2 md:px-2 ${stateClassName}`}
            >
              <span
                aria-hidden="true"
                className="text-label-md font-semibold text-on-surface-variant"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0 md:mt-2 md:block">
                <span className="block break-words font-body text-body-sm font-semibold text-primary">
                  {stage.label}
                </span>
                <span className="mt-0.5 block font-body text-label-sm text-on-surface-variant">
                  {stateLabel}
                </span>
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
