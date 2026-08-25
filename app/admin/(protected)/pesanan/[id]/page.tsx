import Link from "next/link";

import {
  formatAdminOrderDateTime,
  formatOrderPrice,
  getAdminOrderDetail,
  orderKindLabels,
  orderStatusLabels,
  type AdminOrderDetail,
} from "@/lib/orders/admin-orders";

const emptyValue = "—";

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
  const items: DetailItem[] =
    order.order_kind === "product"
      ? [
          { label: "Nama Produk", value: order.product_name_snapshot },
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
          { label: "Alur Layanan", value: order.service_flow },
          { label: "Material", value: order.material },
          { label: "Deskripsi Pekerjaan", value: order.job_description },
          { label: "Jumlah", value: `${order.quantity} pcs` },
        ];

  return <DetailList items={items} />;
}

function PaymentSummary({ order }: { order: AdminOrderDetail }) {
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
          <dt className="text-admin-body text-on-surface-variant">Total Harga</dt>
          <dd className="text-right text-admin-body font-semibold text-primary">
            {formatOrderPrice(order.price)}
          </dd>
        </div>
        <div className="flex items-start justify-between gap-4 border-t border-outline-variant pt-4">
          <dt className="text-admin-body text-on-surface-variant">DP</dt>
          <dd className="text-right text-admin-body font-semibold text-primary">
            {order.dp_amount === null
              ? "Belum ditentukan"
              : formatOrderPrice(order.dp_amount)}
          </dd>
        </div>
        <div className="flex items-start justify-between gap-4 border-t border-outline-variant pt-4">
          <dt className="text-admin-body text-on-surface-variant">
            Metode Pembayaran
          </dt>
          <dd className="text-right text-admin-body font-semibold text-primary">
            {order.payment_method ?? "Belum dipilih"}
          </dd>
        </div>
        <div className="flex items-start justify-between gap-4 border-t border-outline-variant pt-4">
          <dt className="text-admin-body text-on-surface-variant">
            Status Verifikasi
          </dt>
          <dd className="text-right text-admin-body font-semibold text-primary">
            {order.payment_verified_at
              ? "Terverifikasi"
              : "Belum diverifikasi"}
          </dd>
        </div>
      </dl>
    </section>
  );
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getAdminOrderDetail(id);
  const statusDetails: DetailItem[] = [];

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

        <header className="mt-5">
          <p className="text-admin-label text-on-surface-variant">
            {orderKindLabels[order.order_kind]}
          </p>
          <h1 className="mt-1 break-words font-heading text-admin-title text-primary">
            Detail Pesanan {order.order_code}
          </h1>
          <p className="mt-2 text-admin-body text-on-surface-variant">
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
          </div>

          <aside
            aria-label="Status dan pembayaran"
            className="space-y-6 xl:sticky xl:top-24"
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
              <p className="mt-4 text-admin-body font-semibold text-primary">
                {orderStatusLabels[order.status]}
              </p>
            </section>
            <PaymentSummary order={order} />
          </aside>
        </div>
      </div>
    </main>
  );
}
