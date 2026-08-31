import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/ui/container";
import { getPublicOrderConfirmation } from "@/lib/orders/public-order-confirmation";
import { getJerseyVariantTypeLabel } from "@/lib/services/service-requirements";
import {
  createProductOrderWhatsappUrl,
  createServiceOrderReviewWhatsappUrl,
} from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Pesanan Berhasil | Arriyadh Studio",
  description: "Konfirmasi pesanan Arriyadh Studio.",
  robots: { index: false, follow: false },
};

const rupiahFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid gap-1 border-b border-outline-variant py-4 last:border-b-0 sm:grid-cols-[11rem_1fr]">
      <dt className="font-body text-body-sm text-on-surface-variant">{label}</dt>
      <dd className="font-body text-body-md font-semibold text-on-surface">
        {value}
      </dd>
    </div>
  );
}

export default async function OrderConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ reference?: string }>;
}) {
  const [{ token }, query] = await Promise.all([params, searchParams]);
  const order = await getPublicOrderConfirmation(token);

  if (!order) notFound();

  const isService = order.order_kind === "service";
  const requirement =
    order.service_flow === "permak"
      ? order.job_description
      : order.material;
  const isAwaitingQuote = isService && order.status === "menunggu_harga";
  const serviceName = order.service_name_snapshot ?? "Layanan custom";
  const normalizedServiceName = serviceName.toLowerCase();
  const isOtherService = normalizedServiceName === "lainnya";
  const isJerseyService =
    normalizedServiceName === "jersey" ||
    normalizedServiceName === "jersey embos";
  const referenceUploadFailed = isService && query.reference === "failed";
  const assistanceWhatsappUrl = isAwaitingQuote
    ? createServiceOrderReviewWhatsappUrl({
        orderCode: order.order_code,
        serviceName: order.service_name_snapshot,
      })
    : null;
  const productCodWhatsappUrl =
    !isService &&
    order.status === "menunggu_verifikasi" &&
    order.payment_method === "cod" &&
    order.product_name_snapshot &&
    order.product_size &&
    order.price !== null
      ? createProductOrderWhatsappUrl("cod", {
          orderCode: order.order_code,
          productName: order.product_name_snapshot,
          material: order.material,
          sleeveType: order.product_sleeve_type,
          size: order.product_size,
          quantity: order.quantity,
          total: order.price,
        })
      : null;
  const canContinueToPayment =
    (!isService && order.payment_method === "transfer") ||
    (isService && order.status === "menunggu_pembayaran_dp");

  return (
    <main className="bg-surface-container-low py-12 text-on-surface sm:py-16 md:py-section-gap">
      <Container>
        <section className="mx-auto max-w-3xl border border-outline-variant bg-surface-white p-6 sm:p-10">
          <p className="font-body text-label-md uppercase text-success-green">
            Pesanan Berhasil Dibuat
          </p>
          <h1 className="mt-2 font-heading text-heading-lg text-primary">
            {isAwaitingQuote
              ? "Menunggu Peninjauan Harga"
              : "Detail Pesanan Anda"}
          </h1>
          <p className="mt-3 font-body text-body-md text-on-surface-variant">
            {isAwaitingQuote
              ? "Admin akan meninjau kebutuhan Anda terlebih dahulu. Pembayaran belum diperlukan saat ini; pilihan pembayaran tersedia setelah admin menetapkan harga."
              : isService
                ? "Pesanan layanan Anda telah tersimpan. Ikuti informasi pembayaran atau proses berikutnya dari admin."
                : order.payment_method === "cod"
                  ? "Pesanan COD telah dibuat. Pembayaran dilakukan saat pesanan diterima sesuai proses COD Arriyadh Studio."
                  : "Pesanan produk Anda telah tersimpan. Lanjutkan pembayaran sesuai petunjuk yang tersedia."}
          </p>

          <dl className="mt-8 border-y border-outline-variant">
            <DetailRow label="Kode Pesanan" value={order.order_code} />
            <DetailRow
              label={isService ? "Layanan" : "Produk"}
              value={
                isService
                  ? serviceName
                  : order.product_name_snapshot ?? "Produk"
              }
            />
            {!isService && order.material ? (
              <DetailRow label="Bahan" value={order.material} />
            ) : null}
            {!isService && order.product_sleeve_type ? (
              <DetailRow
                label="Jenis Lengan"
                value={order.product_sleeve_type}
              />
            ) : null}
            {!isService && order.product_size ? (
              <DetailRow label="Ukuran" value={order.product_size} />
            ) : null}
            <DetailRow label="Jumlah" value={order.quantity + " pcs"} />
            {isService && order.service_variants.length > 0 ? (
              <DetailRow
                label="Rincian Pesanan"
                value={
                  <div className="space-y-5">
                    {order.service_variants.map((variant) => (
                      <div
                        key={[
                          variant.variant_type,
                          variant.material,
                          variant.sleeve_type,
                        ].join(":")}
                        className="border-b border-outline-variant pb-4 last:border-b-0 last:pb-0"
                      >
                        {isJerseyService ? (
                          <p className="font-semibold">
                            {getJerseyVariantTypeLabel(variant.variant_type)}
                          </p>
                        ) : null}
                        <p>
                          {variant.material} — {variant.sleeve_type}
                        </p>
                        {variant.sizes.length > 0 ? (
                          <dl className="mt-2 grid max-w-xs grid-cols-2 gap-x-6 gap-y-1 font-normal">
                            {variant.sizes.map((size) => (
                              <div key={size.size} className="contents">
                                <dt>{size.size}</dt>
                                <dd className="text-right">{size.quantity} pcs</dd>
                              </div>
                            ))}
                          </dl>
                        ) : null}
                        <p className="mt-2 font-semibold">
                          Subtotal: {variant.quantity} pcs
                        </p>
                      </div>
                    ))}
                    <p className="border-t border-outline-variant pt-3">
                      Total Pesanan: {order.quantity} pcs
                    </p>
                  </div>
                }
              />
            ) : null}
            {isService && order.service_variants.length === 0 && requirement ? (
              <DetailRow
                label={
                  order.service_flow === "permak"
                    ? "Deskripsi Pekerjaan"
                    : isOtherService
                      ? "Detail Kebutuhan"
                      : "Material / Bahan"
                }
                value={<span className="whitespace-pre-wrap">{requirement}</span>}
              />
            ) : null}
            {isService && order.design_description ? (
              <DetailRow
                label="Detail Desain"
                value={
                  <span className="whitespace-pre-wrap">
                    {order.design_description}
                  </span>
                }
              />
            ) : null}
            {isService && order.design_reference_count > 0 ? (
              <DetailRow
                label="Referensi Desain"
                value={order.design_reference_count + " file diterima"}
              />
            ) : null}
            {!isService && order.price !== null ? (
              <DetailRow
                label="Harga Satuan"
                value={
                  order.unit_price === null
                    ? "—"
                    : rupiahFormatter.format(order.unit_price)
                }
              />
            ) : null}
            {!isService && order.price !== null ? (
              <DetailRow label="Total" value={rupiahFormatter.format(order.price)} />
            ) : null}
            {!isService && order.payment_method ? (
              <DetailRow
                label="Metode Pembayaran"
                value={order.payment_method === "cod" ? "COD" : "Transfer BRI"}
              />
            ) : null}
          </dl>

          {referenceUploadFailed ? (
            <p role="alert" className="mt-6 border border-status-amber/40 bg-status-amber/10 px-4 py-3 font-body text-body-sm text-on-surface">
              Pesanan berhasil dibuat, tetapi referensi desain belum terunggah.
              Silakan kirim referensi melalui WhatsApp kepada admin.
            </p>
          ) : null}

          {productCodWhatsappUrl || canContinueToPayment ? (
            <div className="mt-8 flex flex-wrap gap-3">
              {productCodWhatsappUrl ? (
                <a
                  href={productCodWhatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-12 items-center justify-center rounded-md bg-primary px-gutter font-body text-button text-on-primary hover:bg-primary-container"
                >
                  Konfirmasi Pesanan COD ke Admin
                </a>
              ) : null}
              {canContinueToPayment ? (
                <Link
                  href={`/pembayaran/${token}`}
                  className="inline-flex min-h-12 items-center justify-center rounded-md bg-primary px-gutter font-body text-button text-on-primary hover:bg-primary-container"
                >
                  {isService ? "Bayar DP" : "Lanjut ke Pembayaran"}
                </Link>
              ) : null}
            </div>
          ) : null}
          {assistanceWhatsappUrl ? (
            <section className="mt-8 border-t border-outline-variant pt-6">
              <h2 className="font-heading text-heading-sm text-primary">
                Konfirmasi Pesanan ke Admin
              </h2>
              <p className="mt-2 font-body text-body-sm text-on-surface-variant">
                Pesanan Anda sudah tercatat dan sedang menunggu peninjauan harga
                dari admin. Silakan konfirmasi melalui WhatsApp agar admin dapat
                segera meninjau detail pesanan.
              </p>
              <a
                href={assistanceWhatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex min-h-12 items-center justify-center rounded-md border border-outline px-gutter font-body text-button text-primary hover:bg-surface-container-low"
              >
                Konfirmasi via WhatsApp
              </a>
            </section>
          ) : null}
          {!assistanceWhatsappUrl && !productCodWhatsappUrl ? (
            <div className="mt-8">
              <Link
                href={isService ? "/layanan" : "/produk"}
                className="inline-flex min-h-12 items-center justify-center rounded-md border border-outline px-gutter font-body text-button text-primary hover:bg-surface-container-low"
              >
                Kembali
              </Link>
            </div>
          ) : null}
        </section>
      </Container>
    </main>
  );
}
