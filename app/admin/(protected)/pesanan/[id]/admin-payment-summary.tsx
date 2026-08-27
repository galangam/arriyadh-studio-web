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
    ? "Bukti dikirim, menunggu verifikasi"
    : "Bukti pembayaran belum dikirim";
}

export function AdminPaymentSummary({ order }: { order: AdminOrderDetail }) {
  const isProduct = order.order_kind === "product";

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
        <div className="flex items-start justify-between gap-4">
          <dt className="text-admin-body text-on-surface-variant">
            Total Harga
          </dt>
          <dd className="text-right text-admin-body font-semibold text-primary">
            {formatOrderPrice(order.price)}
          </dd>
        </div>

        {!isProduct ? (
          <div className="flex items-start justify-between gap-4 border-t border-outline-variant pt-4">
            <dt className="text-admin-body text-on-surface-variant">DP</dt>
            <dd className="text-right text-admin-body font-semibold text-primary">
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
          <dd className="text-right text-admin-body font-semibold text-primary">
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
          <dd className="text-right text-admin-body font-semibold text-primary">
            {isProduct
              ? getProductPaymentState(order)
              : order.payment_verified_at
                ? "Terverifikasi"
                : "Belum diverifikasi"}
          </dd>
        </div>
      </dl>
    </section>
  );
}
