import Link from "next/link";

import { ContentStatusBadge } from "@/components/admin/content-status-badge";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getAdminProducts } from "@/lib/products/admin-products";
import { getProductStartingPrice } from "@/lib/products/product-pricing";

const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export default async function AdminProductsPage() {
  await requireAdmin();
  const products = await getAdminProducts();

  return (
    <main className="w-full px-margin-mobile py-8 md:px-gutter md:py-10">
      <div className="mx-auto w-full max-w-content">
        <Link href="/admin/konten" className="text-admin-label text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
          Kembali ke Kelola Konten
        </Link>
        <section aria-labelledby="products-admin-heading" className="mt-6 border-b border-outline-variant pb-6">
          <h1 id="products-admin-heading" className="font-heading text-admin-title text-primary">
            Produk
          </h1>
          <p className="mt-2 max-w-2xl text-admin-body text-on-surface-variant">
            Kelola informasi katalog, gambar, ukuran, status, dan urutan produk yang sudah tersedia. Harga dan varian bersifat read-only.
          </p>
        </section>

        <section aria-labelledby="products-list-heading" className="py-8">
          <h2 id="products-list-heading" className="sr-only">
            Daftar produk
          </h2>
          <p className="mb-4 text-admin-caption text-on-surface-variant">Harga awal dihitung dari data harga sistem dan hanya ditampilkan sebagai referensi.</p>
          <div className="overflow-x-auto overscroll-x-contain rounded-md border border-outline-variant" tabIndex={0} aria-label="Daftar produk, dapat digulir horizontal">
            <table className="w-full min-w-[940px] border-collapse text-left">
              <thead className="bg-surface-container-low">
                <tr className="border-b border-outline-variant">
                  <th scope="col" className="px-4 py-3 text-admin-label text-primary">Produk</th>
                  <th scope="col" className="px-4 py-3 text-admin-label text-primary">Slug</th>
                  <th scope="col" className="px-4 py-3 text-admin-label text-primary">Status</th>
                  <th scope="col" className="px-4 py-3 text-admin-label text-primary">Urutan</th>
                  <th scope="col" className="px-4 py-3 text-admin-label text-primary">Ukuran</th>
                  <th scope="col" className="px-4 py-3 text-admin-label text-primary">Ringkasan Harga</th>
                  <th scope="col" className="px-4 py-3 text-admin-label text-primary"><span className="sr-only">Aksi</span></th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const activeVariants = product.variants.filter((variant) => variant.is_active);
                  const startingPrice = getProductStartingPrice(product.price, activeVariants);

                  return (
                    <tr key={product.id} className="border-b border-outline-variant transition-colors last:border-b-0 hover:bg-surface-container-low/60">
                      <th scope="row" className="px-4 py-4 font-heading text-admin-body text-primary">{product.name}</th>
                      <td className="px-4 py-4 font-mono text-admin-caption text-on-surface-variant">{product.slug}</td>
                      <td className="px-4 py-4"><ContentStatusBadge active={product.is_active} /></td>
                      <td className="px-4 py-4 text-admin-body text-on-surface">{product.sort_order}</td>
                      <td className="px-4 py-4 text-admin-body text-on-surface-variant">{product.available_sizes.join(", ")}</td>
                      <td className="px-4 py-4 text-admin-body text-on-surface-variant">
                        {activeVariants.length > 0 ? `${activeVariants.length} varian aktif · Mulai ` : "Fallback "}
                        {rupiah.format(startingPrice)}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <Link href={`/admin/konten/produk/${product.id}`} className="text-admin-label text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
                          Edit produk
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
