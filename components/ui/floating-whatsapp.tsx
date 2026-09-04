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
    <>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Hubungi Arriyadh Studio melalui WhatsApp"
        className="fixed right-4 bottom-5 z-50 flex items-center gap-2 focus-visible:rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary sm:right-7 sm:bottom-7 sm:gap-2.5"
      >
        <span className="relative rounded-lg bg-surface-white px-3 py-2 font-body text-xs leading-4 font-semibold whitespace-nowrap text-primary shadow-md sm:px-4 sm:py-2.5 sm:text-body-sm">
          <span className="sm:hidden">Konsultasi via WhatsApp</span>
          <span className="hidden sm:inline">Konsultasi via WhatsApp</span>

          <span
            aria-hidden="true"
            className="absolute top-1/2 -right-2 -translate-y-1/2 border-y-[6px] border-l-[8px] border-y-transparent border-l-surface-white"
          />
        </span>

        <span className="whatsapp-attention flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#46DA51] shadow-md sm:size-14">
          <Image
            src="/icons/social/whatsapp.svg"
            alt=""
            width={56}
            height={56}
            aria-hidden="true"
            className="size-full object-cover"
          />
        </span>
      </a>

      <style>{`
        @keyframes whatsapp-attention {
          0%, 10%, 100% {
            transform: rotate(0deg) scale(1);
          }

          2.5%, 7.5% {
            transform: rotate(-4deg) scale(1.02);
          }

          5% {
            transform: rotate(4deg) scale(1.02);
          }
        }

        .whatsapp-attention {
          animation: whatsapp-attention 6s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .whatsapp-attention {
            animation: none;
          }
        }
      `}</style>
    </>
  );
}
