"use client";

import { useActionState } from "react";

import {
  lookupTrackingOrder,
  type TrackingActionState,
} from "@/app/(public)/lacak-pesanan/actions";
import { OrderTrackingResult } from "@/components/sections/order-tracking-result";

const initialState: TrackingActionState = { status: "idle", order: null };

const errorMessages = {
  invalid_input:
    "Format kode pesanan tidak valid. Gunakan format ARS-YYMMDD-XXXXXXXXXXXX.",
  not_found: "Pesanan tidak ditemukan. Periksa kembali kode pesanan Anda.",
  unavailable:
    "Pelacakan pesanan sedang tidak dapat digunakan. Silakan coba lagi.",
} as const;

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

export function OrderTrackingForm({
  whatsappNumber,
}: {
  whatsappNumber: string;
}) {
  const [state, formAction, isPending] = useActionState(
    lookupTrackingOrder,
    initialState,
  );
  const hasError =
    !isPending &&
    (state.status === "invalid_input" ||
      state.status === "not_found" ||
      state.status === "unavailable");
  const messageId = hasError ? "tracking-form-message" : undefined;

  return (
    <div className="w-full">
      <form action={formAction} aria-describedby={messageId}>
        <label htmlFor="order-code" className="sr-only">
          Kode Pesanan
        </label>

        <div className="flex w-full flex-col gap-2 rounded-lg border border-outline-variant bg-surface-white p-1.5 shadow-sm transition-colors focus-within:border-outline sm:min-h-16 sm:flex-row sm:items-stretch sm:gap-0">
          <div className="flex min-h-12 min-w-0 flex-1 items-center gap-4 px-4 sm:px-5">
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
              required
              maxLength={23}
              autoCapitalize="characters"
              autoComplete="off"
              aria-invalid={hasError}
              aria-describedby={messageId}
              placeholder="ARS-YYMMDD-XXXXXXXXXXXX"
              className="min-w-0 flex-1 bg-transparent font-body text-body-md uppercase text-on-surface outline-none placeholder:normal-case placeholder:text-on-surface-variant/65"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-md bg-primary px-6 font-body text-button text-on-primary transition-colors hover:bg-primary-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60 sm:min-w-40"
          >
            {isPending ? "Mencari..." : "Cari Pesanan"}
          </button>
        </div>

        <div aria-live="polite" aria-atomic="true" className="min-h-7">
          {hasError ? (
            <p
              id="tracking-form-message"
              role="alert"
              className="mt-3 font-body text-body-sm text-error"
            >
              {errorMessages[state.status]}
            </p>
          ) : null}
        </div>
      </form>

      {!isPending && state.status === "success" ? (
        <OrderTrackingResult
          order={state.order}
          whatsappNumber={whatsappNumber}
        />
      ) : null}
    </div>
  );
}
