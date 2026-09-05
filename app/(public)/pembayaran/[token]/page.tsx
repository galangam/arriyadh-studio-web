import type { Metadata } from "next";

import { PaymentSubmissionForm } from "@/app/(public)/pembayaran/[token]/payment-submission-form";
import { Container } from "@/components/ui/container";
import {
  WhatsappActionIcon,
  whatsappActionClassName,
} from "@/components/ui/whatsapp-action";
import { getSiteSettings } from "@/lib/content/site-settings";
import {
  getPublicPaymentOrder,
  type PublicPaymentOrder,
} from "@/lib/orders/public-payment";
import {
  createProductOrderWhatsappUrl,
  createServicePaymentWhatsappUrl,
} from "@/lib/whatsapp";

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
  const productWhatsappUrl =
    isProduct && isTransfer && order.has_payment_proof
      ? createProductOrderWhatsappUrl("transfer", {
          orderCode: order.order_code,
          productName: order.product_name_snapshot,
          material: order.material,
          sleeveType: order.product_sleeve_type,
          size: order.product_size,
          quantity: order.quantity,
          total: order.price,
        })
      : null;
  const serviceWhatsappUrl = !isProduct
    ? order.status === "menunggu_verifikasi" && isTransfer
      ? createServicePaymentWhatsappUrl("transfer", {
          orderCode: order.order_code,
          serviceName: order.service_name_snapshot,
        })
      : order.status === "menunggu_konfirmasi_dp" &&
          order.payment_method === "cod"
        ? createServicePaymentWhatsappUrl("cod", {
            orderCode: order.order_code,
            serviceName: order.service_name_snapshot,
          })
        : null
    : null;
  const whatsappConfirmationUrl = productWhatsappUrl ?? serviceWhatsappUrl;
  const isServiceTransferPending =
    !isProduct && order.status === "menunggu_verifikasi" && isTransfer;
  const isServiceCodPending =
    !isProduct &&
    order.status === "menunggu_konfirmasi_dp" &&
    order.payment_method === "cod";
  const whatsappHeading = isServiceCodPending
    ? "Koordinasikan DP dengan Admin"
    : whatsappConfirmationUrl
      ? "Konfirmasi Pembayaran ke Admin"
      : null;
  const whatsappSupportingCopy = isServiceCodPending
    ? "Silakan hubungi admin untuk mengatur pembayaran DP di tempat."
    : isServiceTransferPending || productWhatsappUrl
      ? "Bukti pembayaran sudah tersimpan. Untuk mempercepat pengecekan, Anda dapat mengonfirmasi pembayaran kepada admin melalui WhatsApp."
      : null;
  const whatsappButtonLabel = isServiceCodPending
    ? "Hubungi Admin via WhatsApp"
    : "Konfirmasi via WhatsApp";

  return (
    <section
      aria-labelledby="payment-state-heading"
      className="border border-outline-variant bg-surface-white p-6 sm:p-8"
    >
      <p className="font-body text-label-md font-semibold uppercase tracking-label text-secondary">
        {isTransfer
          ? "Menunggu Verifikasi Admin"
          : "Menunggu Konfirmasi Admin"}
      </p>
      <h2
        id="payment-state-heading"
        className="mt-2 font-heading text-heading-md text-primary"
      >
        {isTransfer
          ? "Bukti pembayaran sudah diterima sistem."
          : "Metode pembayaran COD telah dipilih."}
      </h2>
      <p className="mt-3 font-body text-body-md text-on-surface-variant">
        {isTransfer
          ? "Pembayaran sedang menunggu verifikasi admin."
          : "Pesanan sedang menunggu konfirmasi admin."}
      </p>
      {whatsappConfirmationUrl &&
      whatsappHeading &&
      whatsappSupportingCopy ? (
        <section
          aria-labelledby="payment-whatsapp-heading"
          className="mt-6 border-t border-outline-variant pt-6"
        >
          <h3
            id="payment-whatsapp-heading"
            className="font-heading text-heading-sm text-primary"
          >
            {whatsappHeading}
          </h3>
          <p className="mt-2 font-body text-body-sm text-on-surface-variant">
            {whatsappSupportingCopy}
          </p>
          <a
            href={whatsappConfirmationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`${whatsappActionClassName} mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-md px-gutter font-body text-button sm:w-auto`}
          >
            <WhatsappActionIcon />
            {whatsappButtonLabel}
          </a>
        </section>
      ) : null}
    </section>
  );
}

function OrderSummary({ order }: { order: PublicPaymentOrder }) {
  const isProduct = order.order_kind === "product";

  return (
    <section
      aria-labelledby="payment-order-summary"
      className="border border-outline-variant bg-surface-white p-6 sm:p-8 lg:sticky lg:top-24"
    >
      <h2
        id="payment-order-summary"
        className="font-heading text-heading-md text-primary"
      >
        Ringkasan Pesanan
      </h2>
      <dl className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
        <div>
          <dt className="font-body text-label-md text-on-surface-variant">
            Kode Pesanan
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
        {order.payment_method ? (
          <div>
            <dt className="font-body text-label-md text-on-surface-variant">
              Metode Pembayaran
            </dt>
            <dd className="mt-1 font-body text-body-md font-semibold text-primary">
              {order.payment_method === "cod" ? "COD" : "Transfer Bank BRI"}
            </dd>
          </div>
        ) : null}
        {isProduct ? (
          order.material ? (
            <div>
              <dt className="font-body text-label-md text-on-surface-variant">
                Bahan
              </dt>
              <dd className="mt-1 font-body text-body-md font-semibold text-primary">
                {order.material}
              </dd>
            </div>
          ) : null
        ) : null}
        {isProduct && order.product_sleeve_type ? (
          <div>
            <dt className="font-body text-label-md text-on-surface-variant">
              Jenis Lengan
            </dt>
            <dd className="mt-1 font-body text-body-md font-semibold text-primary">
              {order.product_sleeve_type}
            </dd>
          </div>
        ) : null}
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
        {isProduct && order.unit_price !== null ? (
          <div>
            <dt className="font-body text-label-md text-on-surface-variant">
              Harga Satuan
            </dt>
            <dd className="mt-1 font-body text-body-md font-semibold text-primary">
              {rupiahFormatter.format(order.unit_price)}
            </dd>
          </div>
        ) : null}
        <div>
          <dt className="font-body text-label-md text-on-surface-variant">
            Total Harga
          </dt>
          <dd className="mt-1 font-body text-body-md font-semibold text-primary">
            {rupiahFormatter.format(order.price)}
          </dd>
        </div>
        <div className="border-t border-outline-variant pt-5 sm:col-span-2 lg:col-span-1">
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
  const [order, settings] = await Promise.all([
    getPublicPaymentOrder(token),
    getSiteSettings(),
  ]);
  const isProduct = order.order_kind === "product";
  const canSubmitPayment = isProduct
    ? !order.has_payment_proof
    : order.status === "menunggu_pembayaran_dp" &&
      order.payment_method === null;

  return (
    <main className="bg-surface-container-low py-12 text-on-surface sm:py-16 md:py-section-gap">
      <Container>
        <div className="mx-auto max-w-6xl">
          <header className="text-center">
            <p className="font-body text-label-md font-semibold uppercase tracking-label text-secondary">
              {isProduct ? "Pembayaran Produk" : "Pembayaran Layanan"}
            </p>
            <h1 className="mt-2 font-heading text-heading-strong text-primary sm:text-heading-lg">
              Pembayaran Pesanan
            </h1>
            <p className="mx-auto mt-3 max-w-xl font-body text-body-md text-on-surface-variant">
              {isProduct
                ? canSubmitPayment
                  ? "Periksa total pesanan lalu unggah bukti pembayaran transfer."
                  : "Periksa ringkasan pesanan dan status verifikasi pembayaran Anda."
                : canSubmitPayment
                  ? "Periksa ringkasan pesanan sebelum memilih metode pembayaran."
                  : "Periksa ringkasan pesanan dan langkah berikutnya dari admin."}
            </p>
          </header>

          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.75fr)] lg:items-start lg:gap-8">
            <div>
              {canSubmitPayment ? (
                <section
                  aria-labelledby="payment-method-heading"
                  className="border border-outline-variant bg-surface-white p-6 sm:p-8"
                >
                  <h2
                    id="payment-method-heading"
                    className="font-heading text-heading-md text-primary"
                  >
                    {isProduct
                      ? "Bukti Pembayaran"
                      : "Pilih Metode Pembayaran"}
                  </h2>
                  <p className="mt-2 font-body text-body-md text-on-surface-variant">
                    {isProduct
                      ? "Bayar total penuh melalui Transfer Bank BRI, lalu unggah bukti pembayaran."
                      : "Pilih Transfer atau COD untuk melanjutkan pesanan."}
                  </p>
                  <PaymentSubmissionForm
                    token={token}
                    orderKind={order.order_kind}
                    siteAddress={settings.address}
                    paymentAmount={isProduct ? order.price : order.dp_amount}
                  />
                </section>
              ) : (
                <PaymentPendingState order={order} />
              )}
            </div>

            <OrderSummary order={order} />
          </div>
        </div>
      </Container>
    </main>
  );
}
