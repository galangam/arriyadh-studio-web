"use client";

import { FormEvent, useActionState, useRef, useState } from "react";

import {
  submitPayment,
  type PaymentSubmissionState,
} from "@/app/(public)/pembayaran/[token]/actions";
import { TransferAccount } from "@/app/(public)/pembayaran/[token]/transfer-account";

const initialState: PaymentSubmissionState = { error: null };
const maxProofSize = 5 * 1024 * 1024;
const allowedProofTypes = ["image/jpeg", "image/png", "image/webp"];
const rupiahFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

type PaymentSubmissionFormProps = {
  token: string;
  orderKind: "service" | "product";
  siteAddress: string;
  paymentAmount: number;
};

export function PaymentSubmissionForm({
  token,
  orderKind,
  siteAddress,
  paymentAmount,
}: PaymentSubmissionFormProps) {
  const submitPaymentForToken = submitPayment.bind(null, token);
  const [state, formAction, isPending] = useActionState(
    submitPaymentForToken,
    initialState,
  );
  const isProduct = orderKind === "product";
  const [method, setMethod] = useState<"transfer" | "cod" | null>(
    isProduct ? "transfer" : null,
  );
  const [clientError, setClientError] = useState<string | null>(null);
  const [proofFileName, setProofFileName] = useState<string | null>(null);
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
      {isProduct ? (
        <>
          <input type="hidden" name="paymentMethod" value="transfer" />
          <section aria-labelledby="product-payment-method">
            <h3
              id="product-payment-method"
              className="font-body text-label-md font-semibold text-primary"
            >
              Metode Pembayaran
            </h3>
            <div className="mt-3 rounded-md border border-primary bg-surface-container-low p-4 ring-1 ring-primary">
              <p className="font-body text-body-md font-semibold text-primary">
                Transfer Bank BRI
              </p>
              <p className="mt-1 font-body text-body-sm text-on-surface-variant">
                Bukti pembayaran akan diperiksa admin.
              </p>
            </div>
          </section>
        </>
      ) : (
        <fieldset disabled={isPending} className="space-y-3">
          <legend className="font-body text-label-md font-semibold text-primary">
            Pilih Metode Pembayaran
          </legend>

          <label className="flex cursor-pointer items-start gap-3 rounded-md border border-outline-variant p-4 transition-colors has-[:checked]:border-primary has-[:checked]:bg-surface-container-low has-[:checked]:font-semibold has-[:checked]:ring-1 has-[:checked]:ring-primary focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary">
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
                Transfer Bank BRI
              </span>
              <span className="mt-1 block font-body text-body-sm text-on-surface-variant">
                Bukti pembayaran DP akan diperiksa admin.
              </span>
            </span>
          </label>

          <label className="flex cursor-pointer items-start gap-3 rounded-md border border-outline-variant p-4 transition-colors has-[:checked]:border-primary has-[:checked]:bg-surface-container-low has-[:checked]:font-semibold has-[:checked]:ring-1 has-[:checked]:ring-primary focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary">
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
                Pembayaran DP dilakukan di tempat sesuai konfirmasi admin.
              </span>
            </span>
          </label>
        </fieldset>
      )}

      {method === "transfer" && (
        <section
          aria-labelledby="transfer-instructions-heading"
          className="space-y-5 border-t border-outline-variant pt-6"
        >
          <h3
            id="transfer-instructions-heading"
            className="font-heading text-heading-sm text-primary"
          >
            Instruksi Transfer
          </h3>
          <p className="font-body text-body-sm text-on-surface-variant">
            {isProduct
              ? "Transfer total pembayaran ke rekening BRI berikut, lalu unggah bukti pembayaran."
              : "Transfer DP sesuai jumlah yang ditampilkan ke rekening BRI berikut, lalu unggah bukti pembayaran DP."}
          </p>
          <TransferAccount />
          <div className="border-y border-outline-variant bg-surface-container-low px-4 py-4 sm:px-5">
            <p className="font-body text-label-md font-semibold uppercase tracking-label text-secondary">
              {isProduct
                ? "Jumlah yang Harus Dibayar"
                : "DP yang Harus Dibayar"}
            </p>
            <p className="mt-1 break-words font-heading text-heading-md text-primary sm:text-heading-lg">
              {rupiahFormatter.format(paymentAmount)}
            </p>
          </div>
          <div className="rounded-md border border-outline-variant bg-surface-container-low p-4 sm:p-5">
            <label
              htmlFor="payment-proof"
              className="block font-body text-label-md font-semibold text-primary"
            >
              {isProduct
                ? "Unggah Bukti Pembayaran"
                : "Unggah Bukti Pembayaran DP"}
            </label>
            <p className="mt-1 font-body text-body-sm text-on-surface-variant">
              Pilih gambar bukti transfer dari perangkat Anda.
            </p>
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
                const file = event.target.files?.[0];
                setProofFileName(file?.name ?? null);
                setClientError(validateProof(file));
              }}
              className="mt-4 block w-full rounded-md border border-outline-variant bg-surface-white p-2 font-body text-body-sm text-on-surface file:mr-4 file:rounded-default file:border-0 file:bg-primary file:px-4 file:py-2 file:text-button file:text-on-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60"
            />
            {proofFileName ? (
              <p className="mt-3 break-all font-body text-body-sm font-semibold text-primary">
                File dipilih: {proofFileName}
              </p>
            ) : null}
            <p
              id="payment-proof-help"
              className="mt-3 font-body text-body-sm text-on-surface-variant"
            >
              JPG, PNG, atau WebP. Maksimal 5 MB.
            </p>
            <p className="mt-1 font-body text-body-sm text-on-surface-variant">
              Setelah dikirim, bukti pembayaran tetap menunggu verifikasi admin.
            </p>
          </div>
        </section>
      )}

      {method === "cod" ? (
        <section
          aria-labelledby="cod-payment-heading"
          className="rounded-md border border-outline-variant bg-surface-container-low p-5 sm:p-6"
        >
          <h3
            id="cod-payment-heading"
            className="font-heading text-heading-sm text-primary"
          >
            Pembayaran di Tempat (COD)
          </h3>
          <p className="mt-2 font-body text-body-sm text-on-surface-variant">
            Pembayaran DP dilakukan di tempat setelah pesanan dikonfirmasi
            admin. Anda tidak perlu mengunggah bukti transfer.
          </p>
          {siteAddress ? (
            <div className="mt-4 border-t border-outline-variant pt-4">
              <p className="font-body text-label-md font-semibold text-primary">
                Lokasi Arriyadh Studio
              </p>
              <address className="mt-1 font-body text-body-sm not-italic text-on-surface-variant">
                {siteAddress}
              </address>
            </div>
          ) : null}
        </section>
      ) : null}

      <p className="font-body text-body-sm text-on-surface-variant">
        {isProduct
          ? "Pesanan akan menunggu verifikasi admin setelah bukti pembayaran dikirim."
          : "Metode pembayaran tidak dapat diubah setelah dikirim."}
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
        {isPending
          ? "Mengirim..."
          : isProduct
            ? "Kirim Bukti Pembayaran"
            : method === "transfer"
              ? "Kirim Bukti Pembayaran DP"
              : "Konfirmasi Metode COD"}
      </button>
    </form>
  );
}
