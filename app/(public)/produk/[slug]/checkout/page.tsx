import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductCheckoutForm } from "@/app/(public)/produk/[slug]/checkout/product-checkout-form";
import { Container } from "@/components/ui/container";
import { getActiveProductBySlug } from "@/lib/products/public-products";

export const metadata: Metadata = {
  title: "Checkout Produk | Arriyadh Studio",
  description: "Lengkapi pesanan produk ready-stock Arriyadh Studio.",
  robots: { index: false, follow: false },
};

const rupiahFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export default async function ProductCheckoutPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getActiveProductBySlug(slug);

  if (!product) notFound();

  return (
    <main className="bg-surface-container-low py-12 text-on-surface sm:py-16 md:py-section-gap">
      <Container>
        <div className="mx-auto max-w-5xl">
          <Link
            href="/produk"
            className="font-body text-button text-on-surface-variant underline-offset-4 hover:text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            ← Kembali ke Produk
          </Link>

          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-start">
            <section className="border border-outline-variant bg-surface-white p-6 sm:p-8">
              <p className="font-body text-label-md uppercase text-secondary">
                Produk Dipilih
              </p>
              <h1 className="mt-2 font-heading text-heading-lg text-primary">
                {product.name}
              </h1>
              {product.description ? (
                <p className="mt-3 font-body text-body-md text-on-surface-variant">
                  {product.description}
                </p>
              ) : null}
              <dl className="mt-6 border-y border-outline-variant">
                <div className="flex items-start justify-between gap-4 py-4">
                  <dt className="font-body text-body-md text-on-surface-variant">
                    Harga satuan
                  </dt>
                  <dd className="font-heading text-heading-sm text-primary">
                    {rupiahFormatter.format(product.price)}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-4 border-t border-outline-variant py-4">
                  <dt className="font-body text-body-md text-on-surface-variant">
                    Ukuran tersedia
                  </dt>
                  <dd className="text-right font-body text-body-md font-semibold text-primary">
                    {product.available_sizes.length > 0
                      ? product.available_sizes.join(", ")
                      : "Belum tersedia"}
                  </dd>
                </div>
              </dl>
              <p className="mt-5 font-body text-body-sm text-on-surface-variant">
                Total pesanan dihitung menggunakan harga terbaru dari sistem
                setelah formulir dikirim.
              </p>
            </section>

            <section className="border border-outline-variant bg-surface-white p-6 sm:p-8">
              <h2 className="font-heading text-heading-md text-primary">
                Detail Pesanan
              </h2>
              <p className="mt-2 font-body text-body-md text-on-surface-variant">
                Pilih ukuran dan lengkapi informasi pemesan.
              </p>
              <div className="mt-6">
                <ProductCheckoutForm
                  productId={product.id}
                  availableSizes={product.available_sizes}
                />
              </div>
            </section>
          </div>
        </div>
      </Container>
    </main>
  );
}
