import Link from "next/link";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { WhatsappMessagePreview } from "@/components/admin/whatsapp-message-preview";
import { CancelOrderControl } from "@/app/admin/(protected)/pesanan/[id]/cancel-order-control";
import { DesignReferenceControl } from "@/app/admin/(protected)/pesanan/[id]/design-reference-control";
import { AdminPaymentSummary } from "@/app/admin/(protected)/pesanan/[id]/admin-payment-summary";

import {
  CodConfirmationControl,
  TransferVerificationControls,
} from "@/app/admin/(protected)/pesanan/[id]/payment-verification-controls";

import { ProductionProgress } from "@/app/admin/(protected)/pesanan/[id]/production-progress";
import { ProductCodConfirmationSection } from "@/app/admin/(protected)/pesanan/[id]/product-cod-confirmation-section";
import { SetOrderPriceForm } from "@/app/admin/(protected)/pesanan/[id]/set-order-price-form";
import { ServicePaymentLinkSection } from "@/app/admin/(protected)/pesanan/[id]/service-payment-link-section";
import {
  WhatsappActionIcon,
  whatsappActionClassName,
} from "@/components/ui/whatsapp-action";

import {
  formatAdminOrderDateTime,
  formatOrderPrice,
  getAdminOrderDetail,
  orderKindLabels,
  productionStatuses,
  type AdminDesignReference,
  type AdminOrderDetail,
} from "@/lib/orders/admin-orders";
import { orderStatusLabels } from "@/lib/orders/order-status";
import { isOrderCancellableStatus } from "@/lib/orders/order-workflows";
import { getJerseyVariantTypeLabel } from "@/lib/services/service-requirements";
import { getSiteOrigin } from "@/lib/site-origin";
import {
  createAdminOrderStatusWhatsappUrl,
  createWhatsappUrl,
} from "@/lib/whatsapp";

const emptyValue = "—";

const designReferenceTypeLabels: Record<
  AdminDesignReference["mime_type"],
  string
> = {
  "image/jpeg": "JPEG",
  "image/png": "PNG",
  "image/webp": "WebP",
  "application/pdf": "PDF",
};

type DetailItem = { label: string; value: string | number | null };

function DetailList({ items }: { items: DetailItem[] }) {
  return (
    <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.label} className="min-w-0">
          <dt className="text-admin-caption font-semibold uppercase tracking-label text-on-surface-variant">
            {item.label}
          </dt>
          <dd className="mt-1 break-words text-admin-body text-on-surface">
            {item.value ?? emptyValue}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function OrderInformation({ order }: { order: AdminOrderDetail }) {
  const isOtherService =
    order.service_name_snapshot?.toLowerCase() === "lainnya";
  const serviceFlowLabel =
    order.service_flow === "konveksi_sablon"
      ? "Konveksi / Sablon"
      : order.service_flow === "permak"
        ? "Permak"
        : "Layanan Custom";
  const items: DetailItem[] =
    order.order_kind === "product"
      ? [
          { label: "Nama Produk", value: order.product_name_snapshot },
          { label: "Bahan", value: order.material },
          { label: "Jenis Lengan", value: order.product_sleeve_type },
          { label: "Ukuran", value: order.product_size },
          { label: "Jumlah", value: `${order.quantity} pcs` },
          {
            label: "Harga Satuan",
            value:
              order.unit_price === null
                ? emptyValue
                : formatOrderPrice(order.unit_price),
          },
        ]
      : [
          { label: "Nama Layanan", value: order.service_name_snapshot },
          { label: "Jenis Layanan", value: serviceFlowLabel },
          {
            label:
              isOtherService
                ? "Detail Kebutuhan"
                : order.service_flow === "konveksi_sablon"
                  ? "Material / Bahan"
                  : order.service_flow === "permak"
                  ? "Deskripsi Pekerjaan"
                  : "Detail Kebutuhan",
            value:
              order.service_flow === "permak"
                ? order.job_description
                : order.service_variants.length === 0
                  ? order.material
                  : null,
          },
          { label: "Jumlah", value: `${order.quantity} pcs` },
        ];

  return <DetailList items={items} />;
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getAdminOrderDetail(id);
  const siteOrigin = await getSiteOrigin();
  const showServicePaymentLink =
    order.order_kind === "service" &&
    order.payment_token !== null &&
    order.price !== null &&
    order.dp_amount !== null &&
    order.status !== "menunggu_harga" &&
    ["menunggu_pembayaran_dp", "menunggu_konfirmasi_dp", "menunggu_verifikasi"].includes(order.status) &&
    !(order.payment_method === "transfer" && order.payment_proof_path) &&
    siteOrigin !== null;
  const servicePaymentUrl = showServicePaymentLink
    ? `${siteOrigin}/pembayaran/${order.payment_token}`
    : null;
  const servicePaymentWhatsappUrl = servicePaymentUrl
    ? createWhatsappUrl(
        order.customer_whatsapp,
        `Halo ${order.customer_name},\n\nHarga pesanan Anda sudah ditentukan.\n\nKode Pesanan: ${order.order_code}\nLayanan: ${order.service_name_snapshot ?? "Layanan custom"}\nTotal Pesanan: ${formatOrderPrice(order.price)}\nDP: ${formatOrderPrice(order.dp_amount)}\n\nSilakan pilih metode pembayaran dan lakukan pembayaran DP melalui link berikut:\n${servicePaymentUrl}\n\nTerima kasih.`,
      )
    : null;
  const showProductTransferPaymentLink =
    order.order_kind === "product" &&
    order.payment_method === "transfer" &&
    order.status === "menunggu_verifikasi" &&
    !order.payment_proof_path &&
    order.payment_token !== null &&
    siteOrigin !== null;
  const productPaymentUrl = showProductTransferPaymentLink
    ? `${siteOrigin}/pembayaran/${order.payment_token}`
    : null;
  const productPaymentWhatsappUrl = productPaymentUrl
    ? createWhatsappUrl(
        order.customer_whatsapp,
        `Halo ${order.customer_name},\n\nSilakan selesaikan pembayaran pesanan Anda.\n\nKode Pesanan: ${order.order_code}\nProduk: ${order.product_name_snapshot ?? "Produk"}\n\nLakukan pembayaran Transfer Bank BRI dan unggah bukti pembayaran melalui link berikut:\n${productPaymentUrl}\n\nTerima kasih.`,
      )
    : null;
  const servicePaymentWhatsappMessage = servicePaymentWhatsappUrl
    ? new URL(servicePaymentWhatsappUrl).searchParams.get("text") ?? ""
    : "";
  const productPaymentWhatsappMessage = productPaymentWhatsappUrl
    ? new URL(productPaymentWhatsappUrl).searchParams.get("text") ?? ""
    : "";
  const isServiceProductionStatus =
    order.order_kind === "service" &&
    productionStatuses.some((status) => status === order.status);
  const statusWhatsappUpdate = isServiceProductionStatus
    ? "progress"
    : order.order_kind === "product" && order.status === "diproses"
      ? "product_processing"
      : order.status === "selesai"
        ? "completed"
        : order.status === "dibatalkan"
          ? "cancelled"
          : null;
  const statusWhatsappUrl = statusWhatsappUpdate
    ? createAdminOrderStatusWhatsappUrl(statusWhatsappUpdate, {
        customerWhatsapp: order.customer_whatsapp,
        customerName: order.customer_name,
        orderCode: order.order_code,
        orderKind: order.order_kind,
        orderName:
          order.order_kind === "product"
            ? (order.product_name_snapshot ?? "Produk")
            : (order.service_name_snapshot ?? "Layanan custom"),
        statusLabel: orderStatusLabels[order.status],
      })
    : null;
  const statusWhatsappButtonLabel =
    statusWhatsappUpdate === "completed"
      ? "Beri Tahu Pelanggan via WhatsApp"
      : statusWhatsappUpdate === "cancelled"
        ? "Hubungi Pelanggan via WhatsApp"
        : "Kirim Update via WhatsApp";
  const statusWhatsappMessage = statusWhatsappUrl
    ? new URL(statusWhatsappUrl).searchParams.get("text")
    : null;
  const statusDetails: DetailItem[] = [];
  const nextAction =
    order.order_kind === "service" && order.status === "menunggu_harga"
      ? { href: "#set-order-price", label: "Buka Penetapan Harga" }
      : order.payment_method === "transfer" &&
          order.status === "menunggu_verifikasi" &&
          order.payment_proof_path
        ? { href: "#verify-payment", label: "Buka Verifikasi Pembayaran" }
        : order.order_kind === "service" &&
            order.payment_method === "cod" &&
            order.status === "menunggu_konfirmasi_dp"
          ? { href: "#confirm-cod", label: "Buka Konfirmasi COD" }
          : order.order_kind === "product" &&
              order.payment_method === "cod" &&
              order.status === "menunggu_verifikasi"
            ? { href: "#confirm-product-cod", label: "Buka Konfirmasi Pesanan COD" }
            : productPaymentUrl
              ? { href: "#product-payment-link", label: "Buka Opsi Kirim Link Pembayaran" }
              : servicePaymentUrl
              ? { href: "#service-payment-link", label: "Buka Opsi Kirim Link Pembayaran" }
              : isServiceProductionStatus ||
                  (order.order_kind === "product" && order.status === "diproses")
                ? { href: "#production-progress", label: "Buka Kontrol Progres" }
                : null;

  if (order.quoted_at) {
    statusDetails.push({
      label: "Harga Ditetapkan",
      value: formatAdminOrderDateTime(order.quoted_at),
    });
  }

  if (order.status === "dibatalkan") {
    statusDetails.push({
      label: "Alasan Pembatalan",
      value: order.cancellation_reason ?? emptyValue,
    });
  }

  if (order.status === "selesai" && order.completed_at) {
    statusDetails.push({
      label: "Diselesaikan Pada",
      value: formatAdminOrderDateTime(order.completed_at),
    });
  }

  return (
    <main className="w-full px-margin-mobile py-8 md:px-gutter md:py-10">
      <div className="mx-auto w-full max-w-content">
        <Link
          href="/admin/pesanan"
          className="inline-flex text-admin-label text-on-surface-variant underline-offset-4 hover:text-primary hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <span aria-hidden="true">←&nbsp;</span>
          Kembali ke Daftar Pesanan
        </Link>

        <header className="mt-5 border-b border-outline-variant pb-6">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-admin-label text-on-surface-variant">
              {orderKindLabels[order.order_kind]}
            </p>
            <OrderStatusBadge status={order.status} />
          </div>
          <h1 className="mt-2 break-words font-heading text-admin-title text-primary">
            {order.order_code}
          </h1>
          <p className="mt-2 break-words text-admin-body font-semibold text-on-surface">
            {order.order_kind === "product"
              ? order.product_name_snapshot
              : order.service_name_snapshot}
            <span className="font-normal text-on-surface-variant"> · {order.customer_name}</span>
          </p>
          <p className="mt-1 text-admin-caption text-on-surface-variant">
            Dibuat pada {formatAdminOrderDateTime(order.created_at)}
          </p>
        </header>

        <div className="mt-8 grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_20rem] xl:items-start">
          <div className="min-w-0 space-y-6">
            <section
              aria-labelledby="customer-information-heading"
              className="border border-outline-variant bg-surface-white p-5 md:p-6"
            >
              <h2
                id="customer-information-heading"
                className="font-heading text-admin-section text-primary"
              >
                Informasi Pelanggan
              </h2>
              <div className="mt-5">
                <DetailList
                  items={[
                    { label: "Nama Pemesan", value: order.customer_name },
                    {
                      label: "Perusahaan/Instansi",
                      value: order.customer_company,
                    },
                    { label: "Email", value: order.customer_email },
                    { label: "No. WhatsApp", value: order.customer_whatsapp },
                    {
                      label: "Alamat Pengiriman",
                      value: order.shipping_address,
                    },
                  ]}
                />
              </div>
            </section>

            <section
              aria-labelledby="order-summary-heading"
              className="border border-outline-variant bg-surface-white p-5 md:p-6"
            >
              <h2
                id="order-summary-heading"
                className="font-heading text-admin-section text-primary"
              >
                Ringkasan Pesanan
              </h2>
              <div className="mt-5">
                <OrderInformation order={order} />
              </div>
            </section>

            {order.order_kind === "service" &&
            order.service_variants.length > 0 ? (
              <section
                aria-labelledby="service-variants-heading"
                className="border border-outline-variant bg-surface-white p-5 md:p-6"
              >
                <h2
                  id="service-variants-heading"
                  className="font-heading text-admin-section text-primary"
                >
                  Rincian Pesanan
                </h2>
                <div className="mt-5 space-y-5">
                  {order.service_variants.map((variant) => (
                    <article
                      key={[
                        variant.variant_type,
                        variant.material,
                        variant.sleeve_type,
                      ].join(":")}
                      className="border border-outline-variant bg-surface-container-low p-4"
                    >
                      {order.service_name_snapshot?.toLowerCase() === "jersey" ||
                      order.service_name_snapshot?.toLowerCase() ===
                        "jersey embos" ? (
                        <>
                          <p className="text-admin-body text-on-surface-variant">
                            Jenis Jersey
                          </p>
                          <h3 className="font-heading text-admin-body font-semibold text-primary">
                            {getJerseyVariantTypeLabel(variant.variant_type)}
                          </h3>
                          <dl className="mt-3 grid gap-2 text-admin-body sm:grid-cols-2">
                            <div>
                              <dt className="text-on-surface-variant">
                                Material
                              </dt>
                              <dd className="font-semibold">
                                {variant.material}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-on-surface-variant">
                                Jenis Lengan
                              </dt>
                              <dd className="font-semibold">
                                {variant.sleeve_type}
                              </dd>
                            </div>
                          </dl>
                        </>
                      ) : (
                        <h3 className="font-heading text-admin-body font-semibold text-primary">
                          {variant.material} {" - "} {variant.sleeve_type}
                        </h3>
                      )}
                      {variant.sizes.length > 0 ? (
                        <dl className="mt-3 grid max-w-sm grid-cols-2 gap-x-8 gap-y-2 text-admin-body">
                          {variant.sizes.map((size) => (
                            <div key={size.size} className="contents">
                              <dt>{size.size}</dt>
                              <dd className="text-right">{size.quantity} pcs</dd>
                            </div>
                          ))}
                        </dl>
                      ) : null}
                      <p className="mt-3 border-t border-outline-variant pt-3 text-admin-body font-semibold text-primary">
                        Subtotal: {variant.quantity} pcs
                      </p>
                    </article>
                  ))}
                </div>
                <p className="mt-5 border-t border-outline-variant pt-4 text-admin-body font-semibold text-primary">
                  Total: {order.quantity} pcs
                </p>
              </section>
            ) : null}

            {order.order_kind === "service" &&
            (order.design_description || order.design_references.length > 0) ? (
              <section
                aria-labelledby="design-specification-heading"
                className="border border-outline-variant bg-surface-white p-5 md:p-6"
              >
                <h2
                  id="design-specification-heading"
                  className="font-heading text-admin-section text-primary"
                >
                  Spesifikasi Desain
                </h2>
                {order.design_description ? (
                  <div className="mt-5">
                    <DetailList
                      items={[
                        {
                          label: "Detail Desain",
                          value: order.design_description,
                        },
                      ]}
                    />
                  </div>
                ) : null}
                {order.design_references.length > 0 ? (
                  <div className="mt-5 border-t border-outline-variant pt-5">
                    <p className="text-admin-caption font-semibold uppercase tracking-label text-on-surface-variant">
                      Referensi Desain
                    </p>
                    <ul className="mt-3 space-y-3">
                      {order.design_references.map((reference, index) => (
                        <li
                          key={reference.id}
                          className="flex flex-wrap items-center justify-between gap-3 border border-outline-variant bg-surface-container-low p-3"
                        >
                          <div>
                            <p className="text-admin-body font-semibold text-on-surface">
                              Referensi {index + 1}
                            </p>
                            <p className="text-admin-caption text-on-surface-variant">
                              {designReferenceTypeLabels[reference.mime_type]}
                            </p>
                          </div>
                          <DesignReferenceControl referenceId={reference.id} />
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </section>
            ) : null}


            {order.order_kind === "service" &&
              order.status === "menunggu_harga" && (
                <section
                  id="set-order-price"
                  aria-labelledby="set-order-price-heading"
                  className="scroll-mt-24 border border-primary/30 bg-surface-white p-5 md:p-6"
                >
                  <p className="text-admin-caption font-semibold uppercase tracking-label text-on-surface-variant">
                    Tindakan berikutnya
                  </p>
                  <h2
                    id="set-order-price-heading"
                    className="mt-1 font-heading text-admin-section text-primary"
                  >
                    Tetapkan Harga Pesanan
                  </h2>
                  <p className="mt-2 max-w-2xl text-admin-body text-on-surface-variant">
                    Tentukan total harga pesanan. DP sekitar 50% akan dihitung
                    otomatis.
                  </p>
                  <SetOrderPriceForm orderId={order.id} />
                </section>
              )}

            {productPaymentUrl && productPaymentWhatsappUrl ? (
              <section
                id="product-payment-link"
                aria-labelledby="product-payment-link-heading"
                className="scroll-mt-24 border border-primary/30 bg-surface-white p-5 md:p-6"
              >
                <p className="text-admin-caption font-semibold uppercase tracking-label text-on-surface-variant">
                  Tindakan berikutnya
                </p>
                <h2
                  id="product-payment-link-heading"
                  className="mt-1 font-heading text-admin-section text-primary"
                >
                  Kirim Link Pembayaran
                </h2>
                <p className="mt-2 max-w-2xl text-admin-body text-on-surface-variant">
                  Pelanggan memilih Transfer Bank BRI tetapi belum mengirim
                  bukti pembayaran. Kirim link pembayaran agar pelanggan dapat
                  menyelesaikan transfer dan mengunggah bukti pembayaran.
                </p>
                <div className="mt-5">
                  <WhatsappMessagePreview
                    message={productPaymentWhatsappMessage}
                  />
                </div>
                <a
                  href={productPaymentWhatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${whatsappActionClassName} mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-md px-5 text-center text-admin-label font-semibold sm:w-auto`}
                >
                  <WhatsappActionIcon />
                  Kirim Link Pembayaran via WhatsApp
                </a>
              </section>
            ) : null}

            {servicePaymentUrl && servicePaymentWhatsappUrl ? (
              <div id="service-payment-link" className="scroll-mt-24">
                <ServicePaymentLinkSection
                  paymentUrl={servicePaymentUrl}
                  message={servicePaymentWhatsappMessage}
                  whatsappUrl={servicePaymentWhatsappUrl}
                />
              </div>
            ) : null}

            {order.payment_method === "transfer" &&
              order.status === "menunggu_verifikasi" &&
              order.payment_proof_path && (
                <section
                  id="verify-payment"
                  aria-labelledby="verify-payment-heading"
                  className="scroll-mt-24 border border-primary/30 bg-surface-white p-5 md:p-6"
                >
                  <p className="text-admin-caption font-semibold uppercase tracking-label text-on-surface-variant">
                    Tindakan berikutnya
                  </p>
                  <h2
                    id="verify-payment-heading"
                    className="mt-1 font-heading text-admin-section text-primary"
                  >
                    Verifikasi Pembayaran
                  </h2>
                  <p className="mt-2 max-w-2xl text-admin-body text-on-surface-variant">
                    Periksa bukti pembayaran sebelum memverifikasi dan
                    melanjutkan pesanan.
                  </p>
                  <div className="mt-5">
                    <DetailList
                      items={[
                        { label: "Metode", value: "Transfer" },
                        {
                          label:
                            order.order_kind === "product"
                              ? "Total Pembayaran"
                              : "DP",
                          value:
                            order.order_kind === "product"
                              ? formatOrderPrice(order.price)
                              : order.dp_amount === null
                                ? emptyValue
                                : formatOrderPrice(order.dp_amount),
                        },
                        { label: "Status", value: "Menunggu Verifikasi" },
                      ]}
                    />
                  </div>
                  <TransferVerificationControls orderId={order.id} />
                </section>
              )}

            {order.order_kind === "service" &&
              order.payment_method === "cod" &&
              order.status === "menunggu_konfirmasi_dp" && (
                <section
                  id="confirm-cod"
                  aria-labelledby="confirm-cod-heading"
                  className="scroll-mt-24 border border-primary/30 bg-surface-white p-5 md:p-6"
                >
                  <p className="text-admin-caption font-semibold uppercase tracking-label text-on-surface-variant">
                    Tindakan berikutnya
                  </p>
                  <h2
                    id="confirm-cod-heading"
                    className="mt-1 font-heading text-admin-section text-primary"
                  >
                    Konfirmasi COD
                  </h2>
                  <p className="mt-2 max-w-2xl text-admin-body text-on-surface-variant">
                    Konfirmasi metode COD untuk memulai alur produksi pesanan.
                  </p>
                  <CodConfirmationControl orderId={order.id} />
                </section>
              )}

            <ProductCodConfirmationSection order={order} />

            <ProductionProgress order={order} />

            {statusWhatsappUrl && statusWhatsappMessage ? (
              <section
                aria-labelledby="status-whatsapp-heading"
                className="border border-outline-variant bg-surface-white p-5 md:p-6"
              >
                <p className="text-admin-caption font-semibold uppercase tracking-label text-on-surface-variant">
                  Informasikan pelanggan
                </p>
                <h2
                  id="status-whatsapp-heading"
                  className="mt-1 font-heading text-admin-section text-primary"
                >
                  Kirim Update Status
                </h2>
                <p className="mt-2 max-w-2xl text-admin-body text-on-surface-variant">
                  Status pesanan sudah tersimpan. Pengiriman pesan WhatsApp
                  bersifat opsional dan tetap dilakukan secara manual.
                </p>
                <div className="mt-5">
                  <WhatsappMessagePreview message={statusWhatsappMessage} />
                </div>
                <a
                  href={statusWhatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${whatsappActionClassName} mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-md px-5 text-admin-label font-semibold sm:w-auto`}
                >
                  <WhatsappActionIcon />
                  {statusWhatsappButtonLabel}
                </a>
              </section>
            ) : null}

            {statusDetails.length > 0 && (
              <section
                aria-labelledby="status-information-heading"
                className="border border-outline-variant bg-surface-white p-5 md:p-6"
              >
                <h2
                  id="status-information-heading"
                  className="font-heading text-admin-section text-primary"
                >
                  Informasi Status
                </h2>
                <div className="mt-5">
                  <DetailList items={statusDetails} />
                </div>
              </section>
            )}

            {isOrderCancellableStatus(order.status) ? (
              <section
                aria-labelledby="cancel-order-heading"
                className="mt-10 border border-error/30 bg-surface-white p-5 md:p-6"
              >
                <h2
                  id="cancel-order-heading"
                  className="font-heading text-admin-section text-error"
                >
                  Batalkan Pesanan
                </h2>
                <p className="mt-2 max-w-2xl text-admin-body text-on-surface-variant">
                  Gunakan tindakan ini hanya jika pesanan tidak akan
                  dilanjutkan. Data pesanan tetap tersimpan.
                </p>
                <CancelOrderControl
                  orderId={order.id}
                  orderCode={order.order_code}
                  expectedStatus={order.status}
                />
              </section>
            ) : null}
          </div>

          <aside
            aria-label="Status dan pembayaran"
            className="order-first space-y-4 xl:order-none xl:sticky xl:top-24"
          >
            <section
              aria-labelledby="order-status-heading"
              className="border border-outline-variant bg-surface-white p-5"
            >
              <h2
                id="order-status-heading"
                className="font-heading text-admin-section text-primary"
              >
                Status Pesanan
              </h2>
              <div className="mt-4"><OrderStatusBadge status={order.status} /></div>
              {nextAction ? (
                <div className="mt-5 border-t border-outline-variant pt-4">
                  <p className="text-admin-caption font-semibold uppercase tracking-label text-on-surface-variant">Tindakan berikutnya</p>
                  <a href={nextAction.href} className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-outline-variant bg-surface-white px-4 text-center text-admin-label font-semibold text-primary transition-colors hover:bg-surface-container-low focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
                    {nextAction.label} <span aria-hidden="true">↓</span>
                  </a>
                </div>
              ) : null}
            </section>
            <AdminPaymentSummary order={order} />
          </aside>
        </div>
      </div>
    </main>
  );
}
