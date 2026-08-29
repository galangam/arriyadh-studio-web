"use client";

import { useActionState, useEffect, useRef, useState } from "react";

import { DesignReferencePicker } from "@/app/(public)/layanan/[slug]/pesan/design-reference-picker";
import { ServiceVariantFields } from "@/app/(public)/layanan/[slug]/pesan/service-variant-fields";
import {
  submitServiceOrder,
  type ServiceOrderField,
  type ServiceOrderState,
  type ServiceOrderSubmittedValues,
} from "@/app/(public)/layanan/[slug]/pesan/actions";
import type { PublicServiceFlow } from "@/lib/services/public-services";
import {
  getDesignReferenceRequirement,
  getServiceVariantHeading,
  getServiceVariantMaterials,
  isDesignOrientedService,
} from "@/lib/services/service-requirements";

type ServiceOrderFormProps = {
  serviceId: string;
  serviceSlug: string;
  serviceFlow: PublicServiceFlow;
};

const initialState: ServiceOrderState = {
  formError: null,
  fieldErrors: {},
  submittedValues: null,
  revision: 0,
};

const emptyValues: ServiceOrderSubmittedValues = {
  customerName: "",
  customerWhatsapp: "",
  quantity: "1",
  customerCompany: "",
  customerEmail: "",
  shippingAddress: "",
  requirement: "",
  material: "",
  designDescription: "",
  variants: [],
};

const inputClassName =
  "mt-2 block min-h-12 w-full rounded-md border border-outline-variant bg-surface-white px-4 font-body text-body-md text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

const globalValidationMessage =
  "Pesanan belum berhasil dibuat. Periksa kembali data yang ditandai.";

const fieldOrder: ServiceOrderField[] = [
  "customerName",
  "customerWhatsapp",
  "quantity",
  "variants",
  "material",
  "requirement",
  "designDescription",
  "designReferences",
  "customerCompany",
  "customerEmail",
  "shippingAddress",
];

const fieldSelectors: Partial<Record<ServiceOrderField, string>> = {
  customerName: "#customerName",
  customerWhatsapp: "#customerWhatsapp",
  quantity: "#quantity",
  variants: "[data-variant-invalid='true'], [data-variant-card]",
  material: "#material",
  requirement: "#requirement",
  designDescription: "#designDescription",
  designReferences: "#design-reference-add",
  customerCompany: "#customerCompany",
  customerEmail: "#customerEmail",
  shippingAddress: "#shippingAddress",
};

function scrollAndFocus(element: HTMLElement | null) {
  if (!element) return;
  element.scrollIntoView({ behavior: "smooth", block: "center" });
  element.focus({ preventScroll: true });
}

function focusFormField(
  form: HTMLFormElement | null,
  field: ServiceOrderField,
) {
  const selector = fieldSelectors[field];
  scrollAndFocus(
    selector ? form?.querySelector<HTMLElement>(selector) ?? null : null,
  );
}

function FieldError({
  id,
  message,
}: {
  id: string;
  message?: string;
}) {
  return message ? (
    <p id={id} className="mt-2 font-body text-body-sm text-error">
      {message}
    </p>
  ) : null;
}

export function ServiceOrderForm({
  serviceId,
  serviceSlug,
  serviceFlow,
}: ServiceOrderFormProps) {
  const action = submitServiceOrder.bind(null, serviceId);
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [values, setValues] = useState<ServiceOrderSubmittedValues>(
    state.submittedValues ?? emptyValues,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const clientFocusScheduledRef = useRef(false);
  const [validationFailed, setValidationFailed] = useState(false);
  const serverValidationFailed =
    state.revision > 0 &&
    (Object.keys(state.fieldErrors).length > 0 || Boolean(state.formError));
  const [clientFieldErrors, setClientFieldErrors] = useState<
    Partial<Record<ServiceOrderField, string>>
  >({});

  function fieldError(field: ServiceOrderField) {
    return clientFieldErrors[field] ?? state.fieldErrors[field];
  }

  useEffect(() => {
    if (state.revision === 0) return;

    const firstErrorField = fieldOrder.find(
      (field) => state.fieldErrors[field],
    );
    if (!firstErrorField && !state.formError) return;

    requestAnimationFrame(() => {
      if (firstErrorField) {
        focusFormField(formRef.current, firstErrorField);
      } else {
        scrollAndFocus(
          formRef.current?.querySelector<HTMLElement>(
            "#service-order-error-summary",
          ) ?? null,
        );
      }
    });
  }, [state.revision, state.fieldErrors, state.formError]);

  function handleInvalid(event: React.InvalidEvent<HTMLFormElement>) {
    event.preventDefault();
    setValidationFailed(true);

    const target = event.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    const field = target.name as ServiceOrderField;
    const messages: Partial<Record<ServiceOrderField, string>> = {
      customerName: "Nama pemesan wajib diisi.",
      customerWhatsapp: "Nomor WhatsApp harus terdiri dari 8–15 digit.",
      quantity: "Jumlah harus antara 1 dan 10.000.",
      material: "Material atau bahan wajib diisi.",
      requirement: "Detail kebutuhan wajib diisi.",
      designDescription: "Detail desain wajib diisi minimal 10 karakter.",
      designReferences: "Unggah minimal 1 referensi desain.",
      customerEmail: "Format email tidak valid.",
    };
    if (messages[field]) {
      setClientFieldErrors((current) => ({
        ...current,
        [field]: messages[field],
      }));
    }

    if (clientFocusScheduledRef.current) return;
    clientFocusScheduledRef.current = true;
    requestAnimationFrame(() => {
      const firstInvalid = formRef.current?.querySelector<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >("input:invalid, select:invalid, textarea:invalid");
      scrollAndFocus(
        firstInvalid?.name === "designReferences"
          ? formRef.current?.querySelector<HTMLElement>(
              "#design-reference-add",
            ) ?? null
          : firstInvalid ?? null,
      );
      clientFocusScheduledRef.current = false;
    });
  }

  function handleSubmitCapture(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    const form = event.currentTarget;
    const errors: Partial<Record<ServiceOrderField, string>> = {};
    const whatsapp = values.customerWhatsapp.replace(/\D/g, "");

    if (whatsapp.length < 8 || whatsapp.length > 15) {
      errors.customerWhatsapp =
        "Nomor WhatsApp harus terdiri dari 8–15 digit.";
    }

    const invalidVariant = form.querySelector<HTMLElement>(
      "[data-variant-invalid='true']",
    );
    if (invalidVariant) {
      errors.variants = "Periksa kembali rincian varian yang ditandai.";
    }

    if (Object.keys(errors).length === 0) {
      setClientFieldErrors({});
      setValidationFailed(false);
      return;
    }

    event.preventDefault();
    setClientFieldErrors(errors);
    setValidationFailed(true);
    const firstErrorField = fieldOrder.find((field) => errors[field]);
    requestAnimationFrame(() => {
      if (firstErrorField === "variants") {
        scrollAndFocus(invalidVariant);
      } else if (firstErrorField) {
        focusFormField(formRef.current, firstErrorField);
      }
    });
  }

  function updateValue(
    field: keyof Omit<ServiceOrderSubmittedValues, "variants">,
    value: string,
  ) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  const isOtherService = serviceSlug === "lainnya";
  const variantMaterials = getServiceVariantMaterials(serviceSlug);
  const usesVariants = variantMaterials !== null;
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
  const referenceRequirement =
    getDesignReferenceRequirement(serviceSlug);

  return (
    <form
      ref={formRef}
      action={formAction}
      onInvalidCapture={handleInvalid}
      onSubmitCapture={handleSubmitCapture}
      className="space-y-6"
    >
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
            aria-invalid={Boolean(fieldError("customerName"))}
            aria-describedby={
              fieldError("customerName") ? "customerName-error" : undefined
            }
            value={values.customerName}
            onChange={(event) =>
              updateValue("customerName", event.target.value)
            }
            className={inputClassName}
          />
          <FieldError
            id="customerName-error"
            message={fieldError("customerName")}
          />
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
            aria-invalid={Boolean(fieldError("customerWhatsapp"))}
            aria-describedby={
              fieldError("customerWhatsapp")
                ? "customerWhatsapp-error"
                : undefined
            }
            value={values.customerWhatsapp}
            onChange={(event) =>
              updateValue("customerWhatsapp", event.target.value)
            }
            className={inputClassName}
          />
          <FieldError
            id="customerWhatsapp-error"
            message={fieldError("customerWhatsapp")}
          />
        </div>
      </div>

      {!usesVariants ? (
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
          value={values.quantity}
          onChange={(event) => updateValue("quantity", event.target.value)}
          required
          className={inputClassName}
        />
        <FieldError id="quantity-error" message={fieldError("quantity")} />
      </div>
      ) : null}

      {requiresDesignSpecification ? (
        <>
          {usesVariants ? (
            <ServiceVariantFields
              materialOptions={variantMaterials}
              heading={getServiceVariantHeading(serviceSlug)}
              serverError={fieldError("variants")}
              pending={isPending}
              restoredValues={state.submittedValues?.variants ?? null}
              serviceSlug={serviceSlug}
            />
          ) : (
            <div>
              <label htmlFor="material" className="font-body text-label-md font-semibold text-primary">
                Material / Bahan
              </label>
              <input
                id="material"
                name="material"
                type="text"
                placeholder="Cotton Combed 24s"
                required
                maxLength={2000}
                value={values.material}
                onChange={(event) =>
                  updateValue("material", event.target.value)
                }
                className={inputClassName}
              />
              <p className="mt-2 font-body text-body-sm text-on-surface-variant">{requirementHelp}</p>
              <FieldError id="material-error" message={fieldError("material")} />
            </div>
          )}

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
              aria-invalid={Boolean(fieldError("designDescription"))}
              aria-describedby={
                fieldError("designDescription")
                  ? "design-description-help designDescription-error"
                  : "design-description-help"
              }
              value={values.designDescription}
              onChange={(event) =>
                updateValue("designDescription", event.target.value)
              }
              className={`${inputClassName} py-3`}
            />
            <p
              id="design-description-help"
              className="mt-2 font-body text-body-sm text-on-surface-variant"
            >
              Jelaskan posisi, ukuran, tulisan, dan warna desain yang diinginkan.
            </p>
            <FieldError
              id="designDescription-error"
              message={fieldError("designDescription")}
            />
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
            value={values.requirement}
            onChange={(event) =>
              updateValue("requirement", event.target.value)
            }
            className={`${inputClassName} py-3`}
          />
          <p
            id="requirement-help"
            className="mt-2 font-body text-body-sm text-on-surface-variant"
          >
            {requirementHelp}
          </p>
          <FieldError
            id="requirement-error"
            message={fieldError("requirement")}
          />
        </div>
      )}

      {referenceRequirement !== "unsupported" ? (
        <DesignReferencePicker
          serverError={fieldError("designReferences")}
          responseRevision={state.revision}
          pending={isPending}
          requirement={referenceRequirement}
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
              value={values.customerCompany}
              onChange={(event) =>
                updateValue("customerCompany", event.target.value)
              }
              className={inputClassName}
            />
            <FieldError
              id="customerCompany-error"
              message={fieldError("customerCompany")}
            />
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
              aria-invalid={Boolean(fieldError("customerEmail"))}
              aria-describedby={
                fieldError("customerEmail") ? "customerEmail-error" : undefined
              }
              value={values.customerEmail}
              onChange={(event) =>
                updateValue("customerEmail", event.target.value)
              }
              className={inputClassName}
            />
            <FieldError
              id="customerEmail-error"
              message={fieldError("customerEmail")}
            />
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
            value={values.shippingAddress}
            onChange={(event) =>
              updateValue("shippingAddress", event.target.value)
            }
            className={`${inputClassName} py-3`}
          />
          <FieldError
            id="shippingAddress-error"
            message={fieldError("shippingAddress")}
          />
        </div>
      </fieldset>

      <div aria-live="assertive" aria-atomic="true">
        {validationFailed || serverValidationFailed ? (
          <div
            id="service-order-error-summary"
            role="alert"
            tabIndex={-1}
            className="border border-error/30 bg-error-container px-4 py-3 font-body text-body-sm text-on-error-container"
          >
            <p className="font-semibold">{globalValidationMessage}</p>
            {state.formError ? (
              <p className="mt-1">{state.formError}</p>
            ) : null}
          </div>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={isPending}
        onClick={() => {
          clientFocusScheduledRef.current = false;
          setClientFieldErrors({});
          setValidationFailed(false);
        }}
        className="inline-flex min-h-12 w-full items-center justify-center rounded-md bg-primary px-gutter font-body text-button text-on-primary transition-colors hover:bg-primary-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {isPending ? "Membuat Pesanan..." : "Kirim Pesanan"}
      </button>
    </form>
  );
}
