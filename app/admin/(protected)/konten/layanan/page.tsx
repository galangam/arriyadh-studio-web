import Link from "next/link";

import { requireAdmin } from "@/lib/auth/require-admin";
import { getAdminServices } from "@/lib/services/admin-services";

const flowLabels = {
  konveksi_sablon: "Konveksi / Sablon",
  permak: "Permak",
} as const;

export default async function AdminServicesPage() {
  await requireAdmin();
  const services = await getAdminServices();

  return (
    <main className="w-full px-margin-mobile py-8 md:px-gutter md:py-10">
      <div className="mx-auto w-full max-w-content">
        <Link href="/admin/konten" className="text-admin-label text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
          Kembali ke Kelola Konten
        </Link>
        <section aria-labelledby="services-admin-heading" className="mt-6 border-b border-outline-variant pb-6">
          <h1 id="services-admin-heading" className="font-heading text-admin-title text-primary">
            Layanan
          </h1>
          <p className="mt-2 max-w-2xl text-admin-body text-on-surface-variant">
            Kelola informasi katalog, gambar, status, dan urutan enam layanan yang sudah tersedia. Slug dan alur layanan tetap dikendalikan sistem.
          </p>
        </section>

        <section aria-labelledby="services-list-heading" className="py-8">
          <h2 id="services-list-heading" className="sr-only">
            Daftar layanan
          </h2>
          <div className="overflow-x-auto border border-outline-variant">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <thead className="bg-surface-container-low">
                <tr className="border-b border-outline-variant">
                  <th scope="col" className="px-4 py-3 text-admin-label text-primary">Layanan</th>
                  <th scope="col" className="px-4 py-3 text-admin-label text-primary">Slug</th>
                  <th scope="col" className="px-4 py-3 text-admin-label text-primary">Alur</th>
                  <th scope="col" className="px-4 py-3 text-admin-label text-primary">Status</th>
                  <th scope="col" className="px-4 py-3 text-admin-label text-primary">Urutan</th>
                  <th scope="col" className="px-4 py-3 text-admin-label text-primary"><span className="sr-only">Aksi</span></th>
                </tr>
              </thead>
              <tbody>
                {services.map((service) => (
                  <tr key={service.id} className="border-b border-outline-variant last:border-b-0">
                    <th scope="row" className="px-4 py-4 font-heading text-admin-body text-primary">{service.name}</th>
                    <td className="px-4 py-4 font-mono text-admin-caption text-on-surface-variant">{service.slug}</td>
                    <td className="px-4 py-4 text-admin-body text-on-surface-variant">{flowLabels[service.flow]}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-admin-caption font-semibold ${service.is_active ? "bg-success-green/10 text-success-green" : "bg-surface-container text-on-surface-variant"}`}>
                        {service.is_active ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-admin-body text-on-surface">{service.sort_order}</td>
                    <td className="px-4 py-4 text-right">
                      <Link href={`/admin/konten/layanan/${service.id}`} className="text-admin-label text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
