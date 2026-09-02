import type { Metadata } from "next";

import { OrderTrackingForm } from "@/components/sections/order-tracking-form";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { getSiteSettings } from "@/lib/content/site-settings";
import { createWhatsappUrl } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Lacak Pesanan | Arriyadh Studio",
  description:
    "Halaman pelacakan status pesanan Arriyadh Studio menggunakan kode pesanan.",
};

const trackingSteps = [
  {
    title: "Masukkan Kode Pesanan",
    description:
      "Gunakan kode pesanan yang Anda dapatkan setelah membuat pesanan atau dari informasi pesanan yang dikirimkan oleh admin.",
  },
  {
    title: "Klik Cari",
    description:
      "Pastikan kode pesanan yang Anda masukkan benar dan tekan tombol 'Cari Pesanan' untuk memulai proses.",
  },
  {
    title: "Lihat Status",
    description:
      "Pantau status dan tahapan pengerjaan pesanan berdasarkan pembaruan dari admin.",
  },
] as const;

const faqs = [
  {
    question: "Di mana saya bisa menemukan kode pesanan?",
    answer:
      "Kode pesanan ditampilkan setelah pesanan berhasil dibuat. Anda juga dapat menemukannya pada informasi pesanan yang dikirimkan oleh admin. Simpan kode tersebut untuk melacak perkembangan pesanan.",
  },
  {
    question: "Berapa lama status diperbarui?",
    answer:
      "Status pesanan akan diperbarui oleh admin sesuai perkembangan pengerjaan. Perubahan terbaru akan tampil di halaman pelacakan setelah status pesanan diperbarui.",
  },
  {
    question: "Kode pesanan tidak ditemukan?",
    answer:
      "Periksa kembali kode pesanan yang Anda masukkan. Jika kode tetap tidak ditemukan, hubungi admin melalui WhatsApp untuk mendapatkan bantuan.",
  },
] as const;

function ChevronDownIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export default async function LacakPesananPage() {
  const settings = await getSiteSettings();
  const whatsappHelpUrl = createWhatsappUrl(
    settings.whatsapp,
    "Halo Arriyadh Studio, saya memerlukan bantuan untuk melacak pesanan.",
  );

  return (
    <main className="overflow-hidden bg-surface-white text-on-surface">
      {/* HERO + TRACKING */}
      <section
        aria-labelledby="page-title"
       className="bg-surface-container-low py-16 md:py-20"
      >
        <Container>
  <Reveal>
    <div className="mx-auto max-w-5xl text-center">
      <h1
        id="page-title"
        className="font-heading text-heading-strong text-primary sm:text-display-md"
      >
        Lacak Pesanan
      </h1>

      <p className="mx-auto mt-margin-mobile max-w-2xl font-body text-body-md leading-relaxed text-on-surface-variant sm:text-body-lg">
        Masukkan kode pesanan Anda untuk melihat informasi perkembangan
        pengerjaan.
      </p>

      <div className="mx-auto mt-10 max-w-4xl">
        <OrderTrackingForm whatsappNumber={settings.whatsapp} />
      </div>

      <p className="mx-auto mt-margin-mobile max-w-2xl font-body text-body-sm text-on-surface-variant">
        Kode pesanan dapat ditemukan setelah Anda berhasil membuat pesanan atau
        pada informasi pesanan yang dikirimkan oleh admin.
      </p>
    </div>
  </Reveal>
</Container>
      </section>

    {/* CARA MELACAK */}
<section
  aria-labelledby="how-to-track-title"
  className="bg-surface-white py-section-gap md:py-24"
>
  <Container>
    <Reveal>
      <div className="text-center">
        <h2
          id="how-to-track-title"
          className="font-heading text-heading-lg text-primary"
        >
          Cara Melacak
        </h2>

        <div
          aria-hidden="true"
          className="mx-auto mt-margin-mobile h-[3px] w-14 bg-primary"
        />
      </div>
    </Reveal>

    <div className="mt-14 grid gap-12 md:grid-cols-3 md:gap-10 lg:mt-16 lg:gap-16">
      {trackingSteps.map((step, index) => (
        <Reveal key={step.title} delay={index * 80}>
          <article className="mx-auto flex max-w-sm flex-col items-center text-center">
            <span
              aria-hidden="true"
              className="font-heading text-display-md font-bold text-primary/45"
            >
              {String(index + 1).padStart(2, "0")}
            </span>

            <h3 className="mt-margin-mobile font-heading text-heading-sm text-primary">
              {step.title}
            </h3>

            <p className="mt-margin-mobile font-body text-body-md leading-relaxed text-on-surface-variant">
              {step.description}
            </p>
          </article>
        </Reveal>
      ))}
    </div>
  </Container>
</section>


{/* FAQ */}
<section
  aria-labelledby="tracking-faq-title"
  className="bg-surface-container-low py-16 md:py-20"
>
  <Container>
    <Reveal>
      <div className="mx-auto max-w-4xl">
        <h2
          id="tracking-faq-title"
          className="text-center font-heading text-heading-lg text-primary"
        >
          Pertanyaan Umum Pelacakan
        </h2>

        <div className="mt-8 space-y-3">
          {faqs.map((faq) => (
            <details
              key={faq.question}
              className="group border border-outline-variant bg-surface-white"
            >
              <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-gutter px-gutter py-margin-mobile font-heading text-heading-xs text-primary transition-colors hover:bg-surface-container-low focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary [&::-webkit-details-marker]:hidden">
                <span>{faq.question}</span>

                <span className="shrink-0 transition-transform duration-200 group-open:rotate-180">
                  <ChevronDownIcon />
                </span>
              </summary>

              <div className="border-t border-outline-variant px-gutter py-margin-mobile">
                <p className="max-w-3xl font-body text-body-sm leading-relaxed text-on-surface-variant">
                  {faq.answer}
                </p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </Reveal>
  </Container>
</section>



      {/* HELP */}
     <section
  aria-labelledby="tracking-help-title"
  className="bg-surface-white py-16 md:py-20"
      >
        <Container>
          <Reveal>
            <div className="mx-auto max-w-3xl text-center">
              <h2
                id="tracking-help-title"
                className="font-heading text-heading-md text-primary"
              >
                Butuh Bantuan Lebih Lanjut?
              </h2>

              <p className="mx-auto mt-margin-mobile max-w-xl font-body text-body-md leading-relaxed text-on-surface-variant">
                Tim kami siap membantu jika Anda mengalami kesulitan dalam
                proses pelacakan pesanan.
              </p>

              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <a
                  href={whatsappHelpUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                 className="inline-flex min-h-12 items-center justify-center gap-base rounded-md bg-primary px-gutter font-body text-button text-on-primary transition-colors hover:bg-primary-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  Hubungi WhatsApp
                </a>

                {settings.email ? (
                  <a
                    href={`mailto:${settings.email}`}
                    className="inline-flex min-h-12 items-center justify-center rounded-md border border-outline-variant bg-surface-white px-gutter font-body text-button text-primary transition-colors hover:bg-surface-container-low focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  >
                    Pusat Bantuan
                  </a>
                ) : null}
              </div>
            </div>
          </Reveal>
        </Container>
      </section>
    </main>
  );
}
