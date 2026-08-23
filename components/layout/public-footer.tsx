import Image from "next/image";
import Link from "next/link";

const quickServices = [
  { label: "Sablon Kaos", href: "/layanan#sablon" },
  { label: "Pembuatan Kemeja / PDH", href: "/layanan#kemeja" },
  { label: "Bikin Jersey Olahraga", href: "/layanan#jersey" },
  { label: "Kebutuhan Custom Lainnya", href: "/layanan#lainnya" },
  { label: "Jasa Permak Pakaian", href: "/layanan#permak" },
];

const informationLinks = [
  { label: "Tentang Kami", href: "/tentang-kami" },
  { label: "Lacak Status Pesanan", href: "/lacak-pesanan" },
  { label: "Syarat & Ketentuan", href: "/syarat-ketentuan" },
  { label: "Kebijakan Privasi", href: "/kebijakan-privasi" },
];

const contactInformation = {
  address:
    "Jl. Moch Idris, Dusun Cibodas, Kec. Kalijati, Kabupaten Subang, Jawa Barat, Indonesia",
  phone: "+62 812-1471-9630",
  phoneHref: "tel:+6281214719630",
  email: "ananang559@gmail.com",
  emailHref: "mailto:ananang559@gmail.com",
};

const socialLinks = [
  {
    label: "TikTok Arriyadh Studio",
    href: "https://www.tiktok.com/@arriyadh_studio",
    icon: "/icons/social/tiktok.svg",
    width: 30,
    height: 30,
  },
  {
    label: "Instagram Arriyadh Studio",
    href: "https://www.instagram.com/azs_creator422/",
    icon: "/icons/social/instagram.svg",
    width: 18,
    height: 18,
  },
  {
    label: "Facebook Arriyadh Studio",
    href: "https://www.facebook.com/share/1PQa5yvU6z/",
    icon: "/icons/social/facebook.svg",
    width: 20,
    height: 20,
  },
];

export function PublicFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-on-primary">
      <div className="mx-auto w-full px-margin-mobile py-12 md:px-gutter md:py-section-gap lg:px-16 xl:px-24 2xl:px-32">
        <div className="grid gap-12 border-b border-on-primary/20 pb-12 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr] lg:gap-16">
          {/* Brand */}
          <div>
            <Link
              href="/"
              className="inline-block font-heading text-heading-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-on-primary"
            >
              <span className="font-bold">Arriyadh</span>{" "}
              <span className="font-normal">Studio</span>
            </Link>

            <p className="mt-margin-mobile max-w-sm font-body text-body-sm text-on-primary/70">
              Berdiri sejak tahun 2010. Berkomitmen memberikan layanan konveksi
              dan sablon terbaik, dengan mengutamakan kualitas, ketepatan waktu,
              dan kepuasan pelanggan.
            </p>

            <div className="mt-gutter">
              <p className="font-body text-label-md text-on-primary">
                SOSIAL MEDIA
              </p>

              <div className="mt-margin-mobile flex gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="flex size-10 items-center justify-center rounded-lg border border-on-primary/60 text-on-primary transition-colors hover:bg-on-primary/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-primary"
                  >
                    <Image
                      src={social.icon}
                      alt=""
                      width={social.width}
                      height={social.height}
                      aria-hidden="true"
                    />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Layanan Cepat */}
          <div>
            <h2 className="font-body text-body-md font-bold">Layanan Cepat</h2>

            <nav
              aria-label="Layanan cepat"
              className="mt-margin-mobile flex flex-col gap-3"
            >
              {quickServices.map((service) => (
                <Link
                  key={service.href}
                  href={service.href}
                  className="font-body text-body-sm text-on-primary/70 transition-colors hover:text-on-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-primary"
                >
                  {service.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Informasi */}
          <div>
            <h2 className="font-body text-body-md font-bold">Informasi</h2>

            <nav
              aria-label="Informasi footer"
              className="mt-margin-mobile flex flex-col gap-3"
            >
              {informationLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="font-body text-body-sm text-on-primary/70 transition-colors hover:text-on-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-primary"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Hubungi Kami */}
          <div>
            <h2 className="font-body text-body-md font-bold">Hubungi Kami</h2>

            <address className="mt-margin-mobile space-y-4 font-body text-body-sm not-italic text-on-primary/70">
              <p>{contactInformation.address}</p>

              <p>
                <a
                  href={contactInformation.phoneHref}
                  className="transition-colors hover:text-on-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-primary"
                >
                  {contactInformation.phone}
                </a>
              </p>

              <p>
                <a
                  href={contactInformation.emailHref}
                  className="transition-colors hover:text-on-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-primary"
                >
                  {contactInformation.email}
                </a>
              </p>
            </address>
          </div>
        </div>

        <p className="pt-gutter font-body text-body-sm text-on-primary/60">
          © {currentYear} Arriyadh Studio. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
