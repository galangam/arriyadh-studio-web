"use client";

import { FormEvent, useActionState, useRef, useState } from "react";

import {
  submitPayment,
  type PaymentSubmissionState,
} from "@/app/(public)/pembayaran/[token]/actions";

const initialState: PaymentSubmissionState = { error: null };
const maxProofSize = 5 * 1024 * 1024;
const allowedProofTypes = ["image/jpeg", "image/png", "image/webp"];

export function PaymentSubmissionForm({ token }: { token: string }) {
  const submitPaymentForToken = submitPayment.bind(null, token);
  const [state, formAction, isPending] = useActionState(
    submitPaymentForToken,
    initialState,
  );
  const [method, setMethod] = useState<"transfer" | "cod" | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);
  const proofInputRef = useRef<HTMLInputElement>(null);
  const displayedError = clientError ?? state.error;

  function validateProof(file: File | undefined) {
    if (!file || file.size === 0) {
      return "Bukti pembayaran wajib dipilih.";
    }

    if (!allowedProofTypes.includes(file.type)) {
      return "Format bukti pembayaran tidak didukung.";
    }

    if (file.size > maxProofSize) {
      return "Ukuran bukti pembayaran maksimal 5 MB.";
    }

    return null;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    setClientError(null);

    if (method === "transfer") {
      const error = validateProof(proofInputRef.current?.files?.[0]);

      if (error) {
        event.preventDefault();
        setClientError(error);
      }
    }
  }

  return (
    <form action={formAction} onSubmit={handleSubmit} className="mt-8 space-y-6">
      <fieldset disabled={isPending} className="space-y-3">
        <legend className="font-body text-label-md font-semibold text-primary">
          Pilih Metode Pembayaran
        </legend>

        <label className="flex cursor-pointer items-start gap-3 rounded-md border border-outline-variant p-4 transition-colors has-[:checked]:border-primary has-[:checked]:bg-surface-container-low focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary">
          <input
            type="radio"
            name="paymentMethod"
            value="transfer"
            required
            checked={method === "transfer"}
            onChange={() => {
              setMethod("transfer");
              setClientError(null);
            }}
            className="mt-1 size-4 accent-primary"
          />
          <span>
            <span className="block font-body text-body-md font-semibold text-primary">
              Transfer
            </span>
            <span className="mt-1 block font-body text-body-sm text-on-surface-variant">
              Unggah bukti pembayaran setelah melakukan transfer.
            </span>
          </span>
        </label>

        <label className="flex cursor-pointer items-start gap-3 rounded-md border border-outline-variant p-4 transition-colors has-[:checked]:border-primary has-[:checked]:bg-surface-container-low focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary">
          <input
            type="radio"
            name="paymentMethod"
            value="cod"
            required
            checked={method === "cod"}
            onChange={() => {
              setMethod("cod");
              setClientError(null);
            }}
            className="mt-1 size-4 accent-primary"
          />
          <span>
            <span className="block font-body text-body-md font-semibold text-primary">
              COD
            </span>
            <span className="mt-1 block font-body text-body-sm text-on-surface-variant">
              Pilih pembayaran COD tanpa mengunggah bukti transfer.
            </span>
          </span>
        </label>
      </fieldset>

      {method === "transfer" && (
        <div className="space-y-4 border-l-2 border-primary pl-4">
          <p className="font-body text-body-sm text-on-surface-variant">
            Informasi rekening tujuan belum tersedia pada halaman ini. Pastikan
            tujuan transfer telah dikonfirmasi melalui informasi resmi Arriyadh
            Studio sebelum mengirim pembayaran.
          </p>
          <div className="space-y-2">
            <label
              htmlFor="payment-proof"
              className="block font-body text-label-md font-semibold text-primary"
            >
              Bukti Pembayaran
            </label>
            <input
              ref={proofInputRef}
              id="payment-proof"
              name="paymentProof"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              required
              disabled={isPending}
              aria-invalid={Boolean(displayedError)}
              aria-describedby="payment-proof-help payment-submission-error"
              onChange={(event) => {
                setClientError(validateProof(event.target.files?.[0]));
              }}
              className="block w-full rounded-md border border-outline-variant bg-surface-white p-2 font-body text-body-sm text-on-surface file:mr-4 file:rounded-default file:border-0 file:bg-primary file:px-4 file:py-2 file:text-button file:text-on-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60"
            />
            <p
              id="payment-proof-help"
              className="font-body text-body-sm text-on-surface-variant"
            >
              JPG, PNG, atau WebP. Maksimal 5 MB.
            </p>
          </div>
        </div>
      )}

      <p className="font-body text-body-sm text-on-surface-variant">
        Metode pembayaran tidak dapat diubah setelah dikirim.
      </p>

      <div aria-live="polite" aria-atomic="true" className="min-h-6">
        {displayedError ? (
          <p
            id="payment-submission-error"
            role="alert"
            className="font-body text-body-sm font-medium text-error"
          >
            {displayedError}
          </p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex min-h-12 w-full items-center justify-center rounded-md bg-primary px-6 font-body text-button text-on-primary transition-colors hover:bg-primary-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {isPending ? "Mengirim..." : "Kirim Pembayaran"}
      </button>
    </form>
  );
}
