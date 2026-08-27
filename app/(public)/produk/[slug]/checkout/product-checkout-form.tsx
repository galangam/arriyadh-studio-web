"use client";

import { useActionState } from "react";

import {
  submitProductCheckout,
  type ProductCheckoutState,
} from "@/app/(public)/produk/[slug]/checkout/actions";

type ProductCheckoutFormProps = {
  productId: string;
  availableSizes: string[];
};

const initialState: ProductCheckoutState = {
  error: null,
  fieldErrors: {},
};

function FieldError({ message }: { message?: string }) {
  return message ? (
    <p className="mt-2 font-body text-body-sm text-error">{message}</p>
  ) : null;
}

export function ProductCheckoutForm({
  productId,
  availableSizes,
}: ProductCheckoutFormProps) {
  const action = submitProductCheckout.bind(null, productId);
  const [state, formAction, isPending] = useActionState(action, initialState);
  const hasAvailableSizes = availableSizes.length > 0;

  return (
    <form action={formAction} className="space-y-6">
      <fieldset>
        <legend className="font-body text-label-md font-semibold text-primary">
          Ukuran Produk
        </legend>
        {hasAvailableSizes ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {availableSizes.map((size) => (
              <label key={size} className="cursor-pointer">
                <input
                  type="radio"
                  name="productSize"
                  value={size}
                  required
                  className="peer sr-only"
                />
                <span className="inline-flex min-h-11 min-w-12 items-center justify-center rounded-md border border-outline-variant px-4 font-body text-button text-primary transition-colors peer-checked:border-primary peer-checked:bg-primary peer-checked:text-on-primary peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary">
                  {size}
                </span>
              </label>
            ))}
          </div>
        ) : (
          <p className="mt-2 font-body text-body-sm text-error">
            Produk ini belum memiliki ukuran yang dapat dipilih.
          </p>
        )}
        <FieldError message={state.fieldErrors.productSize} />
      </fieldset>

      <div>
        <label
          htmlFor="quantity"
          className="font-body text-label-md font-semibold text-primary"
        >
          Jumlah
        </label>
        <input
          id="quantity"
          name="quantity"
          type="number"
          inputMode="numeric"
          min={1}
          max={10000}
          step={1}
          defaultValue={1}
          required
          aria-describedby="quantity-help"
          className="mt-2 block min-h-12 w-full rounded-md border border-outline-variant bg-surface-white px-4 font-body text-body-md text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <p
          id="quantity-help"
          className="mt-2 font-body text-body-sm text-on-surface-variant"
        >
          Maksimal 10.000 pcs per pesanan.
        </p>
        <FieldError message={state.fieldErrors.quantity} />
      </div>

      <div>
        <label
          htmlFor="customerName"
          className="font-body text-label-md font-semibold text-primary"
        >
          Nama Pemesan
        </label>
        <input
          id="customerName"
          name="customerName"
          type="text"
          autoComplete="name"
          required
          className="mt-2 block min-h-12 w-full rounded-md border border-outline-variant bg-surface-white px-4 font-body text-body-md text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <FieldError message={state.fieldErrors.customerName} />
      </div>

      <div>
        <label
          htmlFor="customerWhatsapp"
          className="font-body text-label-md font-semibold text-primary"
        >
          Nomor WhatsApp
        </label>
        <input
          id="customerWhatsapp"
          name="customerWhatsapp"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="Contoh: 081234567890"
          required
          className="mt-2 block min-h-12 w-full rounded-md border border-outline-variant bg-surface-white px-4 font-body text-body-md text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <FieldError message={state.fieldErrors.customerWhatsapp} />
      </div>

      <fieldset>
        <legend className="font-body text-label-md font-semibold text-primary">
          Metode Pembayaran
        </legend>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {[
            { value: "transfer", label: "Transfer Bank BRI" },
            { value: "cod", label: "COD" },
          ].map((method) => (
            <label
              key={method.value}
              className="flex min-h-14 cursor-pointer items-center gap-3 rounded-md border border-outline-variant px-4 font-body text-body-md text-on-surface has-[:checked]:border-primary has-[:checked]:bg-surface-container-low"
            >
              <input
                type="radio"
                name="paymentMethod"
                value={method.value}
                required
                className="size-4 accent-primary"
              />
              {method.label}
            </label>
          ))}
        </div>
        <FieldError message={state.fieldErrors.paymentMethod} />
      </fieldset>

      <div aria-live="polite" aria-atomic="true">
        {state.error ? (
          <p
            role="alert"
            className="border border-error/30 bg-error-container px-4 py-3 font-body text-body-sm text-on-error-container"
          >
            {state.error}
          </p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={isPending || !hasAvailableSizes}
        className="inline-flex min-h-12 w-full items-center justify-center rounded-md bg-primary px-gutter font-body text-button text-on-primary transition-colors hover:bg-primary-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Membuat Pesanan..." : "Buat Pesanan"}
      </button>
    </form>
  );
}
