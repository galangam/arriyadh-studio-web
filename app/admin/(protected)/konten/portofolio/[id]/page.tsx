import Link from "next/link";
import { notFound } from "next/navigation";

import { PortfolioForm } from "@/app/admin/(protected)/konten/portofolio/portfolio-form";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getAdminPortfolioItemById } from "@/lib/content/admin-portfolio";
import { getAdminServices } from "@/lib/services/admin-services";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function AdminPortfolioDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  if (!uuidPattern.test(id)) notFound();

  const [item, services] = await Promise.all([
    getAdminPortfolioItemById(id),
    getAdminServices(),
  ]);
  if (!item) notFound();

  const serviceOptions = services.map((service) => ({
    id: service.id,
    name: service.name,
    isActive: service.is_active,
  }));

  return (
    <main className="w-full px-margin-mobile py-8 md:px-gutter md:py-10">
      <div className="mx-auto w-full max-w-content">
        <Link href="/admin/konten/portofolio" className="text-admin-label text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
          Kembali ke Daftar Portofolio
        </Link>
        <section aria-labelledby="portfolio-detail-heading" className="mt-6 border-b border-outline-variant pb-6">
          <h1 id="portfolio-detail-heading" className="font-heading text-admin-title text-primary">
            Edit Portofolio
          </h1>
          <p className="mt-2 max-w-2xl text-admin-body text-on-surface-variant">
            Ubah konten, relasi layanan, urutan, status publikasi, atau gambar item {item.title}.
          </p>
        </section>

        <div className="py-8">
          <PortfolioForm item={item} services={serviceOptions} />
        </div>
      </div>
    </main>
  );
}
