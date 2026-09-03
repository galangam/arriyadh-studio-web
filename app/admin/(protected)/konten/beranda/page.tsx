import Link from "next/link";

import {
  updateFeaturedProducts,
  updateFeaturedServices,
} from "@/app/admin/(protected)/konten/beranda/actions";
import {
  FeaturedSelectionForm,
  type FeaturedOption,
} from "@/app/admin/(protected)/konten/beranda/featured-selection-form";
import { HomepageContentForm } from "@/app/admin/(protected)/konten/beranda/homepage-content-form";
import { requireAdmin } from "@/lib/auth/require-admin";
import {
  getHomepageFeaturedProducts,
  getHomepageFeaturedServices,
} from "@/lib/content/featured-content";
import { getHomepageContent } from "@/lib/content/homepage-content";
import { getActiveProducts } from "@/lib/products/public-products";
import { getActiveServices } from "@/lib/services/public-services";

export default async function HomepageAdminPage() {
  await requireAdmin();
  const [content, featuredServices, featuredProducts, services, products] =
    await Promise.all([
      getHomepageContent(),
      getHomepageFeaturedServices(),
      getHomepageFeaturedProducts(),
      getActiveServices(),
      getActiveProducts(),
    ]);
  const serviceOptions: FeaturedOption[] = services.map(({ id, name }) => ({ id, name }));
  const productOptions: FeaturedOption[] = products.map(({ id, name }) => ({ id, name }));

  return (
    <main className="w-full px-margin-mobile py-8 md:px-gutter md:py-10">
      <div className="mx-auto w-full max-w-content">
        <Link href="/admin/konten" className="text-admin-label text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
          Kembali ke Kelola Konten
        </Link>
        <section aria-labelledby="homepage-admin-heading" className="mt-6 border-b border-outline-variant pb-6">
          <h1 id="homepage-admin-heading" className="font-heading text-admin-title text-primary">Beranda</h1>
          <p className="mt-2 max-w-2xl text-admin-body text-on-surface-variant">
            Kelola copy utama, gambar hero, serta pilihan layanan dan produk pada halaman beranda.
          </p>
        </section>

        <section aria-labelledby="homepage-content-heading" className="py-8">
          <h2 id="homepage-content-heading" className="mb-6 font-heading text-heading-xs text-primary">Konten Beranda</h2>
          <HomepageContentForm content={content} />
        </section>

        <section aria-labelledby="homepage-featured-heading" className="mt-2">
          <h2 id="homepage-featured-heading" className="font-heading text-heading-xs text-primary">Konten Unggulan</h2>
          <p className="mt-1.5 max-w-2xl text-admin-body text-on-surface-variant">Pilih item aktif yang ditampilkan pada beranda, lalu atur urutannya.</p>
          <div className="mt-6">
            <FeaturedSelectionForm title="Layanan Unggulan" description="Pilih layanan aktif dan atur urutannya pada beranda." options={serviceOptions} initialSelectedIds={featuredServices.map((service) => service.id)} action={updateFeaturedServices} />
            <FeaturedSelectionForm title="Produk Unggulan" description="Pilih produk aktif dan atur urutannya. Harga tetap mengikuti katalog dan varian produk." options={productOptions} initialSelectedIds={featuredProducts.map((product) => product.id)} action={updateFeaturedProducts} />
          </div>
        </section>
      </div>
    </main>
  );
}
