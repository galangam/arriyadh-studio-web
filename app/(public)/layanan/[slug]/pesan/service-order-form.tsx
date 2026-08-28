"use client";

import { useActionState } from "react";

import { DesignReferencePicker } from "@/app/(public)/layanan/[slug]/pesan/design-reference-picker";
import {
  submitServiceOrder,
  type ServiceOrderState,
} from "@/app/(public)/layanan/[slug]/pesan/actions";
import type { PublicServiceFlow } from "@/lib/services/public-services";
import {
  allowsDesignReference,
  isDesignOrientedService,
} from "@/lib/services/service-requirements";

type ServiceOrderFormProps = {
  serviceId: string;
  serviceSlug: string;
  serviceFlow: PublicServiceFlow;
};

const initialState: ServiceOrderState = {
  error: null,
  fieldErrors: {},
};

const inputClassName =
  "mt-2 block min-h-12 w-full rounded-md border border-outline-variant bg-surface-white px-4 font-body text-body-md text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

function FieldError({ message }: { message?: string }) {
  return message ? (
    <p className="mt-2 font-body text-body-sm text-error">{message}</p>
  ) : null;
}

export function ServiceOrderForm({
  serviceId,
  serviceSlug,
  serviceFlow,
}: ServiceOrderFormProps) {
  const action = submitServiceOrder.bind(null, serviceId);
  const [state, formAction, isPending] = useActionState(action, initialState);
  const isOtherService = serviceSlug === "lainnya";
  const requiresDesignSpecification = isDesignOrientedService(serviceSlug);
  const requirementLabel = isOtherService
    ? "Detail Kebutuhan"
    : serviceFlow === "permak"
      ? "Deskripsi Pekerjaan"
      : "Material / Bahan";
  const requirementHelp = isOtherService
    ? "Jelaskan kebutuhan banner, stiker, undangan, desain, atau pekerjaan custom lainnya."
    : serviceFlow === "permak"
      ? "Jelaskan bagian pakaian yang perlu disesuaikan atau diperbaiki."
      : requiresDesignSpecification
        ? "Contoh: Cotton Combed 24s."
        : "Jelaskan bahan atau detail produksi utama yang perlu diketahui admin.";
  const referenceAllowed = allowsDesignReference(serviceSlug);

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
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
            maxLength={120}
            className={inputClassName}
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
            className={inputClassName}
          />
          <FieldError message={state.fieldErrors.customerWhatsapp} />
        </div>
      </div>

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
          className={inputClassName}
        />
        <FieldError message={state.fieldErrors.quantity} />
      </div>

      {requiresDesignSpecification ? (
        <>
          <div>
            <label
              htmlFor="material"
              className="font-body text-label-md font-semibold text-primary"
            >
              Material / Bahan
            </label>
            <input
              id="material"
              name="material"
              type="text"
              placeholder="Cotton Combed 24s"
              required
              maxLength={2000}
              className={inputClassName}
            />
            <p className="mt-2 font-body text-body-sm text-on-surface-variant">
              {requirementHelp}
            </p>
            <FieldError message={state.fieldErrors.material} />
          </div>

          <div>
            <label
              htmlFor="designDescription"
              className="font-body text-label-md font-semibold text-primary"
            >
              Detail Desain
            </label>
            <textarea
              id="designDescription"
              name="designDescription"
              rows={6}
              required
              minLength={10}
              maxLength={2000}
              placeholder="Logo kecil di dada kiri, tulisan besar di belakang, warna dasar hitam."
              aria-describedby="design-description-help"
              className={`${inputClassName} py-3`}
            />
            <p
              id="design-description-help"
              className="mt-2 font-body text-body-sm text-on-surface-variant"
            >
              Jelaskan posisi, ukuran, tulisan, dan warna desain yang diinginkan.
            </p>
            <FieldError message={state.fieldErrors.designDescription} />
          </div>
        </>
      ) : (
        <div>
          <label
            htmlFor="requirement"
            className="font-body text-label-md font-semibold text-primary"
          >
            {requirementLabel}
          </label>
          <textarea
            id="requirement"
            name="requirement"
            rows={6}
            required
            maxLength={2000}
            aria-describedby="requirement-help"
            className={`${inputClassName} py-3`}
          />
          <p
            id="requirement-help"
            className="mt-2 font-body text-body-sm text-on-surface-variant"
          >
            {requirementHelp}
          </p>
          <FieldError message={state.fieldErrors.requirement} />
        </div>
      )}

      {referenceAllowed ? (
        <DesignReferencePicker
          serverError={state.fieldErrors.designReferences}
        />
      ) : null}

      <fieldset className="border-t border-outline-variant pt-6">
        <legend className="font-heading text-heading-sm text-primary">
          Informasi Tambahan
        </legend>
        <p className="mt-1 font-body text-body-sm text-on-surface-variant">
          Bagian berikut bersifat opsional.
        </p>

        <div className="mt-5 grid gap-6 sm:grid-cols-2">
          <div>
            <label
              htmlFor="customerCompany"
              className="font-body text-label-md font-semibold text-primary"
            >
              Perusahaan / Instansi
            </label>
            <input
              id="customerCompany"
              name="customerCompany"
              type="text"
              autoComplete="organization"
              maxLength={160}
              className={inputClassName}
            />
            <FieldError message={state.fieldErrors.customerCompany} />
          </div>

          <div>
            <label
              htmlFor="customerEmail"
              className="font-body text-label-md font-semibold text-primary"
            >
              Email
            </label>
            <input
              id="customerEmail"
              name="customerEmail"
              type="email"
              autoComplete="email"
              maxLength={254}
              className={inputClassName}
            />
            <FieldError message={state.fieldErrors.customerEmail} />
          </div>
        </div>

        <div className="mt-6">
          <label
            htmlFor="shippingAddress"
            className="font-body text-label-md font-semibold text-primary"
          >
            Alamat
          </label>
          <textarea
            id="shippingAddress"
            name="shippingAddress"
            rows={4}
            maxLength={1000}
            autoComplete="street-address"
            className={`${inputClassName} py-3`}
          />
          <FieldError message={state.fieldErrors.shippingAddress} />
        </div>
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
        disabled={isPending}
        className="inline-flex min-h-12 w-full items-center justify-center rounded-md bg-primary px-gutter font-body text-button text-on-primary transition-colors hover:bg-primary-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {isPending ? "Membuat Pesanan..." : "Kirim Pesanan"}
      </button>
    </form>
  );
}
