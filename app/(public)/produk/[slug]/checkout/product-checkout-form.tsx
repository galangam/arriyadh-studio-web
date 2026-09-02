"use client";

import { useActionState, useMemo, useState } from "react";

import {
  submitProductCheckout,
  type ProductCheckoutState,
} from "@/app/(public)/produk/[slug]/checkout/actions";
import {
  calculateProductUnitPrice,
  findProductVariant,
  type ProductVariant,
} from "@/lib/products/product-pricing";

type ProductCheckoutFormProps = {
  productId: string;
  catalogPrice: number;
  availableSizes: string[];
  variants: ProductVariant[];
};

const initialState: ProductCheckoutState = {
  error: null,
  fieldErrors: {},
};

const rupiahFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

function FieldError({ message }: { message?: string }) {
  return message ? (
    <p className="mt-2 font-body text-body-sm text-error">{message}</p>
  ) : null;
}

export function ProductCheckoutForm({
  productId,
  catalogPrice,
  availableSizes,
  variants,
}: ProductCheckoutFormProps) {
  const action = submitProductCheckout.bind(null, productId);
  const [state, formAction, isPending] = useActionState(action, initialState);
  const materials = useMemo(
    () => [...new Set(variants.map((variant) => variant.material))],
    [variants],
  );
  const [material, setMaterial] = useState(
    materials.length === 1 ? materials[0] : "",
  );
  const sleeveTypes = useMemo(
    () =>
      [
        ...new Set(
          variants
            .filter((variant) => variant.material === material)
            .map((variant) => variant.sleeve_type)
            .filter((sleeve): sleeve is string => sleeve !== null),
        ),
      ],
    [material, variants],
  );
  const hasSleeveVariants = variants.some(
    (variant) => variant.sleeve_type !== null,
  );
  const [sleeveType, setSleeveType] = useState("");
  const [size, setSize] = useState("");
  const [quantity, setQuantity] = useState("1");
  const hasAvailableSizes = availableSizes.length > 0;
  const selectedVariant = findProductVariant(variants, material, sleeveType);
  const unitPrice = selectedVariant
    ? calculateProductUnitPrice(selectedVariant, size)
    : variants.length === 0
      ? catalogPrice
      : null;
  const parsedQuantity = /^\d+$/.test(quantity) ? Number(quantity) : 0;
  const total =
    unitPrice !== null && Number.isSafeInteger(parsedQuantity)
      ? unitPrice * parsedQuantity
      : null;
  const appliedSurcharge =
    selectedVariant && unitPrice !== null
      ? unitPrice - selectedVariant.base_unit_price
      : 0;

  return (
    <form action={formAction} className="space-y-0">
      <fieldset className="pb-8">
        <legend className="font-heading text-heading-sm text-primary">
          Pilihan Produk
        </legend>
        <p className="mt-1 font-body text-body-sm text-on-surface-variant">
          Pilih varian, ukuran, dan jumlah produk yang ingin dipesan.
        </p>
        <div className="mt-5 space-y-6">
      {materials.length > 1 ? (
        <fieldset disabled={isPending}>
          <legend className="font-body text-label-md font-semibold text-primary">
            Bahan
          </legend>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {materials.map((option) => (
              <label
                key={option}
                className="flex min-h-14 cursor-pointer items-center gap-3 rounded-md border border-outline-variant px-4 font-body text-body-md text-on-surface focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary has-[:checked]:border-primary has-[:checked]:bg-surface-container-low has-[:checked]:font-semibold"
              >
                <input
                  type="radio"
                  name="productMaterial"
                  value={option}
                  checked={material === option}
                  onChange={() => {
                    setMaterial(option);
                    setSleeveType("");
                  }}
                  required
                  className="size-4 accent-primary"
                />
                {option}
              </label>
            ))}
          </div>
          <FieldError message={state.fieldErrors.productMaterial} />
        </fieldset>
      ) : materials.length === 1 ? (
        <div>
          <p className="font-body text-label-md font-semibold text-primary">
            Bahan
          </p>
          <p className="mt-2 font-body text-body-md text-on-surface">
            {materials[0]}
          </p>
          <input type="hidden" name="productMaterial" value={materials[0]} />
          <FieldError message={state.fieldErrors.productMaterial} />
        </div>
      ) : null}

      {hasSleeveVariants ? (
        <fieldset disabled={isPending || !material}>
          <legend className="font-body text-label-md font-semibold text-primary">
            Jenis Lengan
          </legend>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {sleeveTypes.map((option) => (
              <label
                key={option}
                className="flex min-h-14 cursor-pointer items-center gap-3 rounded-md border border-outline-variant px-4 font-body text-body-md text-on-surface focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary has-[:checked]:border-primary has-[:checked]:bg-surface-container-low has-[:checked]:font-semibold"
              >
                <input
                  type="radio"
                  name="productSleeveType"
                  value={option}
                  checked={sleeveType === option}
                  onChange={() => setSleeveType(option)}
                  required
                  className="size-4 accent-primary"
                />
                {option}
              </label>
            ))}
          </div>
          {!material ? (
            <p className="mt-2 font-body text-body-sm text-on-surface-variant">
              Pilih bahan terlebih dahulu.
            </p>
          ) : null}
          <FieldError message={state.fieldErrors.productSleeveType} />
        </fieldset>
      ) : (
        <input type="hidden" name="productSleeveType" value="" />
      )}

      <fieldset disabled={isPending}>
        <legend className="font-body text-label-md font-semibold text-primary">
          Ukuran Produk
        </legend>
        {hasAvailableSizes ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {availableSizes.map((option) => (
              <label key={option} className="cursor-pointer">
                <input
                  type="radio"
                  name="productSize"
                  value={option}
                  checked={size === option}
                  onChange={() => setSize(option)}
                  required
                  className="peer sr-only"
                />
                <span className="inline-flex min-h-12 min-w-12 items-center justify-center rounded-md border border-outline-variant px-4 font-body text-button text-primary transition-colors peer-checked:border-primary peer-checked:bg-primary peer-checked:text-on-primary peer-checked:ring-2 peer-checked:ring-primary peer-checked:ring-offset-2 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary">
                  {option}
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
        {appliedSurcharge > 0 ? (
          <p className="mt-3 font-body text-body-sm text-on-surface-variant">
            Harga ukuran ini termasuk tambahan {rupiahFormatter.format(appliedSurcharge)} per pcs.
          </p>
        ) : null}
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
          value={quantity}
          onChange={(event) => setQuantity(event.target.value)}
          disabled={isPending}
          required
          aria-describedby="quantity-help"
          className="mt-2 block min-h-12 w-full rounded-md border border-outline-variant bg-surface-white px-4 font-body text-body-md text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:max-w-xs"
        />
        <p
          id="quantity-help"
          className="mt-2 font-body text-body-sm text-on-surface-variant"
        >
          Maksimal 10.000 pcs per pesanan.
        </p>
        <FieldError message={state.fieldErrors.quantity} />
      </div>
        </div>
      </fieldset>

      <fieldset className="border-t border-outline-variant py-8">
        <legend className="font-heading text-heading-sm text-primary">
          Data Pemesan
        </legend>
        <p className="mt-1 font-body text-body-sm text-on-surface-variant">
          Pastikan nomor WhatsApp aktif agar informasi pesanan dapat diterima.
        </p>
        <div className="mt-5 grid gap-6 sm:grid-cols-2">
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
          disabled={isPending}
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
          disabled={isPending}
          required
          className="mt-2 block min-h-12 w-full rounded-md border border-outline-variant bg-surface-white px-4 font-body text-body-md text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <FieldError message={state.fieldErrors.customerWhatsapp} />
      </div>
        </div>
      </fieldset>

      <fieldset
        disabled={isPending}
        className="border-t border-outline-variant py-8"
      >
        <legend className="font-heading text-heading-sm text-primary">
          Metode Pembayaran
        </legend>
        <p className="mt-1 font-body text-body-sm text-on-surface-variant">
          Pilih cara pembayaran yang paling sesuai.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {[
            {
              value: "transfer",
              label: "Transfer Bank BRI",
              description: "Pembayaran dilanjutkan setelah pesanan dibuat.",
            },
            {
              value: "cod",
              label: "COD",
              description: "Pembayaran dilanjutkan dengan metode COD.",
            },
          ].map((method) => (
            <label
              key={method.value}
              className="flex min-h-16 cursor-pointer items-start gap-3 rounded-md border border-outline-variant px-4 py-3 font-body text-body-md text-on-surface focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary has-[:checked]:border-primary has-[:checked]:bg-surface-container-low"
            >
              <input
                type="radio"
                name="paymentMethod"
                value={method.value}
                required
                className="size-4 accent-primary"
              />
              <span>
                <span className="block font-semibold text-primary">
                  {method.label}
                </span>
                <span className="mt-1 block text-body-sm text-on-surface-variant">
                  {method.description}
                </span>
              </span>
            </label>
          ))}
        </div>
        <FieldError message={state.fieldErrors.paymentMethod} />
      </fieldset>

      <section
        aria-labelledby="price-summary-title"
        className="border-t border-outline-variant py-8"
      >
        <h3
          id="price-summary-title"
          className="font-heading text-heading-sm text-primary"
        >
          Ringkasan Harga
        </h3>
        <dl
          aria-live="polite"
          className="mt-4 border-y border-outline-variant bg-surface-container-low px-4"
        >
          <div className="flex items-center justify-between gap-4 py-4">
            <dt className="font-body text-body-sm text-on-surface-variant">
              Harga satuan
            </dt>
            <dd className="font-heading text-heading-xs text-primary">
              {unitPrice === null
                ? "Pilih varian"
                : rupiahFormatter.format(unitPrice)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-outline-variant py-4">
            <dt className="font-body text-body-sm text-on-surface-variant">
              Jumlah
            </dt>
            <dd className="font-body text-body-md font-semibold text-primary">
              {parsedQuantity > 0 ? `${parsedQuantity} pcs` : "—"}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-outline-variant py-4">
            <dt className="font-body text-body-md font-semibold text-primary">
              Total
            </dt>
            <dd className="font-heading text-heading-sm text-primary">
              {total === null ? "—" : rupiahFormatter.format(total)}
            </dd>
          </div>
        </dl>
      </section>

      <section
        aria-labelledby="checkout-confirmation-title"
        className="border-t border-outline-variant pt-8"
      >
        <h3
          id="checkout-confirmation-title"
          className="font-heading text-heading-sm text-primary"
        >
          Konfirmasi Pesanan
        </h3>
        <p className="mt-1 font-body text-body-sm text-on-surface-variant">
          Periksa pilihan produk dan total sebelum membuat pesanan.
        </p>

      <div className="mt-5" aria-live="polite" aria-atomic="true">
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
        className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-md bg-primary px-gutter font-body text-button text-on-primary transition-colors hover:bg-primary-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Membuat Pesanan..." : "Buat Pesanan"}
      </button>
      </section>
    </form>
  );
}
