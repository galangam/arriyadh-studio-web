import Image from "next/image";

import { getSiteSettings } from "@/lib/content/site-settings";
import { arriyadhWhatsappNumber, createWhatsappUrl } from "@/lib/whatsapp";

export async function FloatingWhatsapp() {
  const settings = await getSiteSettings();
  const whatsappNumber = settings.whatsapp ?? arriyadhWhatsappNumber;
  const whatsappUrl = createWhatsappUrl(
    whatsappNumber,
    "Halo Arriyadh Studio, saya ingin berkonsultasi.",
  );

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Hubungi Arriyadh Studio melalui WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex min-h-12 items-center gap-3 rounded-full border border-outline-variant bg-surface-white px-3 py-2.5 shadow-lg transition-all duration-200 hover:-translate-y-1 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
     <Image
  src="/icons/social/whatsapp.svg"
  alt=""
  width={36}
  height={36}
  aria-hidden="true"
  className="size-9 object-contain"
/>

      <span className="hidden pr-2 text-left sm:block">
        <span className="block font-body text-[10px] uppercase tracking-label text-secondary">
          WhatsApp
        </span>

        <span className="block font-body text-body-sm font-semibold text-primary">
          {settings.phone ?? whatsappNumber}
        </span>
      </span>
    </a>
  );
}
