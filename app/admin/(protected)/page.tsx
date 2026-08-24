import Link from "next/link";

import { requireAdmin } from "@/lib/auth/require-admin";

const quickAccessItems = [
  {
    title: "Pesanan",
    href: "/admin/pesanan",
    description: "Kelola pesanan pelanggan dan kebutuhan tindak lanjut.",
  },
  {
    title: "Produk",
    href: "/admin/produk",
    description: "Atur informasi produk siap stok yang ditampilkan.",
  },
  {
    title: "Layanan",
    href: "/admin/layanan",
    description: "Kelola informasi layanan dan kebutuhan pesanan khusus.",
  },
  {
    title: "Produksi",
    href: "/admin/produksi",
    description: "Pantau alur dan perkembangan proses produksi.",
  },
] as const;

const workflowStages = ["Pesanan Masuk", "Konfirmasi", "Produksi", "Selesai"];

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
            Kelola aktivitas utama Arriyadh Studio dari satu tempat.
          </p>
        </section>

        <section aria-labelledby="quick-access-heading" className="mt-10">
          <div className="border-b border-outline-variant pb-3">
            <h2
              id="quick-access-heading"
              className="font-heading text-admin-section text-primary"
            >
              Akses Cepat
            </h2>
          </div>

          <nav aria-label="Akses cepat pengelolaan admin" className="mt-5">
            <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {quickAccessItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="group flex h-full min-h-36 flex-col justify-between rounded-lg border border-outline-variant bg-surface-white p-5 transition-colors hover:border-outline hover:bg-surface-container-lowest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  >
                    <span>
                      <span className="block font-heading text-heading-xs text-primary">
                        {item.title}
                      </span>
                      <span className="mt-2 block text-admin-body text-on-surface-variant">
                        {item.description}
                      </span>
                    </span>
                    <span
                      aria-hidden="true"
                      className="mt-5 text-admin-label text-primary transition-transform group-hover:translate-x-1"
                    >
                      Buka →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </section>

        <div className="mt-10 grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.8fr)]">
          <section
            aria-labelledby="operational-overview-heading"
            className="border-t border-outline-variant pt-5"
          >
            <p className="text-admin-caption font-semibold uppercase tracking-label text-on-surface-variant">
              Ringkasan
            </p>
            <h2
              id="operational-overview-heading"
              className="mt-2 font-heading text-admin-section text-primary"
            >
              Ikhtisar Operasional
            </h2>
            <div className="mt-5 rounded-lg border border-outline-variant bg-surface-white p-5 md:p-6">
              <p className="font-heading text-heading-xs text-primary">
                Data operasional belum terhubung
              </p>
              <p className="mt-2 max-w-2xl text-admin-body text-on-surface-variant">
                Ringkasan operasional akan tersedia setelah data pesanan,
                produk, dan layanan terhubung. Tidak ada data sementara atau
                angka perkiraan yang ditampilkan pada tahap ini.
              </p>
            </div>
          </section>

          <section
            aria-labelledby="workflow-heading"
            className="border-t border-outline-variant pt-5"
          >
            <p className="text-admin-caption font-semibold uppercase tracking-label text-on-surface-variant">
              Referensi
            </p>
            <h2
              id="workflow-heading"
              className="mt-2 font-heading text-admin-section text-primary"
            >
              Alur Kerja Utama
            </h2>
            <ol className="mt-5 divide-y divide-outline-variant border-y border-outline-variant">
              {workflowStages.map((stage, index) => (
                <li
                  key={stage}
                  className="flex items-center gap-4 py-3 text-admin-body text-on-surface"
                >
                  <span className="w-6 shrink-0 text-admin-caption font-semibold text-on-surface-variant">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>{stage}</span>
                </li>
              ))}
            </ol>
            <p className="mt-3 text-admin-caption text-on-surface-variant">
              Alur ini merupakan referensi proses, bukan status pesanan saat
              ini.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
