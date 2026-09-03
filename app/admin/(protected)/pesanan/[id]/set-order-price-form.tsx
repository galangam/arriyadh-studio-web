"use client";

import { useActionState, useState } from "react";

import {
  setOrderPrice,
  type SetOrderPriceState,
} from "@/app/admin/(protected)/pesanan/[id]/actions";

const initialState: SetOrderPriceState = {
  error: null,
};

export function SetOrderPriceForm({ orderId }: { orderId: string }) {
  const [priceDigits, setPriceDigits] = useState("");
  const setOrderPriceForOrder = setOrderPrice.bind(null, orderId);
  const [state, formAction, isPending] = useActionState(
    setOrderPriceForOrder,
    initialState,
  );
  const hasError = Boolean(state.error);

  return (
    <form action={formAction} className="mt-5 space-y-5">
      <div className="space-y-2">
        <label
          htmlFor="total-price"
          className="block text-admin-label text-primary"
        >
          Total Harga
        </label>
        <input
          id="total-price"
          type="text"
          inputMode="numeric"
          required
          autoComplete="off"
          value={
            priceDigits === ""
              ? ""
              : new Intl.NumberFormat("id-ID").format(Number(priceDigits))
          }
          onChange={(event) => {
            setPriceDigits(event.target.value.replace(/\D/g, ""));
          }}
          aria-invalid={hasError}
          aria-describedby={
            hasError ? "total-price-help total-price-error" : "total-price-help"
          }
          className="min-h-11 w-full rounded-md border border-outline-variant bg-surface-white px-3 text-admin-body text-on-surface outline-none placeholder:text-on-surface-variant focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
          placeholder="Contoh: 2000000"
          disabled={isPending}
        />
        <input type="hidden" name="totalPrice" value={priceDigits} />
        <p
          id="total-price-help"
          className="text-admin-caption text-on-surface-variant"
        >
          DP akan dihitung otomatis sekitar 50% dari total harga.
        </p>
      </div>

      <div aria-live="polite" aria-atomic="true" className="min-h-5">
        {state.error ? (
          <p
            id="total-price-error"
            role="alert"
            className="text-admin-body text-error"
          >
            {state.error}
          </p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-primary px-5 text-admin-label text-on-primary transition-colors hover:bg-primary-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {isPending ? "Menyimpan..." : "Simpan Harga"}
      </button>
    </form>
  );
}
