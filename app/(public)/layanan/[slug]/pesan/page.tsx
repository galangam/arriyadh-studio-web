import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ServiceOrderForm } from "@/app/(public)/layanan/[slug]/pesan/service-order-form";
import { Container } from "@/components/ui/container";
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

  return (
    <main className="bg-surface-container-low py-12 text-on-surface sm:py-16 md:py-section-gap">
      <Container>
        <div className="mx-auto max-w-5xl">
          <Link
            href="/layanan"
            className="font-body text-button text-on-surface-variant underline-offset-4 hover:text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            ← Kembali ke Layanan
          </Link>

          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-start">
            <section className="border border-outline-variant bg-surface-white p-6 sm:p-8">
              <p className="font-body text-label-md uppercase text-secondary">
                Layanan Dipilih
              </p>
              <h1 className="mt-2 font-heading text-heading-lg text-primary">
                {service.name}
              </h1>
              {service.description ? (
                <p className="mt-3 font-body text-body-md text-on-surface-variant">
                  {service.description}
                </p>
              ) : null}
              <div className="mt-6 border-t border-outline-variant pt-5">
                <h2 className="font-heading text-heading-sm text-primary">
                  Setelah Pesanan Dikirim
                </h2>
                <p className="mt-2 font-body text-body-sm text-on-surface-variant">
                  Admin akan meninjau kebutuhan Anda dan menentukan harga.
                  Pembayaran belum diperlukan pada tahap ini.
                </p>
              </div>
            </section>

            <section className="border border-outline-variant bg-surface-white p-6 sm:p-8">
              <h2 className="font-heading text-heading-md text-primary">
                Detail Pesanan
              </h2>
              <p className="mt-2 font-body text-body-md text-on-surface-variant">
                Lengkapi kebutuhan layanan dan informasi yang dapat dihubungi.
              </p>
              <div className="mt-6">
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
