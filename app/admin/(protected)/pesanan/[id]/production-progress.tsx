import { AdvanceOrderStatusControl } from "@/app/admin/(protected)/pesanan/[id]/advance-order-status-control";
import type { AdminOrderDetail } from "@/lib/orders/admin-orders";
import { orderStatusLabels } from "@/lib/orders/order-status";
import {
  getNextOrderStatus,
  getOrderWorkflow,
} from "@/lib/orders/order-workflows";

export function ProductionProgress({ order }: { order: AdminOrderDetail }) {
  const workflow = getOrderWorkflow(order);

  if (!workflow) return null;

  const currentIndex = workflow.findIndex((status) => status === order.status);

  if (currentIndex < 0) return null;

  const nextStatus = getNextOrderStatus(order);
  const isCompleted = order.status === "selesai";

  return (
    <section
      id="production-progress"
      aria-labelledby="order-progress-heading"
      className={`scroll-mt-24 border bg-surface-white p-5 md:p-6 ${nextStatus ? "border-primary/30" : "border-outline-variant"}`}
    >
      <h2
        id="order-progress-heading"
        className="font-heading text-admin-section text-primary"
      >
        Progres Pesanan
      </h2>
      <p className="mt-2 max-w-2xl text-admin-body text-on-surface-variant">
        {isCompleted
          ? "Seluruh tahap pesanan telah diselesaikan."
          : order.order_kind === "product"
            ? "Perbarui progres penyiapan produk secara berurutan."
            : "Perbarui progres secara berurutan. Tahap produksi tidak dapat dilewati."}
      </p>

      <ol
        className="mt-5 grid gap-2 sm:grid-cols-2"
        aria-label="Tahapan pesanan"
      >
        {workflow.map((stage, index) => {
          const isCurrent = index === currentIndex;
          const isStageCompleted = isCompleted || index < currentIndex;
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
              key={stage}
              aria-current={isCurrent ? "step" : undefined}
              className={`grid min-w-0 grid-cols-[2rem_minmax(0,1fr)] gap-3 border-l-2 px-3 py-2.5 ${stateClassName}`}
            >
              <span
                aria-hidden="true"
                className="text-admin-caption font-semibold text-on-surface-variant"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0">
                <span className="block break-words text-admin-body font-semibold text-primary">
                  {orderStatusLabels[stage]}
                </span>
                <span className="mt-0.5 block text-admin-caption text-on-surface-variant">
                  {stateLabel}
                </span>
              </span>
            </li>
          );
        })}
      </ol>

      {nextStatus ? (
        <div className="mt-6 border-t border-outline-variant pt-5">
          <p className="text-admin-caption font-semibold uppercase tracking-label text-on-surface-variant">
            Tindakan berikutnya
          </p>
          <h3 className="mt-1 font-heading text-admin-section text-primary">
            {nextStatus === "selesai"
              ? "Selesaikan Pesanan"
              : `Lanjut ke ${orderStatusLabels[nextStatus]}`}
          </h3>
          <p className="mt-2 max-w-2xl text-admin-body text-on-surface-variant">
            Perbarui status setelah tahap saat ini selesai dikerjakan.
          </p>
          <dl className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <dt className="text-admin-caption font-semibold uppercase tracking-label text-on-surface-variant">
                Status Saat Ini
              </dt>
              <dd className="mt-1 text-admin-body text-on-surface">
                {orderStatusLabels[order.status]}
              </dd>
            </div>
            <div>
              <dt className="text-admin-caption font-semibold uppercase tracking-label text-on-surface-variant">
                Tahap Berikutnya
              </dt>
              <dd className="mt-1 text-admin-body text-on-surface">
                {orderStatusLabels[nextStatus]}
              </dd>
            </div>
          </dl>
          <AdvanceOrderStatusControl
            orderId={order.id}
            currentStatusLabel={orderStatusLabels[order.status]}
            nextStatusLabel={orderStatusLabels[nextStatus]}
            completesOrder={nextStatus === "selesai"}
            isProduct={order.order_kind === "product"}
          />
        </div>
      ) : null}
    </section>
  );
}
