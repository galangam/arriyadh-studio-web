import Image from "next/image";
import Link from "next/link";

import { PublicCta } from "@/components/layout/public-cta";
import { PortfolioCarousel } from "@/components/sections/portfolio-carousel";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";

const services = [
  {
    title: "Permak",
    description:
      "Penyesuaian presisi untuk pakaian lama Anda agar kembali pas dan nyaman dipakai.",
    href: "/layanan#permak",
  },
  {
    title: "Sablon",
    description:
      "Teknik cetak berkualitas tinggi dengan tinta premium untuk hasil desain yang tajam dan tahan lama.",
    href: "/layanan#sablon",
  },
  {
    title: "Kaos",
    description:
      "Produksi kaos custom untuk event, komunitas, perusahaan, maupun kebutuhan retail.",
    href: "/layanan#kaos",
  },
  {
    title: "Kemeja",
    description:
      "Seragam kantor, PDH, atau kemeja kasual dengan jahitan rapi dan nyaman digunakan.",
    href: "/layanan#kemeja",
  },
  {
    title: "Jersey",
    description:
      "Pakaian olahraga dengan bahan breathable dan teknologi sublimasi modern.",
    href: "/layanan#jersey",
  },
  {
    title: "Sweater",
    description:
      "Hoodie, sweater, dan jaket dengan pilihan bahan fleece maupun baby terry.",
    href: "/layanan#sweater",
  },
] as const;

const products = [
  {
    title: "Kaos Polos Premium",
    material: "Cotton Combed 30s",
    variant: "Tersedia dalam berbagai pilihan warna",
    price: "Rp 45.000",
    image: "/images/home/product-kaos-main.jpeg",
    imageAlt: "Kaos polos premium Arriyadh Studio",
  },
  {
    title: "Celana Kolor Santai",
    material: "Bahan Baby Terry",
    variant: "Tersedia dalam berbagai pilihan motif",
    price: "Rp 35.000",
    image: "/images/home/product-celana-opsional-1.jpeg",
    imageAlt: "Celana kolor santai Arriyadh Studio",
  },
] as const;

const portfolioImages = Array.from({ length: 33 }, (_, index) => {
  const number = index + 1;

  return {
    src: `/images/home/portfolio-${number}.jpeg`,
    alt: `Hasil produksi Arriyadh Studio ${number}`,
  };
});

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

export default function Home() {
  return (
    <main className="overflow-hidden bg-surface-white text-on-surface">
      {/* HERO */}
      <section
        aria-labelledby="hero-title"
        className="relative isolate bg-surface-container-low"
      >
        <Image
          src="/images/home/hero-workshop-demo.jpeg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="-z-20 object-cover object-[center_35%] opacity-40"
          aria-hidden="true"
        />

        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-surface-white/55"
        />

       <Container className="flex min-h-[520px] items-center py-16 md:min-h-[560px] md:py-section-gap lg:min-h-[600px]">
  <div className="max-w-2xl py-gutter md:w-[58%] md:py-10 lg:py-12">
    <p className="font-body text-label-md uppercase text-secondary">
      Terpercaya Sejak 2010
    </p>

    <h1
      id="hero-title"
      className="mt-margin-mobile max-w-xl font-heading text-heading-strong text-primary sm:text-display-lg"
    >
      Solusi Konveksi &amp; Sablon Terbaik di Subang
    </h1>

    <p className="mt-gutter max-w-xl font-body text-body-md text-on-surface-variant sm:text-body-lg">
      Kualitas premium untuk seragam, kaos, dan merchandise custom Anda.
      Pengerjaan tepat waktu dengan standar industri terpercaya.
    </p>

    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
      <Link
        href="/layanan"
        className="inline-flex min-h-12 items-center justify-center gap-base rounded-md bg-primary px-gutter font-body text-button text-on-primary transition-colors hover:bg-primary-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        Lihat Layanan
        <ArrowIcon />
      </Link>

      <Link
        href="/lacak-pesanan"
        className="inline-flex min-h-12 items-center justify-center rounded-md border border-primary bg-surface-white/80 px-gutter font-body text-button text-primary transition-colors hover:bg-surface-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        Lacak Pesanan
      </Link>
    </div>
  </div>
</Container>
      </section>

      {/* EXPERIENCE */}
      <section
        aria-labelledby="experience-title"
        className="relative bg-surface-white py-section-gap"
      >
        <Container>
          <Reveal>
            <div className="grid items-center gap-10 md:grid-cols-[minmax(0,2fr)_minmax(220px,1fr)] md:gap-16">
              <div>
                <p className="font-body text-label-md uppercase text-secondary">
                  Tentang Kami
                </p>

                <h2
                  id="experience-title"
                  className="mt-base max-w-xl font-heading text-heading-lg text-primary"
                >
                  Keahlian yang Berakar dari Pengalaman
                </h2>

                <p className="mt-gutter max-w-2xl font-body text-body-md text-on-surface-variant">
                  Arriyadh Studio telah menjadi mitra terpercaya di Subang
                  selama lebih dari satu dekade. Kami memadukan teknik
                  tradisional dengan teknologi modern untuk menghasilkan produk
                  tekstil yang tidak hanya tahan lama tetapi juga representatif
                  bagi identitas bisnis atau komunitas Anda.
                </p>
              </div>

              <div className="mt-10 border-t border-outline-variant pt-gutter md:mt-0 md:border-l md:border-t-0 md:py-margin-mobile md:pl-12">
                <p className="font-heading text-display-xl font-bold text-primary">
                  10+
                </p>

                <p className="mt-base max-w-44 font-body text-label-md uppercase text-secondary">
                  Tahun Pengalaman Industri
                </p>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* SERVICES */}
      <section
        aria-labelledby="services-title"
        className="bg-surface py-section-gap"
      >
        <Container>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:gap-20">
            <Reveal>
              <div className="lg:pt-base">
                <p className="font-body text-label-md uppercase text-secondary">
                  Yang Kami Kerjakan
                </p>

                <h2
                  id="services-title"
                  className="mt-base max-w-md font-heading text-heading-lg text-primary"
                >
                  Layanan untuk Berbagai Kebutuhan
                </h2>

                <p className="mt-gutter max-w-md font-body text-body-md text-on-surface-variant">
                  Mulai dari permak sederhana hingga produksi pakaian custom,
                  setiap pengerjaan kami sesuaikan dengan kebutuhan pelanggan.
                </p>

                <Link
                  href="/layanan"
                  className="mt-8 inline-flex items-center gap-base font-body text-button text-primary underline-offset-4 hover:underline"
                >
                  Lihat Semua Layanan
                  <ArrowIcon />
                </Link>
              </div>
            </Reveal>

            <div className="border-y border-outline-variant">
              {services.map((service, index) => (
                <Reveal
                  key={service.title}
                  delay={index * 70}
                  className="border-b border-outline-variant last:border-b-0"
                >
                  <Link
                    href={service.href}
                    className="group block px-base py-6 transition-colors hover:bg-surface-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary md:py-7"
                  >
                    <div className="grid grid-cols-[2.5rem_1fr_auto] items-start gap-margin-mobile md:grid-cols-[3rem_10rem_1fr_auto] md:gap-gutter">
                      <span className="pt-1 font-body text-label-md text-secondary">
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <h3 className="font-heading text-heading-sm text-primary">
                        {service.title}
                      </h3>

                      <p className="hidden max-w-lg font-body text-body-sm text-on-surface-variant md:block">
                        {service.description}
                      </p>

                      <span className="pt-1 text-primary transition-transform duration-200 group-hover:translate-x-1">
                        <ArrowIcon />
                      </span>
                    </div>

                    <p className="mt-2 pl-14 font-body text-body-sm text-on-surface-variant md:hidden">
                      {service.description}
                    </p>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* PRODUCTS */}
      <section aria-labelledby="products-title" className="py-section-gap">
        <Container>
          <Reveal>
            <div className="flex flex-col gap-gutter sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="font-body text-label-md uppercase text-secondary">
                  Ready Stock
                </p>

                <h2
                  id="products-title"
                  className="mt-base font-heading text-heading-lg text-primary"
                >
                  Produk Tersedia
                </h2>

                <p className="mt-base max-w-xl font-body text-body-sm text-on-surface-variant">
                  Produk ready-stock tersedia dalam beberapa pilihan warna dan
                  motif. Pilihan lengkap dapat dilihat pada halaman produk.
                </p>
              </div>

              <Link
                href="/produk"
                className="inline-flex items-center gap-base self-start font-body text-button text-primary underline-offset-4 hover:underline sm:self-auto"
              >
                Lihat Semua Produk
                <ArrowIcon />
              </Link>
            </div>
          </Reveal>

          <div className="mt-10 grid gap-gutter md:grid-cols-2">
            {products.map((product, index) => (
              <Reveal key={product.title} delay={index * 120}>
                <article className="group overflow-hidden border border-outline-variant bg-surface-white">
                  <div className="relative aspect-[4/3] overflow-hidden border-b border-outline-variant bg-surface-container-low">
                    <Image
                      src={product.image}
                      alt={product.imageAlt}
                      fill
                      sizes="(min-width: 768px) 50vw, 100vw"
                      className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.015]"
                    />

                    <span className="absolute left-margin-mobile top-margin-mobile bg-primary px-3 py-1 font-body text-label-sm uppercase text-on-primary">
                      Ready
                    </span>
                  </div>

                  <div className="p-gutter">
                    <div className="flex flex-col gap-gutter sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <h3 className="font-heading text-heading-sm text-primary">
                          {product.title}
                        </h3>

                        <p className="mt-1 font-body text-body-sm text-on-surface-variant">
                          {product.material}
                        </p>

                        <p className="mt-base font-body text-body-sm font-medium text-secondary">
                          {product.variant}
                        </p>

                        <p className="mt-margin-mobile font-heading text-heading-xs text-primary">
                          {product.price}
                        </p>
                      </div>

                      <Link
                        href="/pesan?tipe=produk"
                        className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-gutter font-body text-button text-on-primary transition-colors hover:bg-primary-container"
                      >
                        Beli
                      </Link>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* PORTFOLIO */}
      <section
        aria-labelledby="portfolio-title"
        className="bg-surface py-section-gap"
      >
        <Container>
          <Reveal>
            <div className="flex flex-col gap-gutter md:flex-row md:items-end md:justify-between">
              <div>
                <p className="font-body text-label-md uppercase text-secondary">
                  Portofolio
                </p>

                <h2
                  id="portfolio-title"
                  className="mt-base font-heading text-heading-lg text-primary"
                >
                  Hasil Produksi Kami
                </h2>

                <p className="mt-base font-body text-body-md text-on-surface-variant">
                  Beberapa hasil produksi yang telah kami kerjakan untuk
                  berbagai kebutuhan pelanggan.
                </p>
              </div>

              <Link
                href="/tentang-kami#portofolio"
                className="inline-flex items-center gap-base self-start font-body text-button text-primary underline-offset-4 hover:underline md:self-auto"
              >
                Lihat Semua Portofolio
                <ArrowIcon />
              </Link>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <PortfolioCarousel images={portfolioImages} />
          </Reveal>
        </Container>
      </section>

      <PublicCta />
    </main>
  );
}