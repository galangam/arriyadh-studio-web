import Image from "next/image";

export const whatsappActionClassName =
  "gap-base bg-[#25D366] text-white shadow-sm transition-[background-color,box-shadow] duration-200 hover:bg-[#1EBD5A] hover:shadow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366]";

export function WhatsappActionIcon() {
  return (
    <Image
      src="/icons/social/whatsapp-white.svg"
      alt=""
      width={20}
      height={20}
      aria-hidden="true"
      className="size-5 shrink-0"
    />
  );
}
