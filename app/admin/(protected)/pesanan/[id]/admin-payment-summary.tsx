import {
  formatOrderPrice,
  type AdminOrderDetail,
} from "@/lib/orders/admin-orders";

function getProductPaymentState(order: AdminOrderDetail) {
  if (order.status === "dibatalkan") return "Dibatalkan";

  if (order.payment_method === "cod") {
    return order.status === "menunggu_verifikasi"
      ? "Menunggu konfirmasi COD"
      : "COD dikonfirmasi";
  }

  if (order.payment_verified_at || ["diproses", "selesai"].includes(order.status)) {
    return "Terverifikasi";
  }

  return order.payment_proof_path
    ? "Menunggu Verifikasi Pembayaran"
    : "Menunggu Bukti Pembayaran";
}

export function AdminPaymentSummary({ order }: { order: AdminOrderDetail }) {
  const isProduct = order.order_kind === "product";
  const productPaymentState = isProduct ? getProductPaymentState(order) : null;
  const isProductTransferAwaitingProof =
    isProduct &&
    order.payment_method === "transfer" &&
    order.status === "menunggu_verifikasi" &&
    !order.payment_proof_path;

  return (
    <section
      aria-labelledby="payment-summary-heading"
      className="border border-outline-variant bg-surface-white p-5"
    >
      <h2
        id="payment-summary-heading"
        className="font-heading text-admin-section text-primary"
      >
        Ringkasan Pembayaran
      </h2>
      <dl className="mt-5 space-y-4">
        <div className="rounded-md bg-surface-container-low p-4">
          <dt className="text-admin-body text-on-surface-variant">
            Total Harga
          </dt>
          <dd className="mt-1 break-words font-heading text-heading-xs text-primary">
            {formatOrderPrice(order.price)}
          </dd>
        </div>

        {!isProduct ? (
          <div className="flex items-start justify-between gap-4 border-t border-outline-variant pt-4">
            <dt className="text-admin-body text-on-surface-variant">DP</dt>
            <dd className="break-words text-right text-admin-body font-semibold text-primary">
              {order.dp_amount === null
                ? "Belum ditentukan"
                : formatOrderPrice(order.dp_amount)}
            </dd>
          </div>
        ) : null}

        <div className="flex items-start justify-between gap-4 border-t border-outline-variant pt-4">
          <dt className="text-admin-body text-on-surface-variant">
            Metode Pembayaran
          </dt>
          <dd className="break-words text-right text-admin-body font-semibold text-primary">
            {order.payment_method === "transfer"
              ? "Transfer Bank BRI"
              : order.payment_method === "cod"
                ? "COD"
                : "Belum dipilih"}
          </dd>
        </div>

        <div className="flex items-start justify-between gap-4 border-t border-outline-variant pt-4">
          <dt className="text-admin-body text-on-surface-variant">
            {isProduct ? "Status Pembayaran" : "Status Verifikasi"}
          </dt>
          <dd className="max-w-40 break-words text-right text-admin-body font-semibold text-primary">
            {isProduct
              ? productPaymentState
              : order.payment_verified_at
                ? "Terverifikasi"
                : "Belum diverifikasi"}
            {isProductTransferAwaitingProof ? (
              <span className="mt-1 block text-admin-caption font-normal text-on-surface-variant">
                Pelanggan belum mengirim bukti pembayaran.
              </span>
            ) : null}
          </dd>
        </div>
      </dl>
    </section>
  );
}
