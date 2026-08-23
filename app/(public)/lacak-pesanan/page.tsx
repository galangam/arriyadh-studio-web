import type { Metadata } from "next";

import { OrderTrackingForm } from "@/components/sections/order-tracking-form";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";

export const metadata: Metadata = {
  title: "Lacak Pesanan | Arriyadh Studio",
  description:
    "Halaman pelacakan status pesanan Arriyadh Studio menggunakan nomor pesanan.",
};

const whatsappHelpUrl =
  "https://wa.me/6281214719630?text=Halo%20Arriyadh%20Studio%2C%20saya%20memerlukan%20bantuan%20untuk%20melacak%20pesanan.";

const trackingSteps = [
  {
    title: "Masukkan ID",
    description:
      "Temukan ID Pesanan pada pesan WhatsApp yang dikirimkan oleh admin.",
  },
  {
    title: "Klik Cari",
    description:
      "Pastikan nomor yang Anda masukkan benar dan tekan tombol 'Cari Pesanan' untuk memulai proses.",
  },
  {
    title: "Lihat Status",
    description:
      "Pantau tahapan produksi mulai dari desain, pemotongan, penjahitan, sablon, hingga pengiriman.",
  },
] as const;

const faqs = [
  {
    question: "Dimana saya bisa menemukan nomor pesanan?",
    answer:
      "Nomor pesanan diberikan melalui informasi pesanan yang dikirimkan oleh admin melalui WhatsApp. Pastikan Anda menyimpan nomor tersebut untuk melakukan pelacakan.",
  },
  {
    question: "Berapa lama status diperbarui?",
    answer:
      "Status pesanan diperbarui mengikuti perkembangan proses pengerjaan. Informasi terbaru akan tersedia setelah tahap pesanan diperbarui oleh admin.",
  },
  {
    question: "Nomor pesanan tidak ditemukan?",
    answer:
      "Periksa kembali nomor pesanan yang Anda masukkan. Jika masih tidak ditemukan, hubungi admin melalui WhatsApp untuk mendapatkan bantuan.",
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

function WhatsAppIcon() {
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
      <path d="M20 11.5a8 8 0 0 1-11.8 7L4 20l1.5-4.1A8 8 0 1 1 20 11.5Z" />
      <path d="M9 8.5c.5 2.4 2.1 4 4.5 5" />
    </svg>
  );
}

export default function LacakPesananPage() {
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
        Masukkan nomor pesanan Anda untuk memantau kemajuan setiap tahap
        pengerjaan secara real-time.
      </p>

      <div className="mx-auto mt-10 max-w-4xl">
        <OrderTrackingForm />
      </div>

      <p className="mx-auto mt-margin-mobile max-w-2xl font-body text-body-sm text-on-surface-variant">
        Layanan pelacakan tersedia untuk semua pesanan sablon, kemeja, dan
        jersey.
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
  className="bg-surface-container-low py-section-gap md:py-24"
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

        <div className="mt-10 space-y-3">
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
  className="bg-surface-white py-section-gap md:py-20"
      >
        <Container>
          <Reveal>
            <div className="mx-auto max-w-3xl text-center">
              <h2
                id="tracking-help-title"
                className="font-heading text-heading-lg text-primary"
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
                  <WhatsAppIcon />
                  Hubungi WhatsApp
                </a>

                <a
                  href={`mailto:ananang559@gmail.com`}
                  className="inline-flex min-h-12 items-center justify-center rounded-md border border-outline-variant bg-surface-white px-gutter font-body text-button text-primary transition-colors hover:bg-surface-container-low focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  Pusat Bantuan
                </a>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>
    </main>
  );
}