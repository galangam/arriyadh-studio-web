"use client";

import { FormEvent, useState } from "react";

function SearchIcon() {
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
      <circle cx="11" cy="11" r="6" />
      <path d="m16 16 4 4" />
    </svg>
  );
}

export function OrderTrackingForm() {
  const [orderCode, setOrderCode] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Real tracking akan dihubungkan ke backend pada tahap berikutnya.
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <label htmlFor="order-code" className="sr-only">
        Nomor Pesanan
      </label>

      <div className="flex min-h-16 w-full items-stretch rounded-lg border border-outline-variant bg-surface-white p-1.5 shadow-sm transition-colors focus-within:border-outline">
        <div className="flex min-w-0 flex-1 items-center gap-4 px-4 sm:px-5">
          <span
            aria-hidden="true"
            className="shrink-0 text-on-surface-variant"
          >
            <SearchIcon />
          </span>

          <input
            id="order-code"
            name="orderCode"
            type="text"
            value={orderCode}
            onChange={(event) => setOrderCode(event.target.value)}
            placeholder="Masukkan Nomor Pesanan Anda (Contoh: AR-2024001)"
            autoComplete="off"
            className="min-w-0 flex-1 bg-transparent font-body text-body-md text-on-surface outline-none placeholder:text-on-surface-variant/65"
          />
        </div>

        <button
          type="submit"
          className="inline-flex min-w-36 shrink-0 items-center justify-center rounded-md bg-primary px-6 font-body text-button text-on-primary transition-colors hover:bg-primary-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:min-w-40"
        >
          Cari Pesanan
        </button>
      </div>
    </form>
  );
}