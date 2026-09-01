import Image from "next/image";
import Link from "next/link";

import { DeletePortfolioButton } from "@/app/admin/(protected)/konten/portofolio/delete-portfolio-button";
import { PortfolioForm } from "@/app/admin/(protected)/konten/portofolio/portfolio-form";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getAdminPortfolioItems } from "@/lib/content/admin-portfolio";
import { getAdminServices } from "@/lib/services/admin-services";

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeZone: "Asia/Jakarta",
});

export default async function AdminPortfolioPage() {
  await requireAdmin();
  const [items, services] = await Promise.all([
    getAdminPortfolioItems(),
    getAdminServices(),
  ]);
  const serviceById = new Map(services.map((service) => [service.id, service]));
  const serviceOptions = services.map((service) => ({
    id: service.id,
    name: service.name,
    isActive: service.is_active,
  }));

  return (
    <main className="w-full px-margin-mobile py-8 md:px-gutter md:py-10">
      <div className="mx-auto w-full max-w-content">
        <Link href="/admin/konten" className="text-admin-label text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
          Kembali ke Kelola Konten
        </Link>
        <section aria-labelledby="portfolio-admin-heading" className="mt-6 border-b border-outline-variant pb-6">
          <h1 id="portfolio-admin-heading" className="font-heading text-admin-title text-primary">
            Portofolio
          </h1>
          <p className="mt-2 max-w-2xl text-admin-body text-on-surface-variant">
            Kelola karya yang ditampilkan pada beranda dan halaman Tentang Kami.
          </p>
          <p className="mt-3 max-w-3xl border border-outline-variant bg-surface-container-low px-4 py-3 text-admin-body text-on-surface-variant">
            Setelah minimal satu portofolio CMS dipublikasikan, halaman publik akan menggunakan item CMS sebagai sumber utama dan tidak mencampurnya dengan gambar fallback lokal.
          </p>
        </section>

        <section aria-labelledby="add-portfolio-heading" className="py-8">
          <h2 id="add-portfolio-heading" className="mb-6 font-heading text-heading-xs text-primary">
            Tambah Portofolio
          </h2>
          <PortfolioForm services={serviceOptions} />
        </section>

        <section aria-labelledby="portfolio-list-heading" className="border-t border-outline-variant py-8">
          <h2 id="portfolio-list-heading" className="font-heading text-heading-xs text-primary">
            Portofolio Terkelola
          </h2>

          {items.length === 0 ? (
            <div className="mt-6 border border-outline-variant bg-surface-container-low p-6">
              <p className="font-heading text-heading-xs text-primary">
                Belum ada portofolio yang dikelola melalui CMS.
              </p>
              <p className="mt-2 text-admin-body text-on-surface-variant">
                Halaman publik masih menggunakan 33 gambar fallback lokal. Gambar fallback tersebut bukan record database dan tidak ditampilkan sebagai item editable di sini.
              </p>
            </div>
          ) : (
            <div className="mt-6 overflow-x-auto border border-outline-variant">
              <table className="w-full min-w-[1040px] border-collapse text-left">
                <thead className="bg-surface-container-low">
                  <tr className="border-b border-outline-variant">
                    <th scope="col" className="px-4 py-3 text-admin-label text-primary">Gambar</th>
                    <th scope="col" className="px-4 py-3 text-admin-label text-primary">Konten</th>
                    <th scope="col" className="px-4 py-3 text-admin-label text-primary">Layanan</th>
                    <th scope="col" className="px-4 py-3 text-admin-label text-primary">Status</th>
                    <th scope="col" className="px-4 py-3 text-admin-label text-primary">Urutan</th>
                    <th scope="col" className="px-4 py-3 text-admin-label text-primary">Dibuat</th>
                    <th scope="col" className="px-4 py-3 text-admin-label text-primary"><span className="sr-only">Aksi</span></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => {
                    const service = item.service_id
                      ? serviceById.get(item.service_id)
                      : null;

                    return (
                      <tr key={item.id} className="border-b border-outline-variant align-top last:border-b-0">
                        <td className="px-4 py-4">
                          <div className="relative aspect-[4/3] w-28 overflow-hidden bg-surface-container-low">
                            <Image src={item.image_preview_url} alt={item.title} fill unoptimized={item.image_preview_url.startsWith("http")} sizes="112px" className="object-cover" />
                          </div>
                        </td>
                        <th scope="row" className="max-w-xs px-4 py-4">
                          <p className="font-heading text-admin-body text-primary">{item.title}</p>
                          {item.description ? (
                            <p className="mt-1 line-clamp-2 font-normal text-admin-caption text-on-surface-variant">{item.description}</p>
                          ) : null}
                        </th>
                        <td className="px-4 py-4 text-admin-body text-on-surface-variant">
                          {service ? `${service.name}${service.is_active ? "" : " (Nonaktif)"}` : "Tidak terkait"}
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex rounded-full px-3 py-1 text-admin-caption font-semibold ${item.is_published ? "bg-success-green/10 text-success-green" : "bg-surface-container text-on-surface-variant"}`}>
                            {item.is_published ? "Dipublikasikan" : "Disembunyikan"}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-admin-body text-on-surface">{item.sort_order}</td>
                        <td className="px-4 py-4 text-admin-caption text-on-surface-variant">{dateFormatter.format(new Date(item.created_at))}</td>
                        <td className="space-y-3 px-4 py-4 text-right">
                          <Link href={`/admin/konten/portofolio/${item.id}`} className="block text-admin-label text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
                            Edit
                          </Link>
                          <DeletePortfolioButton itemId={item.id} title={item.title} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
