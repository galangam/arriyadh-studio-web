import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductCheckoutForm } from "@/app/(public)/produk/[slug]/checkout/product-checkout-form";
import { Container } from "@/components/ui/container";
import {
  getProductAvailabilitySupport,
  getProductStartingPrice,
} from "@/lib/products/product-pricing";
import { getActiveProductBySlug } from "@/lib/products/public-products";
import {
  arriyadhWhatsappNumber,
  createWhatsappUrl,
} from "@/lib/whatsapp";

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

  const startingPrice = getProductStartingPrice(product.price, product.variants);
  const availabilitySupport = getProductAvailabilitySupport(product.slug);
  const availabilitySupportUrl = availabilitySupport
    ? createWhatsappUrl(arriyadhWhatsappNumber, availabilitySupport.message)
    : null;

  return (
    <main className="bg-surface-container-low py-12 text-on-surface sm:py-16 md:py-section-gap">
      <Container>
        <div className="mx-auto max-w-6xl">
          <Link
            href="/produk"
            className="font-body text-button text-on-surface-variant underline-offset-4 hover:text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            ← Kembali ke Produk
          </Link>

          <div className="mt-6 space-y-6">
            <section className="border border-outline-variant bg-surface-white p-6 sm:p-8 lg:grid lg:grid-cols-[minmax(16rem,0.7fr)_minmax(0,1.3fr)] lg:gap-8">
              {product.image_url ? (
                <div className="relative -mx-6 -mt-6 mb-6 aspect-[16/10] overflow-hidden border-b border-outline-variant bg-surface-container-low sm:-mx-8 sm:-mt-8 sm:mb-8 lg:m-0 lg:aspect-[4/3] lg:border lg:border-outline-variant">
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    unoptimized={product.image_url.startsWith("http")}
                    sizes="(min-width: 1024px) 40vw, 100vw"
                    className="object-cover object-center"
                  />
                </div>
              ) : null}
              <div className={product.image_url ? undefined : "lg:col-span-2"}>
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
                    {product.variants.length > 1
                      ? "Harga mulai dari"
                      : "Harga satuan"}
                  </dt>
                  <dd className="font-heading text-heading-sm text-primary">
                    {rupiahFormatter.format(startingPrice)}
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
                  Harga pada ringkasan akan menyesuaikan pilihan varian, ukuran,
                  dan jumlah Anda.
                </p>
                {availabilitySupport && availabilitySupportUrl ? (
                  <div className="mt-5 border-t border-outline-variant pt-5">
                    <p className="font-body text-body-sm text-on-surface-variant">
                      Pilihan lengkap mengikuti stok yang tersedia. Konfirmasikan
                      pilihan sebelum menyelesaikan pesanan website.
                    </p>
                    <a
                      href={availabilitySupportUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex min-h-11 items-center justify-center rounded-md border border-outline px-4 font-body text-button text-primary hover:bg-surface-container-low"
                    >
                      {availabilitySupport.label}
                    </a>
                  </div>
                ) : null}
              </div>
            </section>

            <section className="border border-outline-variant bg-surface-white p-6 sm:p-8">
              <h2 className="font-heading text-heading-md text-primary">
                Detail Pesanan
              </h2>
              <p className="mt-2 font-body text-body-md text-on-surface-variant">
                Pilih detail produk dan lengkapi informasi pemesan.
              </p>
              <div className="mt-6">
                <ProductCheckoutForm
                  productId={product.id}
                  catalogPrice={product.price}
                  availableSizes={product.available_sizes}
                  variants={product.variants}
                />
              </div>
            </section>
          </div>
        </div>
      </Container>
    </main>
  );
}
