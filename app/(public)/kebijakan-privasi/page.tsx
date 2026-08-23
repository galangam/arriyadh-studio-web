import type { Metadata } from "next";

import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";

export const metadata: Metadata = {
  title: "Kebijakan Privasi | Arriyadh Studio",
  description:
    "Kebijakan privasi Arriyadh Studio mengenai penggunaan dan perlindungan informasi pelanggan.",
};

type PrivacySection = {
  number: string;
  title: string;
  id: string;
  paragraphs: readonly string[];
  items?: readonly string[];
};

const privacySections: readonly PrivacySection[] = [
  {
    number: "01",
    title: "Pendahuluan",
    id: "pendahuluan",
    paragraphs: [
      "Kebijakan Privasi ini menjelaskan secara umum bagaimana informasi dapat diterima dan digunakan ketika pelanggan mengakses situs, berkomunikasi, atau menggunakan layanan Arriyadh Studio.",
      "Pelanggan diharapkan memberikan informasi yang sesuai dengan kebutuhan layanan serta menghubungi Arriyadh Studio apabila terdapat pertanyaan mengenai informasi tersebut.",
    ],
  },
  {
    number: "02",
    title: "Informasi yang Dikumpulkan",
    id: "informasi-dikumpulkan",
    paragraphs: [
      "Informasi dapat diberikan langsung oleh pelanggan saat melakukan pemesanan, meminta bantuan, atau berkomunikasi melalui kanal yang tersedia.",
      "Jenis informasi yang diperlukan dapat berbeda sesuai produk, layanan, dan cara penyerahan pesanan.",
    ],
    items: [
      "Nama dan informasi kontak yang diberikan pelanggan.",
      "Detail produk atau layanan, jumlah, ukuran, desain, dan kebutuhan pesanan.",
      "Informasi tujuan pengiriman atau pengambilan apabila diperlukan.",
      "Informasi pendukung lain yang secara sukarela diberikan dalam komunikasi pesanan.",
    ],
  },
  {
    number: "03",
    title: "Cara Informasi Digunakan",
    id: "penggunaan-informasi",
    paragraphs: [
      "Informasi digunakan untuk meninjau dan memproses pesanan, menyampaikan harga atau perkembangan pengerjaan, berkomunikasi dengan pelanggan, serta mendukung penyelesaian layanan.",
      "Informasi juga dapat digunakan untuk menjawab pertanyaan, menangani keluhan, dan memastikan detail pesanan dapat dipahami oleh pihak yang menangani proses terkait.",
    ],
  },
  {
    number: "04",
    title: "Informasi Pemesanan",
    id: "informasi-pemesanan",
    paragraphs: [
      "Informasi pemesanan dapat mencakup kode pesanan, jenis produk atau layanan, kebutuhan produksi, status pengerjaan, pilihan pembayaran, dan informasi penyerahan pesanan.",
      "Pada layanan pelacakan, informasi yang ditampilkan seharusnya dibatasi pada informasi yang diperlukan pelanggan untuk mengikuti perkembangan pesanannya. Pelanggan perlu menjaga kode pesanan dan tidak membagikannya kepada pihak yang tidak berkepentingan.",
    ],
  },
  {
    number: "05",
    title: "Bukti Pembayaran",
    id: "bukti-pembayaran",
    paragraphs: [
      "Pelanggan dapat diminta mengirimkan bukti pembayaran sebagai bagian dari proses verifikasi pembayaran pesanan. Bukti tersebut digunakan untuk membantu mencocokkan pembayaran dengan pesanan terkait.",
      "Pelanggan sebaiknya memastikan gambar yang dikirim dapat dibaca dan tidak memuat informasi lain yang tidak diperlukan untuk verifikasi pesanan.",
    ],
  },
  {
    number: "06",
    title: "Penyimpanan Data",
    id: "penyimpanan-data",
    paragraphs: [
      "Informasi yang berkaitan dengan pelanggan dan pesanan dapat disimpan sesuai kebutuhan pengelolaan pesanan, komunikasi, dan pelayanan Arriyadh Studio.",
      "Lama penyimpanan dapat menyesuaikan jenis informasi serta kebutuhan operasional yang berkaitan. Kebijakan ini tidak menetapkan jangka waktu penyimpanan atau penghapusan otomatis tertentu.",
    ],
  },
  {
    number: "07",
    title: "Pembagian Informasi",
    id: "pembagian-informasi",
    paragraphs: [
      "Akses terhadap informasi pelanggan seharusnya dibatasi sesuai kebutuhan penanganan pesanan dan layanan. Informasi tidak perlu dibagikan di luar kebutuhan tersebut.",
      "Apabila penyelesaian pesanan melibatkan layanan eksternal yang dipilih atau diperlukan, informasi yang relevan dapat digunakan sejauh diperlukan untuk membantu proses tersebut. Layanan eksternal dapat memiliki ketentuan privasinya sendiri.",
    ],
  },
  {
    number: "08",
    title: "Keamanan Informasi",
    id: "keamanan-informasi",
    paragraphs: [
      "Arriyadh Studio berupaya menangani informasi pelanggan secara hati-hati dan membatasi akses berdasarkan kebutuhan operasional.",
      "Tidak ada metode penyimpanan atau komunikasi yang dapat dijamin sepenuhnya bebas risiko. Pelanggan juga disarankan untuk tidak mengirimkan informasi yang tidak diperlukan dan menjaga akses ke kanal komunikasi pribadinya.",
    ],
  },
  {
    number: "09",
    title: "Hak Pengguna",
    id: "hak-pengguna",
    paragraphs: [
      "Pelanggan dapat menghubungi Arriyadh Studio untuk menanyakan informasi yang pernah diberikan, menyampaikan koreksi atas detail pesanan, atau meminta penjelasan mengenai penggunaan informasinya.",
      "Permintaan akan ditinjau berdasarkan informasi yang tersedia, keterkaitannya dengan pesanan, dan kebutuhan operasional yang berlaku.",
    ],
  },
  {
    number: "10",
    title: "Tautan dan Layanan Pihak Ketiga",
    id: "pihak-ketiga",
    paragraphs: [
      "Situs Arriyadh Studio dapat menyediakan tautan menuju layanan eksternal, seperti WhatsApp, media sosial, dan Google Maps. Tautan tersebut disediakan untuk memudahkan komunikasi atau akses informasi.",
      "Ketika pelanggan membuka layanan eksternal, pengelolaan informasi pada layanan tersebut mengikuti kebijakan dan ketentuan penyedianya masing-masing. Pelanggan dapat meninjau kebijakan layanan terkait sebelum menggunakannya.",
    ],
  },
  {
    number: "11",
    title: "Perubahan Kebijakan Privasi",
    id: "perubahan-kebijakan",
    paragraphs: [
      "Kebijakan Privasi ini dapat diperbarui agar tetap sesuai dengan layanan dan proses pengelolaan informasi Arriyadh Studio. Versi yang tersedia pada halaman ini menjadi rujukan informasi terbaru bagi pengunjung situs.",
    ],
  },
] as const;

const navigationSections = [
  ...privacySections.map(({ number, title, id }) => ({ number, title, id })),
  { number: "12", title: "Kontak", id: "kontak" },
] as const;

const whatsappUrl =
  "https://wa.me/6281214719630?text=Halo%20Arriyadh%20Studio%2C%20saya%20ingin%20bertanya%20mengenai%20kebijakan%20privasi.";

const sectionClass =
  "scroll-mt-24 border-b border-outline-variant py-10 first:pt-0 last:border-b-0 last:pb-0 md:py-12";
const bodyClass =
  "mt-margin-mobile space-y-margin-mobile pl-14 font-body text-body-relaxed text-on-surface-variant sm:pl-18";
const contactLinkClass =
  "font-semibold text-primary underline decoration-outline underline-offset-4 hover:decoration-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

function SectionHeading({
  number,
  title,
}: {
  number: string;
  title: string;
}) {
  return (
    <div className="grid grid-cols-[2.5rem_1fr] gap-margin-mobile sm:grid-cols-[3rem_1fr] sm:gap-gutter">
      <span className="pt-1 font-body text-label-md text-secondary">
        {number}
      </span>
      <h2 className="font-heading text-heading-md text-primary">{title}</h2>
    </div>
  );
}

export default function KebijakanPrivasiPage() {
  return (
    <main className="overflow-hidden bg-surface-white text-on-surface">
      <section
        aria-labelledby="page-title"
        className="bg-surface-container-low py-16 md:py-section-gap"
      >
        <Container>
          <Reveal>
            <div className="mx-auto max-w-3xl text-center">
              <h1
                id="page-title"
                className="mt-base font-heading text-heading-strong text-primary sm:text-display-md"
              >
                Kebijakan Privasi
              </h1>
              <p className="mx-auto mt-margin-mobile max-w-2xl font-body text-body-md text-on-surface-variant sm:text-body-lg">
                Informasi mengenai pengumpulan, penggunaan, penyimpanan, dan
                perlindungan data dalam layanan Arriyadh Studio.
              </p>
              <div
                aria-hidden="true"
                className="mx-auto mt-gutter h-px w-16 bg-outline"
              />
            </div>
          </Reveal>
        </Container>
      </section>

      <section
        aria-label="Isi kebijakan privasi"
        className="bg-surface-white py-section-gap md:py-24"
      >
        <Container>
          <Reveal>
            <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[15rem_minmax(0,1fr)] lg:items-start lg:gap-20">
              <nav
                aria-label="Daftar isi kebijakan privasi"
                className="border-y border-outline-variant py-gutter lg:sticky lg:top-gutter"
              >
                <p className="font-body text-label-md uppercase text-secondary">
                  Daftar Isi
                </p>
                <ol className="mt-margin-mobile grid gap-1 sm:grid-cols-2 lg:grid-cols-1">
                  {navigationSections.map((section) => (
                    <li key={section.id}>
                      <a
                        href={`#${section.id}`}
                        className="group grid grid-cols-[2rem_1fr] gap-base py-base font-body text-body-sm text-on-surface-variant transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                      >
                        <span className="text-secondary group-hover:text-primary">
                          {section.number}
                        </span>
                        <span>{section.title}</span>
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>

              <article className="min-w-0 max-w-3xl">
                {privacySections.map((section) => (
                  <section
                    key={section.id}
                    id={section.id}
                    className={sectionClass}
                  >
                    <SectionHeading
                      number={section.number}
                      title={section.title}
                    />
                    <div className={bodyClass}>
                      {section.paragraphs.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}

                      {section.items && (
                        <ul className="space-y-base pl-margin-mobile">
                          {section.items.map((item) => (
                            <li
                              key={item}
                              className="relative pl-margin-mobile before:absolute before:left-0 before:top-[0.7rem] before:size-1 before:rounded-full before:bg-primary"
                            >
                              {item}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </section>
                ))}

                <section id="kontak" className={sectionClass}>
                  <SectionHeading number="12" title="Kontak" />
                  <div className={bodyClass}>
                    <p>
                      Untuk pertanyaan mengenai kebijakan privasi atau
                      informasi pelanggan, hubungi Arriyadh Studio melalui:
                    </p>
                    <address className="space-y-base not-italic">
                      <p>
                        Telepon:{" "}
                        <a href="tel:+6281214719630" className={contactLinkClass}>
                          +62 812-1471-9630
                        </a>
                      </p>
                      <p>
                        Email:{" "}
                        <a
                          href="mailto:ananang559@gmail.com"
                          className={contactLinkClass}
                        >
                          ananang559@gmail.com
                        </a>
                      </p>
                      <p>
                        WhatsApp:{" "}
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={contactLinkClass}
                        >
                          Hubungi Arriyadh Studio
                        </a>
                      </p>
                    </address>
                  </div>
                </section>
              </article>
            </div>
          </Reveal>
        </Container>
      </section>
    </main>
  );
}
