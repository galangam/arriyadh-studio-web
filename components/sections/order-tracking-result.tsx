import { OrderTrackingProgress } from "@/components/sections/order-tracking-progress";
import { orderStatusLabels } from "@/lib/orders/order-status";
import { getOrderWorkflow } from "@/lib/orders/order-workflows";
import type { TrackingOrder } from "@/lib/orders/public-order-tracking";
import { getJerseyVariantTypeLabel } from "@/lib/services/service-requirements";
import { createWhatsappUrl } from "@/lib/whatsapp";

const jakartaDateFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "long",
  timeZone: "Asia/Jakarta",
});

const jakartaDateTimeFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "Asia/Jakarta",
});

const rupiahFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

function getPaymentMethodLabel(method: TrackingOrder["paymentMethod"]) {
  if (method === "transfer") return "Transfer Bank";
  if (method === "cod") return "COD";
  return null;
}

function getStateMessage(order: TrackingOrder) {
  if (order.status === "selesai") {
    return {
      heading: "Pesanan Selesai",
      message:
        order.kind === "product"
          ? "Produk telah selesai disiapkan. Hubungi admin untuk koordinasi selanjutnya."
          : "Pengerjaan pesanan telah selesai. Hubungi admin untuk koordinasi selanjutnya.",
    };
  }

  if (order.status === "dibatalkan") {
    return {
      heading: "Pesanan Dibatalkan",
      message: "Pesanan ini telah dibatalkan.",
    };
  }

  if (order.kind === "product") {
    if (order.status === "menunggu_verifikasi") {
      return order.paymentMethod === "transfer"
        ? {
            heading: "Pembayaran Sedang Diverifikasi",
            message: "Pembayaran sedang diverifikasi oleh admin.",
          }
        : {
            heading: "Menunggu Konfirmasi Pesanan",
            message: "Pesanan sedang menunggu konfirmasi admin.",
          };
    }

    if (order.status === "diproses") {
      return {
        heading: "Produk Sedang Diproses",
        message: "Produk sedang disiapkan.",
      };
    }

    return {
      heading: "Status Pesanan",
      message: "Lihat status terbaru pada ringkasan pesanan.",
    };
  }

  if (order.status === "menunggu_harga") {
    return {
      heading: "Menunggu Peninjauan Harga",
      message: "Admin sedang meninjau kebutuhan pesanan dan akan menentukan harga. Pembayaran belum diperlukan saat ini.",
    };
  }

  if (order.status === "menunggu_pembayaran_dp") {
    return {
      heading: "Menunggu Pembayaran DP",
      message: "Harga pesanan telah ditentukan dan pesanan menunggu pembayaran DP.",
    };
  }

  if (order.status === "menunggu_konfirmasi_dp") {
    return {
      heading: "Menunggu Konfirmasi DP",
      message: "Pembayaran DP secara COD sedang menunggu konfirmasi admin.",
    };
  }

  if (order.status === "menunggu_verifikasi") {
    return {
      heading: "Pembayaran Sedang Diverifikasi",
      message: "Bukti pembayaran telah diterima sistem dan sedang diperiksa admin.",
    };
  }

  const workflow = getOrderWorkflow({
    order_kind: order.kind,
    service_flow: order.serviceFlow,
  });

  if (workflow?.some((status) => status === order.status)) {
    return {
      heading: `Tahap ${orderStatusLabels[order.status]}`,
      message: `Pesanan sedang berada pada tahap ${orderStatusLabels[order.status]}.`,
    };
  }

  return {
    heading: "Status Pesanan",
    message: "Lihat status terbaru pada ringkasan pesanan.",
  };
}

function DetailItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="font-body text-label-sm text-on-surface-variant">{label}</dt>
      <dd className="mt-1 break-words font-body text-body-sm font-semibold text-on-surface sm:text-body-md">
        {value}
      </dd>
    </div>
  );
}

function ServiceDetails({
  order,
}: {
  order: Extract<TrackingOrder, { kind: "service" }>;
}) {
  if (order.variants.length === 0) {
    return order.material ? (
      <section
        aria-labelledby="tracking-order-detail-heading"
        className="border-t border-outline-variant pt-6"
      >
        <h3
          id="tracking-order-detail-heading"
          className="font-heading text-heading-sm text-primary"
        >
          Detail Pesanan
        </h3>
        <dl className="mt-4">
          <DetailItem label="Material" value={order.material} />
        </dl>
      </section>
    ) : null;
  }

  return (
    <section
      aria-labelledby="tracking-order-detail-heading"
      className="border-t border-outline-variant pt-6"
    >
      <h3
        id="tracking-order-detail-heading"
        className="font-heading text-heading-sm text-primary"
      >
        Rincian Varian
      </h3>
      <ul className="mt-4 grid gap-x-6 gap-y-5 sm:grid-cols-2">
        {order.variants.map((variant, index) => (
          <li
            key={`${variant.variantType ?? "variant"}-${variant.material}-${variant.sleeveType}-${index}`}
            className="min-w-0 border-l-2 border-outline-variant bg-surface-container-low/50 px-4 py-3"
          >
            <h4 className="break-words font-heading text-heading-xs text-primary">
              {variant.variantType
                ? getJerseyVariantTypeLabel(variant.variantType)
                : `Varian ${index + 1}`}
            </h4>
            <dl className="mt-3 grid gap-2.5">
              <DetailItem label="Material" value={variant.material} />
              <DetailItem label="Jenis Lengan" value={variant.sleeveType} />
              <DetailItem label="Subtotal" value={`${variant.quantity} pcs`} />
            </dl>
            {variant.sizes.length > 0 ? (
              <div className="mt-4 border-t border-outline-variant pt-3">
                <p className="font-body text-label-md text-on-surface-variant">
                  Rincian Ukuran
                </p>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {variant.sizes.map((size) => (
                    <li
                      key={size.size}
                      className="rounded-md border border-outline-variant bg-surface-white px-2.5 py-1.5 font-body text-body-sm text-on-surface"
                    >
                      {size.size} × {size.quantity}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

function ProductDetails({
  order,
}: {
  order: Extract<TrackingOrder, { kind: "product" }>;
}) {
  if (!order.size && !order.material && !order.sleeveType) return null;

  return (
    <section
      aria-labelledby="tracking-order-detail-heading"
      className="border-t border-outline-variant pt-6"
    >
      <h3
        id="tracking-order-detail-heading"
        className="font-heading text-heading-sm text-primary"
      >
        Detail Produk
      </h3>
      <dl className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {order.size ? <DetailItem label="Ukuran" value={order.size} /> : null}
        {order.material ? (
          <DetailItem label="Material" value={order.material} />
        ) : null}
        {order.sleeveType ? (
          <DetailItem label="Jenis Lengan" value={order.sleeveType} />
        ) : null}
      </dl>
    </section>
  );
}

export function OrderTrackingResult({
  order,
  whatsappNumber,
}: {
  order: TrackingOrder;
  whatsappNumber: string;
}) {
  const stateMessage = getStateMessage(order);
  const itemName =
    order.kind === "service"
      ? (order.serviceName ?? "Layanan Custom")
      : (order.productName ?? "Produk");
  const paymentMethodLabel = getPaymentMethodLabel(order.paymentMethod);
  const showServiceFinancials =
    order.kind === "service" &&
    order.status !== "menunggu_harga" &&
    (order.price !== null ||
      order.dpAmount !== null ||
      order.paymentMethod !== null);
  const showProductFinancials =
    order.kind === "product" &&
    (order.unitPrice !== null ||
      order.price !== null ||
      order.paymentMethod !== null);
  const trackingWhatsappUrl = createWhatsappUrl(
    whatsappNumber,
    [
      "Halo Arriyadh Studio, saya ingin menanyakan pesanan saya.",
      "",
      `Kode Pesanan: ${order.orderCode}`,
      `Status: ${orderStatusLabels[order.status]}`,
    ].join("\n"),
  );

  return (
    <section
      aria-labelledby="tracking-result-heading"
      aria-live="polite"
      className="mt-8 border border-outline-variant bg-surface-white p-5 text-left sm:p-8"
    >
      <div className="border-b border-outline-variant pb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-body text-label-md uppercase text-secondary">
              Status Pesanan
            </p>
            <h2
              id="tracking-result-heading"
              className="mt-1 font-heading text-heading-md text-primary"
            >
              {stateMessage.heading}
            </h2>
            <p className="mt-2 max-w-2xl font-body text-body-md text-on-surface-variant">
              {stateMessage.message}
            </p>
          </div>

          <span className="inline-flex w-fit shrink-0 rounded-full border border-outline-variant bg-surface-container-low px-4 py-2 font-body text-label-md font-semibold text-primary">
            Status: {orderStatusLabels[order.status]}
          </span>
        </div>

        <div className="mt-5 grid gap-4 border-t border-outline-variant pt-5 sm:grid-cols-2">
          <DetailItem label="Kode Pesanan" value={order.orderCode} />
          <DetailItem
            label={order.kind === "service" ? "Layanan" : "Produk"}
            value={itemName}
          />
        </div>
      </div>

      <dl className="grid gap-4 py-6 sm:grid-cols-3">
        <DetailItem
          label="Tanggal Pesanan"
          value={jakartaDateFormatter.format(new Date(order.createdAt))}
        />
        <DetailItem
          label="Jenis Pesanan"
          value={order.kind === "service" ? "Layanan" : "Produk"}
        />
        <DetailItem label="Jumlah" value={`${order.quantity} pcs`} />
      </dl>

      {order.kind === "service" ? (
        <OrderTrackingProgress
          kind="service"
          serviceFlow={order.serviceFlow}
          status={order.status}
        />
      ) : (
        <OrderTrackingProgress kind="product" status={order.status} />
      )}

      {order.kind === "service" ? (
        <ServiceDetails order={order} />
      ) : (
        <ProductDetails order={order} />
      )}

      {showProductFinancials || showServiceFinancials ? (
        <section
          aria-labelledby="tracking-payment-heading"
          className="border-t border-outline-variant pt-6"
        >
          <h3
            id="tracking-payment-heading"
            className="font-heading text-heading-sm text-primary"
          >
            Ringkasan Pembayaran
          </h3>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {order.kind === "product" && order.unitPrice !== null ? (
              <DetailItem
                label="Harga Satuan"
                value={rupiahFormatter.format(order.unitPrice)}
              />
            ) : null}
            {order.price !== null ? (
              <DetailItem
                label="Total Harga"
                value={rupiahFormatter.format(order.price)}
              />
            ) : null}
            {order.kind === "service" && order.dpAmount !== null ? (
              <DetailItem
                label="DP"
                value={rupiahFormatter.format(order.dpAmount)}
              />
            ) : null}
            {paymentMethodLabel ? (
              <DetailItem
                label="Metode Pembayaran"
                value={paymentMethodLabel}
              />
            ) : null}
          </dl>
        </section>
      ) : null}

      {order.kind === "service" && order.designReferenceCount > 0 ? (
        <section
          aria-labelledby="tracking-reference-heading"
          className="border-t border-outline-variant pt-5"
        >
          <h3
            id="tracking-reference-heading"
            className="font-body text-label-md font-semibold text-primary"
          >
            Referensi Desain
          </h3>
          <p className="mt-1 font-body text-body-sm text-on-surface-variant">
            {order.designReferenceCount} referensi desain telah tersimpan.
          </p>
        </section>
      ) : null}

      {order.status === "selesai" && order.completedAt ? (
        <section
          aria-labelledby="tracking-milestone-heading"
          className="border-t border-outline-variant pt-6"
        >
          <h3
            id="tracking-milestone-heading"
            className="font-heading text-heading-sm text-primary"
          >
            Waktu Penyelesaian
          </h3>
          <p className="mt-2 font-body text-body-md text-on-surface-variant">
            {jakartaDateTimeFormatter.format(new Date(order.completedAt))} WIB
          </p>
        </section>
      ) : null}

      {order.status === "dibatalkan" && order.cancelledAt ? (
        <section
          aria-labelledby="tracking-cancellation-heading"
          className="border-t border-outline-variant pt-6"
        >
          <h3
            id="tracking-cancellation-heading"
            className="font-heading text-heading-sm text-primary"
          >
            Waktu Pembatalan
          </h3>
          <p className="mt-2 font-body text-body-md text-on-surface-variant">
            {jakartaDateTimeFormatter.format(new Date(order.cancelledAt))} WIB
          </p>
        </section>
      ) : null}

      <section
        aria-labelledby="tracking-support-heading"
        className="mt-6 border-t border-outline-variant pt-5"
      >
        <h3
          id="tracking-support-heading"
          className="font-heading text-heading-xs text-primary"
        >
          Butuh Bantuan?
        </h3>
        <p className="mt-2 font-body text-body-sm text-on-surface-variant">
          Hubungi admin jika Anda memerlukan informasi lebih lanjut tentang pesanan ini.
        </p>
        <a
          href={trackingWhatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          data-page-whatsapp-action="true"
          className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-md border border-outline bg-surface-container-low px-gutter font-body text-button font-semibold text-primary transition-colors hover:bg-surface-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:w-auto"
        >
          Tanyakan Pesanan via WhatsApp
        </a>
      </section>
    </section>
  );
}
