import { Container } from "@/components/ui/container";
import { OrderChoiceDialog } from "@/components/ui/order-choice-dialog";

export function PublicCta() {
  return (
    <section
      aria-labelledby="public-cta-title"
      className="bg-surface py-section-gap"
    >
      <Container>
        <div className="flex flex-col items-start justify-between gap-gutter rounded-xl border border-outline-variant bg-surface-white p-gutter sm:p-10 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <h2
              id="public-cta-title"
              className="font-heading text-heading-lg text-primary"
            >
              Siap Pesan Seragam atau Sablon Impian Anda?
            </h2>
            <p className="mt-base font-body text-body-md text-on-surface-variant">
              Dari konsultasi bahan sampai produk jadi, kami siap bantu wujudkan
              pesanan Anda.
            </p>
          </div>
          <OrderChoiceDialog className="w-full shrink-0 rounded-lg bg-primary px-gutter py-3 font-body text-button text-on-primary transition-colors hover:bg-primary-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:w-auto" />
        </div>
      </Container>
    </section>
  );
}
