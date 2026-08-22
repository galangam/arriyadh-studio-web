"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useState } from "react";

import { Container } from "@/components/ui/container";
import { OrderChoiceDialog } from "@/components/ui/order-choice-dialog";

const navigation = [
  { label: "Beranda", href: "/" },
  { label: "Tentang Kami", href: "/tentang-kami" },
  { label: "Layanan", href: "/layanan" },
  { label: "Produk", href: "/produk" },
  { label: "Lacak Pesanan", href: "/lacak-pesanan" },
];

const orderButtonClass =
  "inline-flex min-h-10 items-center justify-center rounded-md bg-primary px-6 py-2.5 font-body text-button text-on-primary transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:translate-y-0";

export function PublicNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const mobileMenuId = useId();

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsMenuOpen(false);
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  return (
    <header className="border-b border-outline-variant bg-surface-white">
     <div className="mx-auto flex min-h-20 w-full items-center justify-between gap-gutter px-margin-mobile md:px-gutter lg:px-12 xl:px-16 2xl:px-20">
      <Link
  href="/"
  aria-label="Arriyadh Studio — Beranda"
  className="flex shrink-0 items-center gap-3 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
  onClick={() => setIsMenuOpen(false)}
>
  <Image
    src="/branding/arriyadh-logo.png"
    alt=""
    width={44}
    height={44}
    priority
    aria-hidden="true"
    className="h-11 w-11 object-contain"
  />

  <span className="font-heading text-[20px] leading-none text-primary">
    <span className="font-bold">Arriyadh</span>{" "}
    <span className="font-normal">Studio</span>
  </span>
</Link> 

        <nav
          aria-label="Navigasi utama"
          className="hidden items-center gap-6 lg:flex"
        >
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="font-body text-button text-on-surface-variant transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:block">
          <OrderChoiceDialog className={orderButtonClass} />
        </div>

        <button
          type="button"
          aria-label={isMenuOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
          aria-expanded={isMenuOpen}
          aria-controls={mobileMenuId}
          className="inline-flex size-11 items-center justify-center rounded-lg border border-outline-variant text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary lg:hidden"
          onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="size-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            {isMenuOpen ? (
              <path d="M6 6l12 12M18 6 6 18" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </div>

      <div
        id={mobileMenuId}
        hidden={!isMenuOpen}
        className="border-t border-outline-variant bg-surface-white lg:hidden"
      >
        <Container className="py-margin-mobile">
          <nav aria-label="Navigasi seluler" className="flex flex-col">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="border-b border-outline-variant py-3 font-body text-button text-on-surface-variant focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <OrderChoiceDialog
            className={`${orderButtonClass} mt-margin-mobile w-full`}
          />
        </Container>
      </div>
    </header>
  );
}
