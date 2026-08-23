import type { Metadata } from "next";

import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";

export const metadata: Metadata = {
  title: "Syarat & Ketentuan | Arriyadh Studio",
  description:
    "Syarat dan ketentuan penggunaan layanan dan pemesanan Arriyadh Studio.",
};

const sections = [
  { number: "01", title: "Ketentuan Umum", id: "ketentuan-umum" },
  { number: "02", title: "Pemesanan", id: "pemesanan" },
  {
    number: "03",
    title: "Informasi Produk & Layanan",
    id: "produk-layanan",
  },
  {
    number: "04",
    title: "Harga dan Pembayaran",
    id: "harga-pembayaran",
  },
  { number: "05", title: "Proses Produksi", id: "proses-produksi" },
  {
    number: "06",
    title: "Perubahan atau Pembatalan Pesanan",
    id: "perubahan-pesanan",
  },
  {
    number: "07",
    title: "Pengiriman / Pengambilan Pesanan",
    id: "pengiriman",
  },
  {
    number: "08",
    title: "Keluhan dan Penyelesaian",
    id: "keluhan",
  },
  {
    number: "09",
    title: "Hak Kekayaan Intelektual",
    id: "hak-kekayaan-intelektual",
  },
  {
    number: "10",
    title: "Perubahan Syarat & Ketentuan",
    id: "perubahan-ketentuan",
  },
  { number: "11", title: "Kontak", id: "kontak" },
] as const;

const whatsappUrl =
  "https://wa.me/6281214719630?text=Halo%20Arriyadh%20Studio%2C%20saya%20ingin%20bertanya%20mengenai%20syarat%20dan%20ketentuan.";

const sectionClass =
  "scroll-mt-24 border-b border-outline-variant py-10 first:pt-0 last:border-b-0 last:pb-0 md:py-12";
const bodyClass =
  "mt-margin-mobile space-y-margin-mobile font-body text-body-relaxed text-on-surface-variant";

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

export default function SyaratKetentuanPage() {
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
                Syarat &amp; Ketentuan
              </h1>
              <p className="mx-auto mt-margin-mobile max-w-2xl font-body text-body-md text-on-surface-variant sm:text-body-lg">
                Ketentuan penggunaan layanan, pemesanan, pembayaran, produksi,
                dan layanan Arriyadh Studio.
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
        aria-label="Isi syarat dan ketentuan"
        className="bg-surface-white py-section-gap md:py-24"
      >
        <Container>
          <Reveal>
            <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[15rem_minmax(0,1fr)] lg:items-start lg:gap-20">
              <nav
                aria-label="Daftar isi syarat dan ketentuan"
                className="border-y border-outline-variant py-gutter lg:sticky lg:top-gutter"
              >
                <p className="font-body text-label-md uppercase text-secondary">
                  Daftar Isi
                </p>
                <ol className="mt-margin-mobile grid gap-1 sm:grid-cols-2 lg:grid-cols-1">
                  {sections.map((section) => (
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
                <section id="ketentuan-umum" className={sectionClass}>
                  <SectionHeading number="01" title="Ketentuan Umum" />
                  <div className={`${bodyClass} pl-14 sm:pl-18`}>
                    <p>
                      Syarat dan ketentuan ini menjadi informasi umum bagi
                      pelanggan yang menggunakan layanan, membeli produk, atau
                      melakukan pemesanan melalui Arriyadh Studio.
                    </p>
                    <p>
                      Pelanggan diharapkan membaca informasi layanan dan
                      memastikan kebutuhan pesanan telah dipahami sebelum
                      melanjutkan proses pemesanan.
                    </p>
                  </div>
                </section>

                <section id="pemesanan" className={sectionClass}>
                  <SectionHeading number="02" title="Pemesanan" />
                  <div className={`${bodyClass} pl-14 sm:pl-18`}>
                    <p>
                      Pemesanan dilakukan dengan menyampaikan informasi yang
                      diperlukan sesuai jenis produk atau layanan yang dipilih.
                      Pelanggan perlu memeriksa kembali informasi yang
                      diberikan, termasuk jenis pesanan, ukuran, jumlah,
                      desain, serta detail kontak.
                    </p>
                    <p>
                      Pesanan custom memerlukan peninjauan admin sebelum harga
                      dan kelanjutan proses dapat dikonfirmasi. Komunikasi
                      mengenai pesanan dapat dilakukan melalui kanal kontak
                      yang tersedia.
                    </p>
                  </div>
                </section>

                <section id="produk-layanan" className={sectionClass}>
                  <SectionHeading
                    number="03"
                    title="Informasi Produk & Layanan"
                  />
                  <div className={`${bodyClass} pl-14 sm:pl-18`}>
                    <p>
                      Informasi produk dan layanan ditampilkan untuk membantu
                      pelanggan menentukan pilihan. Ketersediaan produk
                      ready-stock, termasuk pilihan warna atau motif,
                      mengikuti stok yang tersedia saat pemesanan.
                    </p>
                    <p>
                      Detail layanan custom disesuaikan dengan kebutuhan yang
                      disampaikan dan hasil peninjauan admin. Perbedaan tampilan
                      warna pada layar atau karakter bahan dapat dibicarakan
                      saat konfirmasi detail pesanan.
                    </p>
                  </div>
                </section>

                <section id="harga-pembayaran" className={sectionClass}>
                  <SectionHeading number="04" title="Harga dan Pembayaran" />
                  <div className={`${bodyClass} pl-14 sm:pl-18`}>
                    <p>
                      Harga disampaikan sesuai produk, layanan, jumlah, bahan,
                      desain, dan kebutuhan pesanan. Produk ready-stock memiliki
                      harga yang diinformasikan pada produk, sedangkan harga
                      pesanan custom ditetapkan setelah peninjauan admin.
                    </p>
                    <p>
                      Informasi metode dan tahapan pembayaran disampaikan dalam
                      proses pemesanan. Pelanggan sebaiknya memastikan nominal
                      dan tujuan pembayaran sesuai informasi yang diterima
                      sebelum melakukan pembayaran.
                    </p>
                  </div>
                </section>

                <section id="proses-produksi" className={sectionClass}>
                  <SectionHeading number="05" title="Proses Produksi" />
                  <div className={`${bodyClass} pl-14 sm:pl-18`}>
                    <p>
                      Produksi dimulai berdasarkan detail pesanan yang telah
                      dibahas dan disepakati. Tahapan pengerjaan dapat berbeda
                      sesuai jenis layanan, bahan, desain, jumlah, dan kebutuhan
                      pesanan.
                    </p>
                    <p>
                      Pelanggan dapat mengikuti informasi perkembangan pesanan
                      melalui saluran yang disediakan. Perkiraan penyelesaian,
                      apabila disampaikan, mengikuti kondisi dan lingkup
                      pengerjaan pesanan terkait.
                    </p>
                  </div>
                </section>

                <section id="perubahan-pesanan" className={sectionClass}>
                  <SectionHeading
                    number="06"
                    title="Perubahan atau Pembatalan Pesanan"
                  />
                  <div className={`${bodyClass} pl-14 sm:pl-18`}>
                    <p>
                      Permintaan perubahan atau pembatalan perlu disampaikan
                      secepatnya melalui kanal kontak Arriyadh Studio. Setiap
                      permintaan akan ditinjau berdasarkan status pesanan dan
                      proses yang telah berjalan.
                    </p>
                    <p>
                      Perubahan setelah produksi dimulai dapat memerlukan
                      peninjauan ulang terhadap bahan, biaya, dan proses
                      pengerjaan. Kelanjutan permintaan akan dikomunikasikan
                      kepada pelanggan terlebih dahulu.
                    </p>
                  </div>
                </section>

                <section id="pengiriman" className={sectionClass}>
                  <SectionHeading
                    number="07"
                    title="Pengiriman / Pengambilan Pesanan"
                  />
                  <div className={`${bodyClass} pl-14 sm:pl-18`}>
                    <p>
                      Cara penyerahan pesanan, baik melalui pengiriman maupun
                      pengambilan, dibicarakan sesuai pilihan yang tersedia
                      untuk pesanan tersebut. Pelanggan perlu memastikan nama,
                      nomor kontak, dan informasi tujuan telah disampaikan
                      dengan benar.
                    </p>
                    <p>
                      Informasi mengenai kesiapan pesanan dan penyerahannya akan
                      disampaikan melalui kanal kontak yang digunakan dalam
                      proses pemesanan.
                    </p>
                  </div>
                </section>

                <section id="keluhan" className={sectionClass}>
                  <SectionHeading number="08" title="Keluhan dan Penyelesaian" />
                  <div className={`${bodyClass} pl-14 sm:pl-18`}>
                    <p>
                      Apabila terdapat pertanyaan atau ketidaksesuaian,
                      pelanggan dapat menghubungi Arriyadh Studio dengan
                      menyertakan kode pesanan dan informasi yang membantu
                      peninjauan.
                    </p>
                    <p>
                      Setiap laporan akan ditinjau berdasarkan detail pesanan
                      dan informasi yang tersedia. Tindak lanjut akan
                      dikomunikasikan melalui kanal kontak pelanggan.
                    </p>
                  </div>
                </section>

                <section
                  id="hak-kekayaan-intelektual"
                  className={sectionClass}
                >
                  <SectionHeading
                    number="09"
                    title="Hak Kekayaan Intelektual"
                  />
                  <div className={`${bodyClass} pl-14 sm:pl-18`}>
                    <p>
                      Pelanggan sebaiknya memastikan desain, logo, gambar, atau
                      materi lain yang diberikan untuk pengerjaan dapat
                      digunakan untuk keperluan pesanan tersebut.
                    </p>
                    <p>
                      Materi milik Arriyadh Studio yang ditampilkan pada situs,
                      termasuk identitas visual dan konten, tidak mengubah
                      kepemilikan materi yang secara sah dimiliki pihak lain.
                    </p>
                  </div>
                </section>

                <section id="perubahan-ketentuan" className={sectionClass}>
                  <SectionHeading
                    number="10"
                    title="Perubahan Syarat & Ketentuan"
                  />
                  <div className={`${bodyClass} pl-14 sm:pl-18`}>
                    <p>
                      Informasi pada halaman ini dapat diperbarui agar tetap
                      sesuai dengan layanan dan proses pemesanan Arriyadh
                      Studio. Versi yang tersedia pada halaman ini menjadi
                      rujukan informasi terbaru bagi pengunjung situs.
                    </p>
                  </div>
                </section>

                <section id="kontak" className={sectionClass}>
                  <SectionHeading number="11" title="Kontak" />
                  <div className={`${bodyClass} pl-14 sm:pl-18`}>
                    <p>
                      Untuk pertanyaan mengenai syarat dan ketentuan atau
                      informasi pesanan, hubungi Arriyadh Studio melalui:
                    </p>
                    <address className="space-y-base not-italic">
                      <p>
                        Telepon: {" "}
                        <a
                          href="tel:+6281214719630"
                          className="font-semibold text-primary underline decoration-outline underline-offset-4 hover:decoration-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                        >
                          +62 812-1471-9630
                        </a>
                      </p>
                      <p>
                        Email: {" "}
                        <a
                          href="mailto:ananang559@gmail.com"
                          className="font-semibold text-primary underline decoration-outline underline-offset-4 hover:decoration-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                        >
                          ananang559@gmail.com
                        </a>
                      </p>
                      <p>
                        WhatsApp: {" "}
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-primary underline decoration-outline underline-offset-4 hover:decoration-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
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
