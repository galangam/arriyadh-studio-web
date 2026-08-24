import Link from "next/link";

import { requireAdmin } from "@/lib/auth/require-admin";

const activitySummary = [
  "Menunggu Harga",
  "Menunggu Verifikasi",
  "Sedang Diproduksi",
  "Selesai Bulan Ini",
] as const;

const recentOrderColumns = [
  "Order No.",
  "Pelanggan",
  "Tipe",
  "Status",
  "Tanggal",
  "Aksi",
] as const;

export default async function AdminDashboardPage() {
  await requireAdmin();

  return (
    <main className="w-full px-margin-mobile py-8 md:px-gutter md:py-10">
      <div className="mx-auto w-full max-w-content">
        <section aria-labelledby="dashboard-heading">
          <h1
            id="dashboard-heading"
            className="font-heading text-admin-title text-primary"
          >
            Dashboard
          </h1>
          <p className="mt-2 max-w-2xl text-admin-body text-on-surface-variant">
            Ringkasan aktivitas produksi hari ini.
          </p>
        </section>

        <section aria-labelledby="activity-summary-heading" className="mt-8">
          <h2 id="activity-summary-heading" className="sr-only">
            Ringkasan aktivitas
          </h2>
          <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {activitySummary.map((label) => (
              <div
                key={label}
                className="flex min-h-32 flex-col justify-between rounded-md border border-outline-variant bg-surface-white p-5"
              >
                <dt className="text-admin-label text-on-surface-variant">
                  {label}
                </dt>
                <dd className="mt-5 font-heading text-heading-lg text-primary">
                  <span aria-hidden="true">—</span>
                  <span className="sr-only">Data belum tersedia</span>
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="recent-orders-heading" className="mt-10">
          <div className="flex items-center justify-between gap-4 border-b border-outline-variant pb-3">
            <h2
              id="recent-orders-heading"
              className="font-heading text-admin-section text-primary"
            >
              Pesanan Masuk Terbaru
            </h2>
            <Link
              href="/admin/pesanan"
              className="shrink-0 text-admin-label text-primary focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              Lihat Semua <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div className="mt-5 max-w-full overflow-hidden rounded-md border border-outline-variant bg-surface-white">
            <div className="max-w-full overflow-x-auto">
              <table
                aria-describedby="recent-orders-empty-state"
                className="w-full min-w-[720px] border-collapse text-left"
              >
                <caption className="sr-only">
                  Pesanan pelanggan yang baru masuk.
                </caption>
                <thead className="bg-surface-container-low">
                  <tr>
                    {recentOrderColumns.map((column) => (
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
                  <tr>
                    <td
                      colSpan={recentOrderColumns.length}
                      id="recent-orders-empty-state"
                      className="px-5 py-10 text-center md:px-6 md:py-12"
                    >
                      <p className="font-heading text-heading-xs text-primary">
                        Belum ada pesanan masuk.
                      </p>
                      <p className="mx-auto mt-1.5 max-w-lg text-admin-body text-on-surface-variant">
                       Pesanan terbaru akan muncul di sini.
                      </p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
