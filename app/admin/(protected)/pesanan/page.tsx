import Link from "next/link";

import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { requireAdmin } from "@/lib/auth/require-admin";
import {
  formatAdminOrderDate,
  formatOrderPrice,
  getAdminOrdersPage,
  getOrderSnapshotName,
  orderKindLabels,
  parseAdminOrderFilters,
  statusFilterOptions,
  type AdminOrderFilters,
  type AdminOrderListRow,
  typeFilterOptions,
} from "@/lib/orders/admin-orders";
import {
  getOrderStatusLabel,
  shouldShowOrderQuantity,
} from "@/lib/orders/order-presentation";

const orderTableColumns = [
  "Kode Pesanan",
  "Pelanggan",
  "Tipe & Detail",
  "Total Harga",
  "Status",
  "Aksi",
] as const;

function createOrdersHref(filters: AdminOrderFilters, page: number) {
  const params = new URLSearchParams();

  if (filters.q) params.set("q", filters.q);
  if (filters.status !== "all") params.set("status", filters.status);
  if (filters.type !== "all") params.set("type", filters.type);
  if (page > 1) params.set("page", String(page));

  const query = params.toString();
  return query ? `/admin/pesanan?${query}` : "/admin/pesanan";
}

function createOrdersExportHref(filters: AdminOrderFilters) {
  const params = new URLSearchParams();

  if (filters.q) params.set("q", filters.q);
  if (filters.status !== "all") params.set("status", filters.status);
  if (filters.type !== "all") params.set("type", filters.type);

  const query = params.toString();
  return query
    ? `/admin/pesanan/export?${query}`
    : "/admin/pesanan/export";
}

function getPaginationItems(page: number, totalPages: number) {
  const pages = new Set([1, totalPages, page - 1, page, page + 1]);
  const visiblePages = [...pages]
    .filter((value) => value >= 1 && value <= totalPages)
    .sort((a, b) => a - b);
  const items: Array<number | string> = [];

  visiblePages.forEach((value, index) => {
    const previous = visiblePages[index - 1];
    if (previous && value - previous > 1) items.push(`ellipsis-${value}`);
    items.push(value);
  });

  return items;
}

function OrderDetail({ order }: { order: AdminOrderListRow }) {
  if (order.order_kind === "product") {
    const details = [
      order.product_size ? `Ukuran ${order.product_size}` : null,
      `${order.quantity} pcs`,
    ].filter(Boolean);

    return (
      <>
        <span className="block font-semibold text-primary">
          {getOrderSnapshotName(order)}
        </span>
        <span className="mt-0.5 block text-admin-caption text-on-surface-variant">
          {details.join(" · ")}
        </span>
      </>
    );
  }

  return (
    <>
      <span className="block font-semibold text-primary">
        {getOrderSnapshotName(order)}
      </span>
      {shouldShowOrderQuantity(order.order_kind, order.service_slug) ? (
        <span className="mt-0.5 block text-admin-caption text-on-surface-variant">
          {order.quantity} pcs
        </span>
      ) : null}
    </>
  );
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string | string[];
    status?: string | string[];
    type?: string | string[];
    page?: string | string[];
  }>;
}) {
  await requireAdmin();
  const filters = parseAdminOrderFilters(await searchParams);
  const ordersData = await getAdminOrdersPage(filters);
  const hasActiveFilters =
    filters.q !== "" || filters.status !== "all" || filters.type !== "all";

  return (
    <main className="w-full px-margin-mobile py-8 md:px-gutter md:py-10">
      <div className="mx-auto w-full max-w-content">
        <section
          aria-labelledby="orders-heading"
          className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
        >
          <div>
            <h1 id="orders-heading" className="font-heading text-admin-title text-primary">
              Daftar Pesanan
            </h1>
            <p className="mt-2 max-w-2xl text-admin-body text-on-surface-variant">
              Kelola dan pantau seluruh pesanan pelanggan Arriyadh Studio.
            </p>
          </div>
          <a
            href={createOrdersExportHref(filters)}
            className="inline-flex min-h-11 w-full shrink-0 items-center justify-center rounded-md border border-outline-variant bg-surface-white px-5 text-admin-label font-semibold text-primary hover:bg-surface-container-low focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:w-auto"
          >
            Unduh Data Pesanan (CSV)
          </a>
        </section>

        <section aria-label="Daftar dan kontrol pesanan" className="mt-8">
          <form
            key={`${filters.q}:${filters.status}:${filters.type}`}
            action="/admin/pesanan"
            method="get"
            className="grid gap-4 rounded-md border border-outline-variant bg-surface-white p-4 lg:grid-cols-[minmax(16rem,1fr)_12rem_12rem_auto] lg:items-end"
          >
            <div className="space-y-2">
              <label htmlFor="order-search" className="block text-admin-label text-primary">
                Pencarian
              </label>
              <input
                id="order-search"
                name="q"
                type="search"
                defaultValue={filters.q}
                maxLength={80}
                placeholder="Cari ID Pesanan, nama, atau nomor WhatsApp"
                className="min-h-10 w-full rounded-md border border-outline-variant bg-surface-white px-3 text-admin-body text-on-surface outline-none placeholder:text-on-surface-variant focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="order-status" className="block text-admin-label text-primary">
                Status
              </label>
              <select
                id="order-status"
                name="status"
                defaultValue={filters.status}
                className="min-h-10 w-full rounded-md border border-outline-variant bg-surface-white px-3 text-admin-body text-on-surface outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
              >
                {statusFilterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="order-type" className="block text-admin-label text-primary">
                Tipe Pesanan
              </label>
              <select
                id="order-type"
                name="type"
                defaultValue={filters.type}
                className="min-h-10 w-full rounded-md border border-outline-variant bg-surface-white px-3 text-admin-body text-on-surface outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
              >
                {typeFilterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                className="min-h-10 rounded-md bg-primary px-4 text-admin-label text-on-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                Terapkan Filter
              </button>
              {hasActiveFilters && (
                <Link
                  href="/admin/pesanan"
                  className="inline-flex min-h-10 items-center rounded-md border border-outline-variant px-3 text-admin-label text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  Hapus Filter
                </Link>
              )}
            </div>
          </form>

          {!ordersData.ok && (
            <p
              role="alert"
              className="mt-5 border border-error/30 bg-error-container px-4 py-3 text-admin-body text-on-error-container"
            >
              Data pesanan tidak dapat dimuat saat ini. Silakan coba lagi.
            </p>
          )}

          <div className="mt-5">
            <div>
              <h2 className="font-heading text-admin-section text-primary">Hasil Pesanan</h2>
              <p className="mt-1 text-admin-caption text-on-surface-variant">
                {ordersData.ok
                  ? `${ordersData.totalCount.toLocaleString("id-ID")} pesanan ditemukan`
                  : "Data belum tersedia"}
              </p>
            </div>
          </div>

          <div className="mt-3 max-w-full overflow-hidden rounded-md border border-outline-variant bg-surface-white">
            <div className="max-w-full overflow-x-auto overscroll-x-contain" tabIndex={0} aria-label="Tabel daftar pesanan, dapat digulir horizontal">
              <table
                aria-describedby={
                  !ordersData.ok || ordersData.orders.length === 0
                    ? "orders-table-state"
                    : undefined
                }
                className="w-full min-w-[820px] border-collapse text-left"
              >
                <caption className="sr-only">
                  Daftar pesanan pelanggan Arriyadh Studio.
                </caption>
                <thead className="bg-surface-container-low">
                  <tr>
                    {orderTableColumns.map((column) => (
                      <th
                        key={column}
                        scope="col"
                        className="whitespace-nowrap border-b border-outline-variant px-4 py-2.5 text-admin-caption font-semibold uppercase tracking-label text-on-surface-variant"
                      >
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {!ordersData.ok ? (
                    <tr>
                      <td colSpan={orderTableColumns.length} id="orders-table-state" className="px-5 py-12 text-center md:px-6 md:py-14">
                        <p className="font-heading text-heading-xs text-error">Data pesanan tidak dapat dimuat.</p>
                        <p className="mx-auto mt-1.5 max-w-lg text-admin-body text-on-surface-variant">Silakan muat ulang halaman atau coba lagi nanti.</p>
                      </td>
                    </tr>
                  ) : ordersData.orders.length === 0 ? (
                    <tr>
                      <td colSpan={orderTableColumns.length} id="orders-table-state" className="px-5 py-12 text-center md:px-6 md:py-14">
                        <p className="font-heading text-heading-xs text-primary">
                          {ordersData.totalOrderCount === 0
                            ? "Belum ada pesanan masuk."
                            : "Tidak ada pesanan yang sesuai."}
                        </p>
                        <p className="mx-auto mt-1.5 max-w-lg text-admin-body text-on-surface-variant">
                          {ordersData.totalOrderCount === 0
                            ? "Pesanan terbaru akan muncul di sini."
                            : "Ubah pencarian atau filter untuk melihat hasil lainnya."}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    ordersData.orders.map((order) => (
                      <tr key={order.id} className="border-b border-outline-variant transition-colors last:border-b-0 hover:bg-surface-container-low/60">
                        <td className="whitespace-nowrap px-4 py-3.5 text-admin-body text-on-surface">
                          <span className="block font-semibold text-primary">{order.order_code}</span>
                          <span className="mt-0.5 block text-admin-caption text-on-surface-variant">{formatAdminOrderDate(order.created_at)}</span>
                        </td>
                        <td className="max-w-56 px-4 py-3.5 text-admin-body text-on-surface">
                          <span className="block break-words font-semibold text-primary">{order.customer_name}</span>
                          <span className="mt-0.5 block whitespace-nowrap text-admin-caption text-on-surface-variant">{order.customer_whatsapp}</span>
                        </td>
                        <td className="px-4 py-3 text-admin-body text-on-surface">
                          <span className="mb-1 block text-admin-caption text-on-surface-variant">{orderKindLabels[order.order_kind]}</span>
                          <OrderDetail order={order} />
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-admin-body font-semibold text-primary">{formatOrderPrice(order.price)}</td>
                        <td className="px-4 py-3.5"><OrderStatusBadge status={order.status} label={getOrderStatusLabel(order.status, order.service_slug)} /></td>
                        <td className="px-4 py-3 text-center text-admin-body">
                          <Link
                            href={"/admin/pesanan/" + order.id}
                            className="font-semibold text-primary underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                          >
                            Buka detail
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {ordersData.ok && ordersData.totalCount > 0 && (
            <div className="mt-4 flex flex-col gap-3 text-admin-body text-on-surface-variant sm:flex-row sm:items-center sm:justify-between">
              <p>
                Menampilkan {(ordersData.page - 1) * ordersData.pageSize + 1}–{Math.min(ordersData.page * ordersData.pageSize, ordersData.totalCount)} dari {ordersData.totalCount} pesanan
              </p>
              {ordersData.totalPages > 1 && (
                <nav aria-label="Paginasi daftar pesanan" className="flex flex-wrap items-center gap-1">
                  {ordersData.page > 1 && (
                    <Link href={createOrdersHref(filters, ordersData.page - 1)} className="inline-flex min-h-9 items-center rounded-md border border-outline-variant px-3 text-admin-label text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">Sebelumnya</Link>
                  )}
                  {getPaginationItems(ordersData.page, ordersData.totalPages).map((item) =>
                    typeof item === "number" ? (
                      <Link
                        key={item}
                        href={createOrdersHref(filters, item)}
                        aria-current={item === ordersData.page ? "page" : undefined}
                        className={`inline-flex size-9 items-center justify-center rounded-md border text-admin-label focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${item === ordersData.page ? "border-primary bg-primary text-on-primary" : "border-outline-variant text-primary"}`}
                      >
                        {item}
                      </Link>
                    ) : (
                      <span key={item} aria-hidden="true" className="px-1">…</span>
                    ),
                  )}
                  {ordersData.page < ordersData.totalPages && (
                    <Link href={createOrdersHref(filters, ordersData.page + 1)} className="inline-flex min-h-9 items-center rounded-md border border-outline-variant px-3 text-admin-label text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">Berikutnya</Link>
                  )}
                </nav>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
