import Image from "next/image";
import { Reveal } from "@/components/ui/reveal";
import { Container } from "@/components/ui/container";
import { OrderChoiceDialog } from "@/components/ui/order-choice-dialog";

const whatsappUrl =
  "https://wa.me/6281214719630?text=Halo%20Arriyadh%20Studio%2C%20saya%20ingin%20berkonsultasi%20mengenai%20pesanan.";


export function PublicCta() {
  return (
    <section
      aria-labelledby="public-cta-title"
      className="bg-surface pb-24 pt-section-gap md:pb-32"
    >
      <Container>
        <Reveal>
        <div className="relative overflow-hidden rounded-xl bg-primary px-gutter py-12 text-on-primary sm:px-10 lg:grid lg:grid-cols-[minmax(0,1.35fr)_auto] lg:items-end lg:gap-16 lg:px-14 lg:py-14">
          <div>
            <p className="font-body text-label-md uppercase text-on-primary/60">
              Konsultasi &amp; Pemesanan
            </p>

            <h2
              id="public-cta-title"
              className="mt-base max-w-2xl font-heading text-heading-lg text-on-primary sm:text-heading-strong"
            >
              Punya Ide? Kami Bantu Wujudkan.
            </h2>

            <p className="mt-gutter max-w-xl font-body text-body-md text-on-primary/70">
              Konsultasikan kebutuhan konveksi, sablon, seragam, jersey, atau
              permak bersama Arriyadh Studio.
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row lg:mt-0">
            <OrderChoiceDialog className="inline-flex min-h-12 items-center justify-center rounded-md bg-on-primary px-gutter font-body text-button text-primary transition-colors hover:bg-inverse-on-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-primary" />

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center justify-center gap-base rounded-md border border-on-primary/35 px-gutter font-body text-button text-on-primary transition-colors hover:bg-on-primary/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-primary"
            >
             <Image
  src="/icons/social/whatsapp.svg"
  alt=""
  width={20}
  height={20}
  aria-hidden="true"
  className="size-5 object-contain"
/>

Konsultasi WhatsApp
            </a>
          </div>
        </div>
        </Reveal>
      </Container>
    </section>
  );
}
