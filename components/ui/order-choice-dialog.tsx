"use client";

import { useId, useRef } from "react";

type OrderChoiceDialogProps = { className?: string; label?: string };

const orderChoices = [
  {
    index: "01",
    title: "Layanan Custom",
    description:
      "Untuk konveksi, sablon, jersey, sweater, kemeja, atau permak.",
    supportingText: "Harga ditentukan setelah pesanan ditinjau admin",
    href: "/layanan",
    external: false,
  },
  {
    index: "02",
    title: "Produk Ready-Stock",
    description: "Untuk produk yang tersedia dengan harga tetap.",
    supportingText: "Langsung pilih produk, ukuran, dan jumlah",
    href: "/produk",
    external: false,
  },
];

export function OrderChoiceDialog({
  className = "",
  label = "Pesan Sekarang",
}: OrderChoiceDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const closeDialog = () => dialogRef.current?.close();

  return (
    <>
      <button
        type="button"
        className={className}
        onClick={() => dialogRef.current?.showModal()}
      >
        {label}
      </button>
      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="arriyadh-order-dialog m-auto w-[calc(100%-2rem)] max-w-lg rounded-xl border border-outline-variant bg-surface-white p-0 text-on-surface shadow-lg"
        onClick={(event) => {
          if (event.target === event.currentTarget) closeDialog();
        }}
      >
        <div className="px-gutter pb-gutter pt-7 sm:px-8 sm:pb-8 sm:pt-8">
          <div className="flex items-start justify-between gap-gutter">
            <div className="max-w-sm">
              <h2
                id={titleId}
                className="font-heading text-heading-md text-primary"
              >
                Pilih Jenis Pesanan
              </h2>
              <p
                id={descriptionId}
                className="mt-base font-body text-body-sm text-on-surface-variant"
              >
                Tentukan cara pemesanan yang sesuai dengan kebutuhan Anda.
              </p>
            </div>
            <button
              type="button"
              aria-label="Tutup dialog"
              className="-mr-1 -mt-1 inline-flex size-8 shrink-0 items-center justify-center rounded-default text-on-surface-variant transition-colors duration-150 hover:bg-surface-container-low hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              onClick={closeDialog}
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="size-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
              >
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          </div>

          <div className="mt-8 divide-y divide-outline-variant border-y border-outline-variant">
            {orderChoices.map((choice) => (
              <a
                key={choice.index}
                href={choice.href}
                target={choice.external ? "_blank" : undefined}
                rel={choice.external ? "noopener noreferrer" : undefined}
                className="group relative grid min-h-40 grid-cols-[2rem_1fr_auto] gap-margin-mobile overflow-hidden px-base py-gutter transition-colors duration-200 ease-out hover:bg-surface-container-low focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:grid-cols-[2.5rem_1fr_auto] sm:gap-gutter sm:px-margin-mobile"
                onClick={closeDialog}
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-y-0 left-0 w-0.5 origin-center scale-y-0 bg-primary transition-transform duration-200 ease-out group-hover:scale-y-100"
                />
                <span className="pt-1 font-body text-label-md text-secondary">
                  {choice.index}
                </span>
                <span>
                  <span className="block font-heading text-heading-xs text-on-surface transition-colors duration-200 group-hover:text-primary">
                    {choice.title}
                  </span>
                  <span className="mt-base block font-body text-body-sm text-on-surface-variant">
                    {choice.description}
                  </span>
                  <span className="mt-3 block font-body text-12 font-medium text-secondary">
                    {choice.supportingText}
                  </span>
                </span>
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="mt-1 size-5 shrink-0 text-secondary transition duration-200 ease-out group-hover:translate-x-1 group-hover:text-primary"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </a>
            ))}
          </div>
        </div>
      </dialog>

      <style jsx global>{`
        .arriyadh-order-dialog {
          opacity: 0;
          transform: translateY(8px) scale(0.98);
          transition:
            opacity 200ms ease-out,
            transform 200ms ease-out,
            overlay 200ms ease-out allow-discrete,
            display 200ms ease-out allow-discrete;
        }
        .arriyadh-order-dialog[open] {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
        .arriyadh-order-dialog::backdrop {
          background-color: color-mix(
            in srgb,
            var(--color-primary) 60%,
            transparent
          );
          opacity: 0;
          transition:
            opacity 200ms ease-out,
            overlay 200ms ease-out allow-discrete,
            display 200ms ease-out allow-discrete;
        }
        .arriyadh-order-dialog[open]::backdrop {
          opacity: 1;
        }
        @starting-style {
          .arriyadh-order-dialog[open] {
            opacity: 0;
            transform: translateY(8px) scale(0.98);
          }
          .arriyadh-order-dialog[open]::backdrop {
            opacity: 0;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .arriyadh-order-dialog,
          .arriyadh-order-dialog::backdrop {
            transition: none;
          }
        }
      `}</style>
    </>
  );
}
