"use client";

import { useActionState } from "react";

import {
  confirmCodPayment,
  confirmProductCodOrder,
  createPaymentProofLink,
  verifyTransferPayment,
  type AdminPaymentActionState,
  type PaymentProofLinkState,
} from "@/app/admin/(protected)/pesanan/[id]/actions";

const initialActionState: AdminPaymentActionState = { error: null };
const initialProofState: PaymentProofLinkState = {
  error: null,
  signedUrl: null,
};

export function TransferVerificationControls({ orderId }: { orderId: string }) {
  const [proofState, proofAction, isProofPending] = useActionState(
    createPaymentProofLink.bind(null, orderId),
    initialProofState,
  );
  const [verificationState, verificationAction, isVerificationPending] =
    useActionState(
      verifyTransferPayment.bind(null, orderId),
      initialActionState,
    );

  return (
    <div className="mt-5 space-y-4">
      <form action={proofAction}>
        <button
          type="submit"
          disabled={isProofPending}
          className="inline-flex min-h-10 items-center justify-center rounded-md border border-outline-variant px-4 text-admin-label text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isProofPending ? "Menyiapkan..." : "Lihat Bukti Pembayaran"}
        </button>
      </form>

      <div aria-live="polite" aria-atomic="true">
        {proofState.error ? (
          <p role="alert" className="text-admin-body text-error">
            {proofState.error}
          </p>
        ) : null}
        {proofState.signedUrl ? (
          <a
            href={proofState.signedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex text-admin-label font-semibold text-link-blue underline underline-offset-4 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Buka Bukti Pembayaran
            <span className="sr-only"> di tab baru</span>
          </a>
        ) : null}
      </div>

      <form
        action={verificationAction}
        className="border-t border-outline-variant pt-4"
      >
        <button
          type="submit"
          disabled={isVerificationPending}
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-5 text-admin-label text-on-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isVerificationPending
            ? "Memverifikasi..."
            : "Verifikasi Pembayaran"}
        </button>
        <div aria-live="polite" aria-atomic="true" className="mt-3 min-h-5">
          {verificationState.error ? (
            <p role="alert" className="text-admin-body text-error">
              {verificationState.error}
            </p>
          ) : null}
        </div>
      </form>
    </div>
  );
}

export function CodConfirmationControl({ orderId }: { orderId: string }) {
  const [state, formAction, isPending] = useActionState(
    confirmCodPayment.bind(null, orderId),
    initialActionState,
  );

  return (
    <form action={formAction} className="mt-5">
      <button
        type="submit"
        disabled={isPending}
        className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-5 text-admin-label text-on-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Mengonfirmasi..." : "Konfirmasi dan Mulai Produksi"}
      </button>
      <div aria-live="polite" aria-atomic="true" className="mt-3 min-h-5">
        {state.error ? (
          <p role="alert" className="text-admin-body text-error">
            {state.error}
          </p>
        ) : null}
      </div>
    </form>
  );
}

export function ProductCodConfirmationControl({
  orderId,
}: {
  orderId: string;
}) {
  const [state, formAction, isPending] = useActionState(
    confirmProductCodOrder.bind(null, orderId),
    initialActionState,
  );

  return (
    <form action={formAction} className="mt-5">
      <button
        type="submit"
        disabled={isPending}
        className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-5 text-admin-label text-on-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Mengonfirmasi..." : "Konfirmasi Pesanan COD"}
      </button>
      <div aria-live="polite" aria-atomic="true" className="mt-3 min-h-5">
        {state.error ? (
          <p role="alert" className="text-admin-body text-error">
            {state.error}
          </p>
        ) : null}
      </div>
    </form>
  );
}
