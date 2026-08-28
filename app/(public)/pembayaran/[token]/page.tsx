import type { Metadata } from "next";

import { PaymentSubmissionForm } from "@/app/(public)/pembayaran/[token]/payment-submission-form";
import { Container } from "@/components/ui/container";
import {
  getPublicPaymentOrder,
  type PublicPaymentOrder,
} from "@/lib/orders/public-payment";

export const metadata: Metadata = {
  title: "Pembayaran Pesanan | Arriyadh Studio",
  description: "Selesaikan pembayaran pesanan Arriyadh Studio.",
  robots: { index: false, follow: false },
};

const rupiahFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

function PaymentPendingState({ order }: { order: PublicPaymentOrder }) {
  const isProduct = order.order_kind === "product";
  const isTransfer = order.payment_method === "transfer";

  return (
    <section
      aria-labelledby="payment-state-heading"
      className="border border-outline-variant bg-surface-white p-6 sm:p-8"
    >
      <p className="font-body text-label-md font-semibold uppercase tracking-label text-secondary">
        {isProduct ? "Pembayaran Diproses" : "Pembayaran Terkirim"}
      </p>
      <h2
        id="payment-state-heading"
        className="mt-2 font-heading text-heading-md text-primary"
      >
        {isTransfer
          ? "Bukti pembayaran telah dikirim."
          : "Metode pembayaran COD telah dipilih."}
      </h2>
      <p className="mt-3 font-body text-body-md text-on-surface-variant">
        {isTransfer
          ? "Pembayaran sedang menunggu verifikasi admin."
          : "Pesanan sedang menunggu konfirmasi admin."}
      </p>
    </section>
  );
}

function OrderSummary({ order }: { order: PublicPaymentOrder }) {
  const isProduct = order.order_kind === "product";

  return (
    <section
      aria-labelledby="payment-order-summary"
      className="mt-8 border border-outline-variant bg-surface-white p-6 sm:p-8"
    >
      <h2
        id="payment-order-summary"
        className="font-heading text-heading-md text-primary"
      >
        Ringkasan Pesanan
      </h2>
      <dl className="mt-6 grid gap-5 sm:grid-cols-2">
        <div>
          <dt className="font-body text-label-md text-on-surface-variant">
            Order ID
          </dt>
          <dd className="mt-1 break-words font-body text-body-md font-semibold text-primary">
            {order.order_code}
          </dd>
        </div>
        <div>
          <dt className="font-body text-label-md text-on-surface-variant">
            {isProduct ? "Produk" : "Layanan"}
          </dt>
          <dd className="mt-1 break-words font-body text-body-md font-semibold text-primary">
            {isProduct
              ? order.product_name_snapshot
              : (order.service_name_snapshot ?? "Layanan Custom")}
          </dd>
        </div>
        {isProduct ? (
          <div>
            <dt className="font-body text-label-md text-on-surface-variant">
              Ukuran
            </dt>
            <dd className="mt-1 font-body text-body-md font-semibold text-primary">
              {order.product_size}
            </dd>
          </div>
        ) : null}
        <div>
          <dt className="font-body text-label-md text-on-surface-variant">
            Jumlah
          </dt>
          <dd className="mt-1 font-body text-body-md font-semibold text-primary">
            {order.quantity} pcs
          </dd>
        </div>
        <div>
          <dt className="font-body text-label-md text-on-surface-variant">
            Total Harga
          </dt>
          <dd className="mt-1 font-body text-body-md font-semibold text-primary">
            {rupiahFormatter.format(order.price)}
          </dd>
        </div>
        <div className="border-t border-outline-variant pt-5 sm:col-span-2">
          <dt className="font-body text-label-md text-on-surface-variant">
            {isProduct ? "Jumlah yang Harus Dibayar" : "DP yang Harus Dibayar"}
          </dt>
          <dd className="mt-1 font-heading text-heading-md text-primary">
            {rupiahFormatter.format(isProduct ? order.price : order.dp_amount)}
          </dd>
        </div>
      </dl>
    </section>
  );
}

export default async function PublicPaymentPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const order = await getPublicPaymentOrder(token);
  const isProduct = order.order_kind === "product";
  const canSubmitPayment = isProduct
    ? !order.has_payment_proof
    : order.status === "menunggu_pembayaran_dp" &&
      order.payment_method === null;

  return (
    <main className="bg-surface-container-low py-12 text-on-surface sm:py-16 md:py-section-gap">
      <Container>
        <div className="mx-auto max-w-3xl">
          <header className="text-center">
            <p className="font-body text-label-md font-semibold uppercase tracking-label text-secondary">
              {isProduct ? "Pembayaran Produk" : "Pembayaran Layanan"}
            </p>
            <h1 className="mt-2 font-heading text-heading-strong text-primary sm:text-heading-lg">
              Pembayaran Pesanan
            </h1>
            <p className="mx-auto mt-3 max-w-xl font-body text-body-md text-on-surface-variant">
              {isProduct
                ? "Periksa total pesanan lalu unggah bukti pembayaran transfer."
                : "Periksa ringkasan pesanan sebelum memilih metode pembayaran."}
            </p>
          </header>

          <OrderSummary order={order} />

          <div className="mt-6">
            {canSubmitPayment ? (
              <section
                aria-labelledby="payment-method-heading"
                className="border border-outline-variant bg-surface-white p-6 sm:p-8"
              >
                <h2
                  id="payment-method-heading"
                  className="font-heading text-heading-md text-primary"
                >
                  {isProduct ? "Bukti Pembayaran" : "Pilih Metode Pembayaran"}
                </h2>
                <p className="mt-2 font-body text-body-md text-on-surface-variant">
                  {isProduct
                    ? "Bayar total penuh melalui Transfer Bank BRI, lalu unggah bukti pembayaran."
                    : "Pilih Transfer atau COD untuk melanjutkan pesanan."}
                </p>
                <PaymentSubmissionForm
                  token={token}
                  orderKind={order.order_kind}
                />
              </section>
            ) : (
              <PaymentPendingState order={order} />
            )}
          </div>
        </div>
      </Container>
    </main>
  );
}
