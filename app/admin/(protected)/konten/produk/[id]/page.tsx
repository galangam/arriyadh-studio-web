import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductForm } from "@/app/admin/(protected)/konten/produk/[id]/product-form";
import { requireAdmin } from "@/lib/auth/require-admin";
import { resolveContentImageUrl } from "@/lib/content/content-images";
import { getAdminProductById } from "@/lib/products/admin-products";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function AdminProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  if (!uuidPattern.test(id)) notFound();

  const product = await getAdminProductById(id);
  if (!product) notFound();
  const imagePreviewUrl = await resolveContentImageUrl(product.image_url);

  return (
    <main className="w-full px-margin-mobile py-8 md:px-gutter md:py-10">
      <div className="mx-auto w-full max-w-content">
        <Link href="/admin/konten/produk" className="text-admin-label text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
          Kembali ke Daftar Produk
        </Link>
        <section aria-labelledby="product-admin-heading" className="mt-6 border-b border-outline-variant pb-6">
          <h1 id="product-admin-heading" className="font-heading text-admin-title text-primary">
            Edit Produk
          </h1>
          <p className="mt-2 max-w-2xl text-admin-body text-on-surface-variant">
            Ubah informasi katalog dan ketersediaan produk {product.name}. Harga dan varian tetap dikelola sistem.
          </p>
        </section>

        <div className="py-8">
          <ProductForm product={product} imagePreviewUrl={imagePreviewUrl} />
        </div>
      </div>
    </main>
  );
}
