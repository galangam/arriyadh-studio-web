"use client";

import { useActionState } from "react";

import {
  advanceOrderStatus,
  type AdvanceOrderStatusState,
} from "@/app/admin/(protected)/pesanan/[id]/actions";

const initialState: AdvanceOrderStatusState = { error: null };

export function AdvanceOrderStatusControl({
  orderId,
  nextStatusLabel,
  completesOrder,
}: {
  orderId: string;
  nextStatusLabel: string;
  completesOrder: boolean;
}) {
  const [state, formAction, isPending] = useActionState(
    advanceOrderStatus.bind(null, orderId),
    initialState,
  );

  return (
    <form action={formAction} className="mt-5">
      <button
        type="submit"
        disabled={isPending}
        className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-5 text-admin-label text-on-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending
          ? "Memperbarui..."
          : completesOrder
            ? "Selesaikan Pesanan"
            : `Lanjut ke ${nextStatusLabel}`}
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
