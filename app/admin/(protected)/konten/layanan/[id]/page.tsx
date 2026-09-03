import Link from "next/link";
import { notFound } from "next/navigation";

import { ServiceForm } from "@/app/admin/(protected)/konten/layanan/[id]/service-form";
import { requireAdmin } from "@/lib/auth/require-admin";
import { resolveContentImageUrl } from "@/lib/content/content-images";
import { getAdminServiceById } from "@/lib/services/admin-services";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function AdminServiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  if (!uuidPattern.test(id)) notFound();

  const service = await getAdminServiceById(id);
  if (!service) notFound();
  const imagePreviewUrl = await resolveContentImageUrl(service.image_url);

  return (
    <main className="w-full px-margin-mobile py-8 md:px-gutter md:py-10">
      <div className="mx-auto w-full max-w-content">
        <Link href="/admin/konten/layanan" className="text-admin-label text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
          Kembali ke Daftar Layanan
        </Link>
        <section aria-labelledby="service-admin-heading" className="mt-6 border-b border-outline-variant pb-6">
          <h1 id="service-admin-heading" className="font-heading text-admin-title text-primary">
            Edit Layanan
          </h1>
          <p className="mt-2 max-w-2xl text-admin-body text-on-surface-variant">
            Ubah informasi katalog dan ketersediaan layanan {service.name}.
          </p>
        </section>

        <div className="py-8">
          <ServiceForm service={service} imagePreviewUrl={imagePreviewUrl} />
        </div>
      </div>
    </main>
  );
}
