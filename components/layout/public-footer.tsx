import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/ui/container";
import { getSiteSettings } from "@/lib/content/site-settings";

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

const socialLinkDefinitions = [
  {
    key: "tiktok_url",
    label: "TikTok",
    icon: "/icons/social/tiktok.svg",
    width: 30,
    height: 30,
  },
  {
    key: "instagram_url",
    label: "Instagram",
    icon: "/icons/social/instagram.svg",
    width: 18,
    height: 18,
  },
  {
    key: "facebook_url",
    label: "Facebook",
    icon: "/icons/social/facebook.svg",
    width: 20,
    height: 20,
  },
] as const;

export async function PublicFooter() {
  const settings = await getSiteSettings();
  const currentYear = new Date().getFullYear();
  const socialLinks = socialLinkDefinitions.flatMap((social) => {
    const href = settings[social.key];
    return href ? [{ ...social, href }] : [];
  });
  const phoneHref = settings.phone
    ? `tel:${settings.phone.replace(/[^+\d]/g, "")}`
    : null;

  return (
    <footer className="bg-primary text-on-primary">
      <Container className="py-12 md:py-16">
        <div className="grid gap-10 border-b border-on-primary/20 pb-10 sm:grid-cols-2 lg:grid-cols-[1.35fr_0.9fr_0.9fr_1.15fr] lg:gap-10 xl:gap-14">
          {/* Brand */}
          <div>
            <Link
              href="/"
              className="inline-block font-heading text-heading-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-on-primary"
            >
              <span className="font-bold">{settings.business_name}</span>
            </Link>

            <p className="mt-margin-mobile max-w-sm font-body text-body-sm text-on-primary/70">
              Berdiri sejak tahun 2010. Berkomitmen memberikan layanan konveksi
              dan sablon terbaik, dengan mengutamakan kualitas, ketepatan waktu,
              dan kepuasan pelanggan.
            </p>

            <div className="mt-5">
              <p className="font-body text-label-md text-on-primary">
                SOSIAL MEDIA
              </p>

              <div className="mt-margin-mobile flex gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.key}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${social.label} ${settings.business_name}`}
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
              className="mt-margin-mobile flex flex-col gap-2.5"
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
              className="mt-margin-mobile flex flex-col gap-2.5"
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

            <address className="mt-margin-mobile space-y-3 font-body text-body-sm not-italic text-on-primary/70">
              {settings.address ? <p>{settings.address}</p> : null}

              {settings.operating_hours ? <p>{settings.operating_hours}</p> : null}

              {settings.phone && phoneHref ? <p>
                <a
                  href={phoneHref}
                  className="transition-colors hover:text-on-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-primary"
                >
                  {settings.phone}
                </a>
              </p> : null}

              {settings.email ? <p>
                <a
                  href={`mailto:${settings.email}`}
                  className="transition-colors hover:text-on-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-primary"
                >
                  {settings.email}
                </a>
              </p> : null}
            </address>
          </div>
        </div>

        <p className="pt-5 font-body text-body-sm text-on-primary/60">
          © {currentYear} {settings.business_name}. Seluruh hak dilindungi.
        </p>
      </Container>
    </footer>
  );
}
