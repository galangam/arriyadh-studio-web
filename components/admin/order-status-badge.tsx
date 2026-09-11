import {
  orderStatusLabels,
  type OrderStatus,
} from "@/lib/orders/order-status";

function statusClasses(status: OrderStatus) {
  if (status === "selesai") {
    return "border-success-green/30 bg-success-green/10 text-success-green";
  }

  if (status === "dibatalkan") {
    return "border-error/30 bg-error-container text-error";
  }

  if (
    [
      "menunggu_harga",
      "menunggu_pembayaran_dp",
      "menunggu_konfirmasi_dp",
      "menunggu_verifikasi",
    ].includes(status)
  ) {
    return "border-status-amber/30 bg-status-amber/10 text-on-surface";
  }

  return "border-primary/20 bg-surface-container-low text-primary";
}

export function OrderStatusBadge({
  status,
  label = orderStatusLabels[status],
}: {
  status: OrderStatus;
  label?: string;
}) {
  return (
    <span
      className={`inline-flex max-w-full items-center gap-2 rounded-full border px-2.5 py-1 text-admin-caption font-semibold ${statusClasses(status)}`}
    >
      <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-current" />
      <span className="break-words">{label}</span>
    </span>
  );
}
