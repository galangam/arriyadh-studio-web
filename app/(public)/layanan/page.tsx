import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { PublicCta } from "@/components/layout/public-cta";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import {
  getActiveServices,
  type PublicService,
} from "@/lib/services/public-services";
import { getSiteSettings } from "@/lib/content/site-settings";
import { createWhatsappUrl } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Layanan | Arriyadh Studio",
  description:
    "Layanan konveksi, sablon, pakaian custom, dan permak Arriyadh Studio untuk berbagai kebutuhan.",
};

type ServicePresentation = {
  slug: string;
  detail: string;
  useCases: readonly string[];
  image?: string;
  imageAlt?: string | null;
  visualKicker?: string | null;
  visualTitle?: string | null;
};

const servicePresentations: readonly ServicePresentation[] = [
  {
    slug: "permak",
    detail:
      "Layanan permak ditujukan untuk pakaian yang perlu diperkecil, diperbesar, diperbaiki, atau dirapikan kembali.",
    useCases: [
      "Penyesuaian ukuran pakaian",
      "Perbaikan bagian pakaian",
      "Perapian potongan dan detail",
    ],
    image: "/images/home/permak.jpg",
    imageAlt: "Proses pengerjaan permak pakaian",
    visualKicker: "Penyesuaian · Perbaikan · Perapian",
    visualTitle: "Pakaian kembali nyaman digunakan.",
  },
  {
    slug: "sablon",
    detail:
      "Pengerjaan sablon disesuaikan dengan desain dan kebutuhan pakaian yang diajukan oleh pelanggan.",
    useCases: [
      "Komunitas dan organisasi",
      "Acara dan kegiatan",
      "Usaha dan kebutuhan personal",
    ],
    image: "/images/home/portfolio-5.jpeg",
    imageAlt: "Proses pengerjaan pakaian di workshop Arriyadh Studio",
    visualKicker: null,
    visualTitle: null,
  },
  {
    slug: "kaos",
    detail:
      "Kaos custom dapat digunakan untuk berbagai kebutuhan bersama, identitas kegiatan, maupun produk usaha.",
    useCases: [
      "Acara dan komunitas",
      "Organisasi dan perusahaan",
      "Merchandise dan retail",
    ],
    image: "/images/home/portfolio-18.jpeg",
    imageAlt: "Kaos custom hasil produksi Arriyadh Studio",
    visualKicker: null,
    visualTitle: null,
  },
  {
    slug: "kemeja",
    detail:
      "Model dan kebutuhan kemeja dibahas berdasarkan fungsi pakaian serta identitas kelompok atau usaha.",
    useCases: [
      "Seragam dan kemeja kantor",
      "Kemeja bergaya PDH",
      "Pakaian organisasi",
    ],
    image: "/images/home/portfolio-23.jpeg",
    imageAlt: "Kemeja seragam custom hasil produksi Arriyadh Studio",
    visualKicker: null,
    visualTitle: null,
  },
  {
    slug: "jersey",
    detail:
      "Desain jersey dapat disesuaikan dengan identitas tim atau kegiatan yang akan menggunakannya.",
    useCases: ["Tim olahraga", "Komunitas", "Turnamen dan kegiatan olahraga"],
    image: "/images/home/portfolio-10.jpeg",
    imageAlt: "Jersey olahraga custom hasil produksi Arriyadh Studio",
    visualKicker: null,
    visualTitle: null,
  },
  {
    slug: "lainnya",
    detail:
      "Kebutuhan dapat dikonsultasikan terlebih dahulu agar jenis pengerjaan dan hasil akhir dapat disesuaikan dengan kebutuhan Anda.",
    useCases: [
      "Desain kebutuhan promosi",
      "Banner & media cetak",
      "Stiker",
      "Undangan",
      "Kebutuhan custom lainnya",
    ],
    image: "/images/home/portfolio-20.jpeg",
    imageAlt: null,
    visualKicker: "Desain · Cetak · Kebutuhan Custom",
    visualTitle: "Media pendukung sesuai kebutuhan Anda.",
  },
] as const;

const orderSteps = [
  {
    title: "Pilih Layanan",
    description: "Pilih layanan yang sesuai dengan kebutuhan Anda.",
  },
  {
    title: "Isi Detail Pesanan",
    description: "Sampaikan detail kebutuhan pesanan.",
  },
  {
    title: "Admin Meninjau",
    description: "Admin memeriksa detail dan kebutuhan pesanan.",
  },
  {
    title: "Harga Diberikan",
    description: "Informasi harga diberikan setelah peninjauan.",
  },
  {
    title: "Lanjut Pemesanan",
    description: "Lanjutkan proses pemesanan sesuai informasi yang diberikan.",
  },
] as const;

const presentationBySlug = new Map(
  servicePresentations.map((presentation) => [presentation.slug, presentation]),
);

type PresentedService = PublicService & ServicePresentation;

function presentService(service: PublicService): PresentedService {
  const presentation = presentationBySlug.get(service.slug);

  return {
    ...service,
    slug: service.slug,
    detail:
      presentation?.detail ??
      "Sampaikan detail kebutuhan Anda agar admin dapat meninjau pengerjaan dan menentukan harga.",
    useCases: presentation?.useCases ?? ["Kebutuhan custom"],
    image: service.image_url ?? presentation?.image,
    imageAlt: presentation?.imageAlt ?? service.name,
    visualKicker: presentation?.visualKicker ?? "Layanan Custom",
    visualTitle: presentation?.visualTitle ?? service.name,
  };
}

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

export default async function LayananPage() {
  const [activeServices, settings] = await Promise.all([
    getActiveServices(),
    getSiteSettings(),
  ]);
  const services = activeServices.map(presentService);
  const serviceOrderUrl = createWhatsappUrl(
    settings.whatsapp,
    "Halo Arriyadh Studio, saya ingin berkonsultasi tentang layanan custom.",
  );
  return (
    <main className="overflow-hidden bg-surface-white text-on-surface">
      <section
        aria-labelledby="page-title"
        className="bg-surface-container-low pt-16 md:pt-section-gap"
      >
        <Container>
          <Reveal>
            <div className="mx-auto max-w-3xl text-center">
              <h1
                id="page-title"
                className="font-heading text-heading-strong text-primary sm:text-display-md"
              >
                Layanan Kami
              </h1>
              <p className="mx-auto mt-margin-mobile max-w-2xl font-body text-body-md text-on-surface-variant sm:text-body-lg">
                Solusi konveksi, sablon, pakaian custom, dan permak untuk
                berbagai kebutuhan.
              </p>
              <div
                aria-hidden="true"
                className="mx-auto mt-gutter h-px w-16 bg-outline"
              />
            </div>
          </Reveal>
        </Container>

        <Reveal className="mt-12 border-t border-outline-variant bg-surface-white">
          <Container>
            <nav
              aria-label="Daftar layanan"
              className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              <div className="flex min-w-max justify-start lg:justify-center">
                {services.map((service, index) => (
                  <Link
                    key={service.id}
                    href={"#" + service.slug}
                    className="group flex min-h-16 items-center gap-base border-r border-outline-variant px-gutter font-body text-button text-primary transition-colors first:border-l hover:bg-surface-container-low focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary md:min-h-18 md:px-8"
                  >
                    <span className="text-label-md text-secondary transition-colors group-hover:text-primary">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span>{service.name}</span>
                  </Link>
                ))}
              </div>
            </nav>
          </Container>
        </Reveal>
      </section>

      <div aria-label="Detail layanan">
        {services.map((service, index) => {
          const visualOnRight = index % 2 === 1;

          return (
            <section
              key={service.id}
              id={service.slug}
              aria-labelledby={service.slug + "-title"}
              className={`scroll-mt-20 py-section-gap md:py-24 ${
                index % 2 === 0 ? "bg-surface-white" : "bg-surface"
              }`}
            >
              <Container>
                <Reveal>
                  <div className="group grid items-center gap-10 lg:grid-cols-2 lg:gap-16 xl:gap-24">
                    <div
                      className={`relative aspect-[4/3] overflow-hidden bg-surface-container md:aspect-[16/10] lg:aspect-[5/4] ${
                        visualOnRight ? "lg:order-2" : "lg:order-1"
                      }`}
                    >
                      {service.image ? (
                        <>
                          <Image
                            src={service.image}
                            alt={service.imageAlt ?? ""}
                            fill
                            sizes="(min-width: 1024px) 50vw, 100vw"
                            unoptimized={service.image.startsWith("http")}
                            className="object-cover transition-[transform,filter] duration-500 ease-out group-hover:scale-[1.02] group-hover:brightness-95 motion-reduce:transition-none"
                          />
                          <div
                            aria-hidden="true"
                            className="absolute inset-0 bg-primary/0 transition-colors duration-300 group-hover:bg-primary/5"
                          />
                          <span className="absolute bottom-gutter left-gutter font-heading text-display-xl text-on-primary/80 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                        </>
                      ) : (
                        <div className="flex h-full flex-col justify-between bg-primary p-gutter text-on-primary transition-colors duration-300 group-hover:bg-primary-container sm:p-10">
                          <span className="font-heading text-display-xl text-on-primary/30 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none sm:text-[88px] sm:leading-none">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <div>
                            <p className="font-body text-label-md uppercase text-on-primary/60">
                              {service.visualKicker}
                            </p>
                            <p className="mt-base font-heading text-heading-md text-on-primary">
                              {service.visualTitle}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div
                      className={`max-w-xl ${
                        visualOnRight
                          ? "lg:order-1 lg:justify-self-end"
                          : "lg:order-2"
                      }`}
                    >
                      <p className="font-body text-label-md uppercase text-secondary">
                        Layanan {String(index + 1).padStart(2, "0")}
                      </p>
                      <h2
                        id={service.slug + "-title"}
                        className="mt-base font-heading text-heading-strong text-primary sm:text-display-md"
                      >
                        {service.name}
                      </h2>
                      <p className="mt-gutter font-body text-body-lg text-on-surface">
                        {service.description}
                      </p>
                      <p className="mt-margin-mobile font-body text-body-md text-on-surface-variant">
                        {service.detail}
                      </p>

                      <div className="mt-8 bg-surface-container-low p-gutter">
                        <h3 className="font-body text-label-md uppercase text-secondary">
                          Cocok untuk
                        </h3>
                        <ul className="mt-margin-mobile grid gap-x-gutter gap-y-3 font-body text-body-sm text-on-surface-variant sm:grid-cols-2">
                          {service.useCases.map((useCase) => (
                            <li key={useCase} className="flex gap-3">
                              <span
                                aria-hidden="true"
                                className="mt-[0.55rem] size-1 shrink-0 rounded-full bg-primary"
                              />
                              <span>{useCase}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-8 flex flex-wrap gap-3">
                        <Link
                          href={"/layanan/" + service.slug + "/pesan"}
                          className="inline-flex min-h-12 items-center justify-center gap-base rounded-md bg-primary px-gutter font-body text-button text-on-primary transition-colors hover:bg-primary-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                        >
                          Pesan Layanan
                          <ArrowIcon />
                        </Link>
                        <a
                          href={serviceOrderUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex min-h-12 items-center justify-center rounded-md border border-outline px-gutter font-body text-button text-primary transition-colors hover:bg-surface-container-low focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                        >
                          Konsultasi WhatsApp
                        </a>
                      </div>
                    </div>
                  </div>
                </Reveal>
              </Container>
            </section>
          );
        })}
      </div>

      <section
        aria-labelledby="custom-order-title"
        className="bg-surface-white py-section-gap md:py-24"
      >
        <Container>
          <Reveal>
            <div className="mx-auto max-w-3xl text-center">
              <p className="font-body text-label-md uppercase text-secondary">
                Proses Pemesanan
              </p>
              <h2
                id="custom-order-title"
                className="mt-base font-heading text-heading-lg text-primary"
              >
                Alur Pemesanan Layanan Custom
              </h2>
              <p className="mx-auto mt-gutter max-w-2xl font-body text-body-md text-on-surface-variant">
                Setiap kebutuhan custom ditinjau terlebih dahulu agar detail
                pesanan dan harga dapat disesuaikan.
              </p>
            </div>

            <ol className="mx-auto mt-12 grid max-w-7xl gap-10 md:grid-cols-5 md:gap-0">
              {orderSteps.map((step, index) => (
                <li
                  key={step.title}
                  className="relative text-center md:border-t md:border-outline-variant md:px-gutter md:pb-0 md:pt-gutter md:text-left md:first:pl-0 md:last:pr-0"
                >
                  <span className="absolute hidden size-base rounded-full bg-primary md:-top-[4.5px] md:left-gutter md:block md:first:left-0" />
                  <p className="font-body text-label-md text-secondary">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-base font-heading text-heading-xs text-primary">
                    {step.title}
                  </h3>
                  <p className="mx-auto mt-base max-w-52 font-body text-body-sm text-on-surface-variant md:mx-0">
                    {step.description}
                  </p>
                </li>
              ))}
            </ol>
          </Reveal>
        </Container>
      </section>

      <PublicCta />
    </main>
  );
}
