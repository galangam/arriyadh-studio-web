import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ServiceOrderForm } from "@/app/(public)/layanan/[slug]/pesan/service-order-form";
import { Container } from "@/components/ui/container";
import { getServiceImageFallback } from "@/lib/services/service-image-fallbacks";
import { getActiveServiceBySlug } from "@/lib/services/public-services";

export const metadata: Metadata = {
  title: "Pesan Layanan | Arriyadh Studio",
  description: "Sampaikan kebutuhan layanan custom kepada Arriyadh Studio.",
  robots: { index: false, follow: false },
};

export default async function ServiceOrderPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = await getActiveServiceBySlug(slug);

  if (!service) notFound();

  const imageFallback = getServiceImageFallback(service.slug);
  const serviceImage = service.image_url ?? imageFallback?.src ?? null;
  const serviceImageAlt = service.image_url
    ? service.name
    : (imageFallback?.alt ?? service.name);

  return (
    <main className="bg-surface-container-low py-12 text-on-surface sm:py-16 md:py-section-gap">
      <Container>
        <div className="mx-auto max-w-4xl">
          <Link
            href="/layanan"
            className="font-body text-button text-on-surface-variant underline-offset-4 hover:text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            ← Kembali ke Layanan
          </Link>

          <div className="mt-6 space-y-6">
            <section className="border border-outline-variant bg-surface-white px-6 py-5 sm:px-8 sm:py-6">
              <div
                className={`grid gap-5 sm:items-center ${
                  serviceImage
                    ? "sm:grid-cols-[160px_minmax(0,1fr)] lg:grid-cols-[180px_minmax(0,1fr)_minmax(240px,0.6fr)]"
                    : "sm:grid-cols-[minmax(0,1fr)_minmax(240px,0.6fr)] sm:items-end"
                }`}
              >
                {serviceImage ? (
                  <div className="relative aspect-[16/7] overflow-hidden rounded-md bg-surface-container-low sm:aspect-square">
                    <Image
                      src={serviceImage}
                      alt={serviceImageAlt}
                      fill
                      unoptimized={serviceImage.startsWith("http")}
                      sizes="(min-width: 1024px) 180px, (min-width: 640px) 160px, calc(100vw - 80px)"
                      className="object-cover object-center"
                    />
                  </div>
                ) : null}

                <div>
                  <p className="font-body text-label-md uppercase text-secondary">
                    Layanan Dipilih
                  </p>
                  <h1 className="mt-2 font-heading text-heading-lg text-primary">
                    {service.name}
                  </h1>
                  {service.description ? (
                    <p className="mt-2 max-w-2xl font-body text-body-sm text-on-surface-variant">
                      {service.description}
                    </p>
                  ) : null}
                </div>

                <div
                  className={`border-t border-outline-variant pt-4 ${
                    serviceImage
                      ? "sm:col-span-2 lg:col-span-1 lg:border-l lg:border-t-0 lg:pt-0 lg:pl-6"
                      : "sm:border-l sm:border-t-0 sm:pt-0 sm:pl-6"
                  }`}
                >
                  <h2 className="font-heading text-heading-sm text-primary">
                    Setelah Pesanan Dikirim
                  </h2>
                  <p className="mt-2 font-body text-body-sm text-on-surface-variant">
                    Admin akan meninjau kebutuhan Anda dan menentukan harga.
                    Pembayaran belum diperlukan pada tahap ini.
                  </p>
                </div>
              </div>
            </section>

            <section className="border border-outline-variant bg-surface-white p-6 sm:p-8 md:p-10">
              <h2 className="font-heading text-heading-md text-primary">
                Formulir Pesanan
              </h2>
              <p className="mt-2 font-body text-body-md text-on-surface-variant">
                Isi informasi pemesan dan rincian kebutuhan layanan Anda.
              </p>
              <div className="mt-8">
                <ServiceOrderForm
                  serviceId={service.id}
                  serviceSlug={service.slug}
                  serviceFlow={service.flow}
                />
              </div>
            </section>
          </div>
        </div>
      </Container>
    </main>
  );
}
