import type { Metadata } from "next";

import Image from "next/image";
import Link from "next/link";

import { PublicCta } from "@/components/layout/public-cta";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";

export const metadata: Metadata = {
  title: "Tentang Kami | Arriyadh Studio",
  description:
    "Mengenal Arriyadh Studio, jasa konveksi, sablon, dan pakaian custom di Subang sejak 2010.",
};

const portfolioImages = Array.from({ length: 32 }, (_, index) => {
  const number = index + 1;

  return {
    src: `/images/home/portfolio-${number}.jpeg`,
    alt: `Hasil produksi Arriyadh Studio ${number}`,
  };
});

const contactInformation = {
  address:
    "Jl. Moch Idris, Dusun Cibodas, Kec. Kalijati, Kabupaten Subang, Jawa Barat, Indonesia",

  mapsHref:
    "https://www.google.com/maps/place/ARRIYADH+STUDIO/@-6.5269638,107.6929188,17z/data=!3m1!4b1!4m6!3m5!1s0x2e693d4dd1f64ee7:0x3c26c2cb7b7a7eb2!8m2!3d-6.5269638!4d107.6929188!16s%2Fg%2F11ygpmhxzz?entry=ttu&g_ep=EgoyMDI2MDgxOS4wIKXMDSoASAFQAw%3D%3D" ,
} as const;

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

function HistoryIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-7"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 4v5h5" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function ShirtIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-7"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 4 5 5.5 2.5 9 6 11v9h12v-9l3.5-2L19 5.5 16 4a5 5 0 0 1-8 0Z" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-7"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  );
}

export default function TentangKamiPage() {
  return (
    <main className="overflow-hidden bg-surface-white text-on-surface">
      {/* INTRO */}
      <section
        aria-labelledby="page-title"
        className="bg-surface-white py-20 text-center md:py-24 lg:py-28"
      >
        <Container>
          <Reveal>
            <div className="mx-auto max-w-4xl">
              <h1
                id="page-title"
                className="font-heading text-heading-strong text-primary sm:text-display-md"
              >
                Mengenal Arriyadh Studio
              </h1>

              <p className="mt-margin-mobile font-body text-body-lg font-medium text-secondary">
                Jasa Konveksi &amp; Sablon Terpercaya di Subang
              </p>

              <div
                aria-hidden="true"
                className="mx-auto mt-10 h-[3px] w-14 bg-primary"
              />
            </div>
          </Reveal>
        </Container>
      </section>

      {/* STORY */}
      <section
        aria-labelledby="about-title"
        className="bg-surface py-section-gap md:py-24"
      >
        <Container>
          <Reveal>
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
              <div className="relative mx-auto w-full max-w-2xl">
                <div className="relative aspect-[4/3] overflow-hidden bg-surface-container-low">
                  <Image
                    src="/images/home/hero-workshop-demo.jpeg"
                    alt="Aktivitas produksi di workshop Arriyadh Studio"
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover object-center"
                  />
                </div>
              </div>

              <div className="max-w-xl">
                <p className="font-body text-label-md uppercase text-secondary">
                  Arriyadh Studio
                </p>

                <h2
                  id="about-title"
                  className="mt-base font-heading text-heading-lg text-primary"
                >
                  Dedikasi pada Kualitas
                </h2>

                <div className="mt-gutter space-y-margin-mobile font-body text-body-md leading-relaxed text-on-surface-variant">
                  <p>
                    Arriyadh Studio berdiri sejak tahun 2010 dan bergerak dalam
                    layanan konveksi, sablon, serta kebutuhan pakaian custom.
                  </p>

                  <p>
                    Selama lebih dari satu dekade, kami berkomitmen memberikan
                    hasil produksi yang rapi, berkualitas, tepat waktu, dan
                    sesuai kebutuhan pelanggan.
                  </p>

                  <p>
                    Pelayanan kami mencakup kebutuhan individu, komunitas,
                    organisasi, sekolah, perusahaan, maupun berbagai kebutuhan
                    usaha lainnya.
                  </p>
                </div>

                <Link
                  href="/layanan"
                  className="mt-8 inline-flex items-center gap-base font-body text-button text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  Lihat Layanan Kami
                  <ArrowIcon />
                </Link>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* STRENGTHS */}
      <section
        aria-label="Pengalaman dan keunggulan Arriyadh Studio"
        className="bg-primary py-12 md:py-16"
      >
        <Container>
          <Reveal>
            <div className="grid gap-gutter md:grid-cols-3">
              <article className="flex min-h-44 flex-col items-center justify-center border border-on-primary/35 px-gutter py-8 text-center text-on-primary">
                <HistoryIcon />

                <h2 className="mt-margin-mobile font-heading text-heading-md">
                  Sejak 2010
                </h2>

                <p className="mt-base font-body text-label-sm uppercase tracking-wide text-on-primary/60">
                  Berpengalaman
                </p>
              </article>

              <article className="flex min-h-44 flex-col items-center justify-center border border-on-primary/35 px-gutter py-8 text-center text-on-primary">
                <ShirtIcon />

                <h2 className="mt-margin-mobile font-heading text-heading-md">
                  Kustom &amp; Permak
                </h2>

                <p className="mt-base font-body text-label-sm uppercase tracking-wide text-on-primary/60">
                  Layanan Lengkap
                </p>
              </article>

              <article className="flex min-h-44 flex-col items-center justify-center border border-on-primary/35 px-gutter py-8 text-center text-on-primary">
                <EyeIcon />

                <h2 className="mt-margin-mobile font-heading text-heading-md">
                  Transparan
                </h2>

                <p className="mt-base font-body text-label-sm uppercase tracking-wide text-on-primary/60">
                  Pengerjaan Terbuka
                </p>
              </article>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* WORKSHOP */}
     <section
  aria-labelledby="workshop-title"
  className="bg-surface py-section-gap md:py-24"
>
  <Container>
    <Reveal>
      <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div>
          <h2
            id="workshop-title"
            className="font-heading text-heading-lg text-primary"
          >
            Kunjungi Workshop Kami
          </h2>

          <p className="mt-gutter max-w-lg font-body text-body-md leading-relaxed text-on-surface-variant">
            Kami menyambut Anda untuk berkonsultasi langsung atau melihat
            proses pengerjaan di workshop kami yang berlokasi di Subang.
          </p>

          <div className="mt-8 space-y-6">
            <div>
              <p className="font-body text-label-md font-bold uppercase text-primary">
                Alamat Lengkap
              </p>

              <p className="mt-base max-w-md font-body text-body-sm leading-relaxed text-on-surface-variant">
                {contactInformation.address}
              </p>
            </div>

            <div>
              <p className="font-body text-label-md font-bold uppercase text-primary">
                Jam Operasional
              </p>

              <p className="mt-base font-body text-body-sm text-on-surface-variant">
                Senin – Sabtu: 09.00 – 17.00 WIB
              </p>
            </div>
          </div>

          <a
            href={contactInformation.mapsHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex min-h-12 items-center justify-center gap-base rounded-md bg-primary px-gutter font-body text-button text-on-primary transition-colors hover:bg-primary-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Buka di Google Maps
            <ArrowIcon />
          </a>
        </div>

        <a
          href={contactInformation.mapsHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Buka lokasi Arriyadh Studio di Google Maps"
          className="group relative block aspect-[16/10] overflow-hidden border border-outline-variant bg-surface-container-low focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <Image
            src="/images/home/about/workshop-map.png"
            alt="Peta lokasi workshop Arriyadh Studio di Subang"
            fill
            sizes="(min-width: 1024px) 55vw, 100vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
          />

          <div className="absolute inset-x-0 bottom-0 bg-primary/45 px-gutter py-3 text-on-primary backdrop-blur-[2px]">
            <div className="flex items-center justify-between gap-gutter">
              <div>
                <p className="font-heading text-heading-xs">
                  Arriyadh Studio
                </p>

                <p className="mt-1 font-body text-body-sm text-on-primary/70">
                  Kalijati, Subang
                </p>
              </div>

              <span className="inline-flex items-center gap-base font-body text-button">
                Lihat Lokasi
                <span className="transition-transform duration-200 group-hover:translate-x-1">
                  <ArrowIcon />
                </span>
              </span>
            </div>
          </div>
        </a>
      </div>
    </Reveal>
  </Container>
</section>

      {/* PORTFOLIO */}
      <section
        id="portofolio"
        aria-labelledby="portfolio-title"
        className="scroll-mt-20 bg-surface-white py-section-gap md:py-24"
      >
        <Container>
          <Reveal>
            <div className="text-center">
              <p className="font-body text-label-md uppercase text-secondary">
                Karya Kami
              </p>

              <h2
                id="portfolio-title"
                className="mt-base font-heading text-heading-lg text-primary sm:text-heading-strong"
              >
                Portofolio
              </h2>

              <p className="mx-auto mt-base max-w-2xl font-body text-body-md text-on-surface-variant">
                Beberapa hasil produksi Arriyadh Studio untuk berbagai kebutuhan
                pelanggan.
              </p>

            </div>
          </Reveal>

          <Reveal delay={100} className="mt-12">
        <div className="grid grid-flow-dense grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
              {portfolioImages.map((image, index) => {
                const featured = index % 8 === 0;

                return (
                  <figure
                    key={image.src}
                    className={`group relative overflow-hidden bg-surface-container-low ${
                      featured
                        ? "col-span-2 aspect-[2/1]"
                        : "aspect-square"
                    }`}
                  >
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      sizes={
                        featured
                          ? "(min-width: 1024px) 50vw, (min-width: 768px) 66vw, 100vw"
                          : "(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                      }
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.035]"
                    />

                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-primary/0 transition-colors duration-300 group-hover:bg-primary/10"
                    />
                  </figure>
                );
              })}
            </div>
          </Reveal>
        </Container>
      </section>

      <PublicCta />
    </main>
  );
}