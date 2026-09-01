import type { Metadata } from "next";

import Image from "next/image";
import Link from "next/link";

import { PublicCta } from "@/components/layout/public-cta";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { getAboutContent } from "@/lib/content/about-content";
import { getPublicPortfolio } from "@/lib/content/portfolio";
import { getSiteSettings } from "@/lib/content/site-settings";

export const metadata: Metadata = {
  title: "Tentang Kami | Arriyadh Studio",
  description:
    "Mengenal Arriyadh Studio, jasa konveksi, sablon, dan pakaian custom di Subang sejak 2010.",
};

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

export default async function TentangKamiPage() {
  const [content, settings, portfolio] = await Promise.all([
    getAboutContent(),
    getSiteSettings(),
    getPublicPortfolio(),
  ]);
  const portfolioItems = portfolio.slice(0, 32);
  const historyParagraphs = content.history_body
    .split(/\r?\n\s*\r?\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

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
                {content.page_title}
              </h1>

              <p className="mt-margin-mobile font-body text-body-lg font-medium text-secondary">
                {content.page_subtitle}
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
                  {content.history_title}
                </h2>

                <div className="mt-gutter space-y-margin-mobile font-body text-body-md leading-relaxed text-on-surface-variant">
                  {historyParagraphs.map((paragraph, index) => (
                    <p key={`${index}-${paragraph.slice(0, 32)}`}>
                      {paragraph}
                    </p>
                  ))}
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
        aria-label={
          content.founded_year
            ? `Pengalaman dan keunggulan Arriyadh Studio sejak ${content.founded_year}`
            : "Pengalaman dan keunggulan Arriyadh Studio"
        }
        className="bg-primary py-12 md:py-16"
      >
        <Container>
          <Reveal>
            <div className="grid gap-gutter md:grid-cols-3">
              <article className="flex min-h-44 flex-col items-center justify-center border border-on-primary/35 px-gutter py-8 text-center text-on-primary">
                <HistoryIcon />

                <h2 className="mt-margin-mobile font-heading text-heading-md">
                  {content.strength_1_title}
                </h2>

                <p className="mt-base font-body text-label-sm uppercase tracking-wide text-on-primary/60">
                  {content.strength_1_description}
                </p>
              </article>

              <article className="flex min-h-44 flex-col items-center justify-center border border-on-primary/35 px-gutter py-8 text-center text-on-primary">
                <ShirtIcon />

                <h2 className="mt-margin-mobile font-heading text-heading-md">
                  {content.strength_2_title}
                </h2>

                <p className="mt-base font-body text-label-sm uppercase tracking-wide text-on-primary/60">
                  {content.strength_2_description}
                </p>
              </article>

              <article className="flex min-h-44 flex-col items-center justify-center border border-on-primary/35 px-gutter py-8 text-center text-on-primary">
                <EyeIcon />

                <h2 className="mt-margin-mobile font-heading text-heading-md">
                  {content.strength_3_title}
                </h2>

                <p className="mt-base font-body text-label-sm uppercase tracking-wide text-on-primary/60">
                  {content.strength_3_description}
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
            {content.workshop_title}
          </h2>

          <p className="mt-gutter max-w-lg font-body text-body-md leading-relaxed text-on-surface-variant">
            {content.workshop_description}
          </p>

          <div className="mt-8 space-y-6">
            <div>
              <p className="font-body text-label-md font-bold uppercase text-primary">
                Alamat Lengkap
              </p>

              <p className="mt-base max-w-md font-body text-body-sm leading-relaxed text-on-surface-variant">
                {settings.address}
              </p>
            </div>

            <div>
              <p className="font-body text-label-md font-bold uppercase text-primary">
                Jam Operasional
              </p>

              <p className="mt-base font-body text-body-sm text-on-surface-variant">
                {settings.operating_hours}
              </p>
            </div>
          </div>

          <a
            href={settings.maps_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex min-h-12 items-center justify-center gap-base rounded-md bg-primary px-gutter font-body text-button text-on-primary transition-colors hover:bg-primary-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Buka di Google Maps
            <ArrowIcon />
          </a>
        </div>

        <a
          href={settings.maps_url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Buka lokasi Arriyadh Studio di Google Maps"
          className="group relative block aspect-[16/10] overflow-hidden border border-outline-variant bg-surface-container-low focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {content.workshop_image_url ? (
            <Image
              src={content.workshop_image_url}
              alt="Peta lokasi workshop Arriyadh Studio di Subang"
              fill
              unoptimized={content.workshop_image_url.startsWith("http")}
              sizes="(min-width: 1024px) 55vw, 100vw"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
            />
          ) : null}

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
              {portfolioItems.map((image, index) => {
                const featured = index % 8 === 0;

                return (
                  <figure
                    key={image.id}
                    className={`group relative overflow-hidden bg-surface-container-low ${
                      featured
                        ? "col-span-2 aspect-[2/1]"
                        : "aspect-square"
                    }`}
                  >
                    <Image
                      src={image.image_url}
                      alt={image.alt}
                      fill
                      unoptimized={image.image_url.startsWith("http")}
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
