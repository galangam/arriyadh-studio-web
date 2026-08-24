import { requireAdmin } from "@/lib/auth/require-admin";

const orderTableColumns = [
  "Order ID",
  "Pelanggan",
  "Tipe & Detail",
  "Total Harga",
  "Status",
  "Aksi",
] as const;

export default async function AdminOrdersPage() {
  await requireAdmin();

  return (
    <main className="w-full px-margin-mobile py-8 md:px-gutter md:py-10">
      <div className="mx-auto w-full max-w-content">
        <section aria-labelledby="orders-heading">
          <h1
            id="orders-heading"
            className="font-heading text-admin-title text-primary"
          >
            Daftar Pesanan
          </h1>
          <p className="mt-2 max-w-2xl text-admin-body text-on-surface-variant">
            Kelola dan pantau seluruh pesanan pelanggan Arriyadh Studio.
          </p>
        </section>

        <section aria-label="Daftar dan kontrol pesanan" className="mt-8">
          <fieldset
            disabled
            className="grid gap-4 border border-outline-variant bg-surface-white p-4 md:grid-cols-[minmax(18rem,1fr)_13rem_13rem]"
          >
            <legend className="sr-only">Kontrol daftar pesanan</legend>

            <div className="space-y-2">
              <label
                htmlFor="order-search"
                className="block text-admin-label text-primary"
              >
                Pencarian
              </label>
              <input
                id="order-search"
                name="order-search"
                type="search"
                placeholder="Cari ID Pesanan, nama, atau nomor WhatsApp"
                className="min-h-10 w-full rounded-md border border-outline-variant bg-surface-white px-3 text-admin-body text-on-surface outline-none placeholder:text-on-surface-variant disabled:cursor-not-allowed focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="order-status"
                className="block text-admin-label text-primary"
              >
                Status
              </label>
              <select
                id="order-status"
                name="order-status"
                defaultValue="semua"
                className="min-h-10 w-full rounded-md border border-outline-variant bg-surface-white px-3 text-admin-body text-on-surface outline-none disabled:cursor-not-allowed focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
              >
                <option value="semua">Semua Status</option>
                <option value="menunggu-konfirmasi">Menunggu Konfirmasi</option>
                <option value="diproses">Diproses</option>
                <option value="produksi">Produksi</option>
                <option value="selesai">Selesai</option>
                <option value="dibatalkan">Dibatalkan</option>
              </select>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="order-type"
                className="block text-admin-label text-primary"
              >
                Tipe Pesanan
              </label>
              <select
                id="order-type"
                name="order-type"
                defaultValue="semua"
                className="min-h-10 w-full rounded-md border border-outline-variant bg-surface-white px-3 text-admin-body text-on-surface outline-none disabled:cursor-not-allowed focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
              >
                <option value="semua">Semua Tipe</option>
                <option value="produk">Produk</option>
                <option value="layanan-custom">Layanan Custom</option>
              </select>
            </div>
          </fieldset>

          <div className="mt-5 max-w-full overflow-hidden rounded-md border border-outline-variant bg-surface-white">
            <div className="max-w-full overflow-x-auto">
              <table
                aria-describedby="orders-empty-state"
                className="w-full min-w-[760px] border-collapse text-left"
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
                  <tr>
                    <td
                      colSpan={orderTableColumns.length}
                      id="orders-empty-state"
                      className="border-b border-outline-variant px-5 py-12 text-center md:px-6 md:py-14"
                    >
                      <p className="font-heading text-heading-xs text-primary">
                        Belum ada pesanan.
                      </p>
                      <p className="mx-auto mt-1.5 max-w-lg text-admin-body text-on-surface-variant">
                        Data pesanan akan tampil di sini setelah modul pemesanan
                        terhubung.
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
