"use client";

import { useActionState, useId, useRef } from "react";

import {
  cancelOrder,
  type CancelOrderState,
} from "@/app/admin/(protected)/pesanan/[id]/actions";

const initialState: CancelOrderState = { error: null };

export function CancelOrderControl({
  orderId,
  orderCode,
  expectedStatus,
}: {
  orderId: string;
  orderCode: string;
  expectedStatus: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const [state, formAction, isPending] = useActionState(
    cancelOrder.bind(null, orderId, expectedStatus),
    initialState,
  );

  function closeDialog() {
    if (!isPending) dialogRef.current?.close();
  }

  return (
    <div className="mt-5">
      <button
        type="button"
        disabled={isPending}
        onClick={() => dialogRef.current?.showModal()}
        className="inline-flex min-h-11 w-full items-center justify-center rounded-md border border-error px-5 text-admin-label font-semibold text-error focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        Batalkan Pesanan
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-md border border-outline-variant bg-surface-white p-0 text-on-surface shadow-lg backdrop:bg-primary/60"
        onCancel={(event) => {
          if (isPending) event.preventDefault();
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeDialog();
        }}
      >
        <form action={formAction} className="p-5 md:p-6">
          <h2
            id={titleId}
            className="font-heading text-admin-section text-error"
          >
            Batalkan pesanan?
          </h2>
          <p
            id={descriptionId}
            className="mt-3 text-admin-body text-on-surface-variant"
          >
            Pesanan {orderCode} akan ditandai sebagai dibatalkan. Tindakan ini
            tidak menghapus data pesanan dan tidak memproses refund otomatis.
          </p>

          <div aria-live="polite" aria-atomic="true" className="mt-3 min-h-5">
            {state.error ? (
              <p role="alert" className="text-admin-body text-error">
                {state.error}
              </p>
            ) : null}
          </div>

          <div className="mt-5 flex flex-wrap justify-end gap-3 border-t border-outline-variant pt-5">
            <button
              type="button"
              disabled={isPending}
              onClick={closeDialog}
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-outline-variant px-5 text-admin-label text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-error px-5 text-admin-label text-on-error focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? "Membatalkan..." : "Ya, batalkan pesanan"}
            </button>
          </div>
        </form>
      </dialog>
    </div>
  );
}
