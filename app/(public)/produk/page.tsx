import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { PublicCta } from "@/components/layout/public-cta";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";

export const metadata: Metadata = {
  title: "Produk Ready-Stock | Arriyadh Studio",
  description:
    "Produk ready-stock Arriyadh Studio dengan pilihan warna dan motif yang tersedia.",
};

const products = [
  {
    name: "Kaos Polos Premium",
    material: "Cotton Combed 30s",
    price: "Rp 45.000",
    availability: "Tersedia dalam berbagai pilihan warna.",
    variantNote: "Pilihan warna tersedia sesuai stok.",
    images: [
      {
        src: "/images/home/product-kaos-main-opsional.jpeg",
        alt: "Kaos polos premium Arriyadh Studio",
      },
      {
        src: "/images/home/product-kaos-main.jpeg",
        alt: "Pilihan warna kaos polos premium Arriyadh Studio",
      },
      {
        src: "/images/home/product-kaos-main-opsional-1.jpeg",
        alt: "Variasi warna kaos polos Arriyadh Studio",
      },
    ],
  },
  {
    name: "Celana Kolor Santai",
    material: "Baby Terry",
    price: "Rp 25.000",
    availability: "Tersedia dalam berbagai pilihan motif.",
    variantNote: "Pilihan motif tersedia sesuai stok.",
    images: [
      {
        src: "/images/home/product-celana-main.jpeg",
        alt: "Pilihan motif celana kolor santai Arriyadh Studio",
      },
      {
        src: "/images/home/product-celana-opsional.jpeg",
        alt: "Alternatif motif celana kolor santai Arriyadh Studio",
      },
      {
        src: "/images/home/product-celana-opsional-2.jpeg",
        alt: "Pilihan desain celana kolor santai Arriyadh Studio",
      },
    ],
  },
] as const;

const purchaseSteps = [
  {
    title: "Pilih Produk",
    description: "Tentukan produk, pilihan yang tersedia, dan jumlah pesanan.",
  },
  {
    title: "Isi Detail Pesanan",
    description: "Lengkapi informasi pesanan melalui halaman pemesanan.",
  },
  {
    title: "Lanjutkan Pembelian",
    description: "Ikuti informasi pembayaran dan penyelesaian pesanan.",
  },
] as const;

function ArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export default function ProdukPage() {
  return (
    <main className="overflow-hidden bg-surface-white text-on-surface">
      <section
        aria-labelledby="page-title"
        className="bg-surface-container-low py-16 md:py-section-gap"
      >
        <Container>
          <Reveal>
            <div className="mx-auto max-w-3xl text-center">
              <p className="font-body text-label-md uppercase text-secondary">
                Koleksi Tersedia
              </p>

              <h1
                id="page-title"
                className="mt-base font-heading text-heading-strong text-primary sm:text-display-md"
              >
                Produk Ready-Stock
              </h1>

              <p className="mx-auto mt-margin-mobile max-w-2xl font-body text-body-md text-on-surface-variant sm:text-body-lg">
                Produk siap beli dengan pilihan warna dan motif yang tersedia.
              </p>

              <div
                aria-hidden="true"
                className="mx-auto mt-gutter h-px w-16 bg-outline"
              />
            </div>
          </Reveal>
        </Container>
      </section>

      <section
        aria-label="Katalog produk ready-stock"
        className="bg-surface py-section-gap md:py-24"
      >
        <Container>
          <div className="grid items-stretch gap-gutter lg:grid-cols-2">
            {products.map((product, index) => {
              const [primaryImage, ...alternativeImages] = product.images;

              return (
                <Reveal key={product.name} className="h-full">
                  <article
                    aria-labelledby={`product-${index + 1}-title`}
                    className="group flex h-full flex-col border border-outline-variant bg-surface-white"
                  >
                    {/* Gallery */}
                    <div className="flex h-[560px] flex-col">
                      <div className="relative min-h-0 flex-1 overflow-hidden bg-surface-container-low">
                        <Image
                          src={primaryImage.src}
                          alt={primaryImage.alt}
                          fill
                          sizes="(min-width: 1024px) 50vw, 100vw"
                          className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.015] motion-reduce:transition-none"
                        />
                      </div>

                      <div className="grid h-40 shrink-0 grid-cols-2 gap-3 border-t border-outline-variant p-3">
                        {alternativeImages.map((image) => (
                          <figure
                            key={image.src}
                            className="relative h-full overflow-hidden bg-surface-container-low"
                          >
                            <Image
                              src={image.src}
                              alt={image.alt}
                              fill
                              sizes="(min-width: 1024px) 25vw, 50vw"
                              className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.015] motion-reduce:transition-none"
                            />
                          </figure>
                        ))}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex flex-1 flex-col border-t border-outline-variant p-gutter sm:p-8">
                      <p className="font-body text-label-md uppercase text-secondary">
                        Ready Stock {String(index + 1).padStart(2, "0")}
                      </p>

                      <h2
                        id={`product-${index + 1}-title`}
                        className="mt-base font-heading text-heading-strong text-primary"
                      >
                        {product.name}
                      </h2>

                      <dl className="mt-gutter border-y border-outline-variant">
                        <div className="grid grid-cols-[6rem_1fr] gap-gutter border-b border-outline-variant py-margin-mobile">
                          <dt className="font-body text-label-md uppercase text-secondary">
                            Material
                          </dt>

                          <dd className="font-body text-body-md text-on-surface">
                            {product.material}
                          </dd>
                        </div>

                        <div className="grid grid-cols-[6rem_1fr] items-baseline gap-gutter py-margin-mobile">
                          <dt className="font-body text-label-md uppercase text-secondary">
                            Harga
                          </dt>

                          <dd className="font-heading text-heading-md text-primary">
                            {product.price}
                          </dd>
                        </div>
                      </dl>

                      <div className="mt-gutter bg-surface-container-low p-gutter">
                        <p className="font-heading text-heading-xs text-primary">
                          {product.availability}
                        </p>

                        <p className="mt-base font-body text-body-sm text-on-surface-variant">
                          {product.variantNote}
                        </p>
                      </div>

                      <div className="mt-auto pt-8">
                        <Link
                          href="/pesan?tipe=produk"
                          className="inline-flex min-h-12 items-center justify-center gap-base rounded-md bg-primary px-gutter font-body text-button text-on-primary transition-colors hover:bg-primary-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                        >
                          Beli Sekarang
                          <span className="transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none">
                            <ArrowIcon />
                          </span>
                        </Link>
                      </div>
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </Container>
      </section>

      <section
        aria-labelledby="availability-title"
        className="bg-surface-white py-section-gap"
      >
        <Container>
          <Reveal>
            <div className="grid gap-10 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:gap-20">
              <div>
                <p className="font-body text-label-md uppercase text-secondary">
                  Informasi Pembelian
                </p>

                <h2
                  id="availability-title"
                  className="mt-base max-w-md font-heading text-heading-lg text-primary"
                >
                  Pilihan Produk Mengikuti Stok Tersedia
                </h2>

                <p className="mt-gutter max-w-md font-body text-body-md text-on-surface-variant">
                  Warna dan motif dapat berbeda sesuai persediaan. Pilihan yang
                  tersedia dapat dikonfirmasi saat melakukan pemesanan.
                </p>
              </div>

              <ol className="border-y border-outline-variant">
                {purchaseSteps.map((step, index) => (
                  <li
                    key={step.title}
                    className="grid grid-cols-[2.5rem_1fr] gap-margin-mobile border-b border-outline-variant py-gutter last:border-b-0 sm:grid-cols-[3rem_11rem_1fr] sm:gap-gutter"
                  >
                    <span className="font-body text-label-md text-secondary">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <h3 className="font-heading text-heading-xs text-primary">
                      {step.title}
                    </h3>

                    <p className="col-start-2 font-body text-body-sm text-on-surface-variant sm:col-start-3">
                      {step.description}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          </Reveal>
        </Container>
      </section>

      <PublicCta />
    </main>
  );
}
