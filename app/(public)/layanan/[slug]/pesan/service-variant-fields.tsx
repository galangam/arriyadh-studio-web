"use client";

import { useState } from "react";

import type { SubmittedServiceVariant } from "@/app/(public)/layanan/[slug]/pesan/actions";

import {
  getJerseyVariantMaterials,
  isJerseyVariantType,
  jerseyVariantTypeLabels,
  jerseyVariantTypes,
  maxServiceVariantCount,
  serviceVariantSizes,
  serviceVariantSleeveTypes,
} from "@/lib/services/service-requirements";

type Variant = {
  id: number;
  variantType: string | null;
  material: string;
  sleeveType: string;
  sizes: Record<string, string>;
};

function emptySizes() {
  return Object.fromEntries(serviceVariantSizes.map((size) => [size, ""]));
}

function materialsForVariant(
  variantType: string | null,
  fallback: readonly string[],
) {
  return variantType && isJerseyVariantType(variantType)
    ? getJerseyVariantMaterials(variantType)
    : fallback;
}

function restoredVariants(
  values: SubmittedServiceVariant[] | null,
  materialOptions: readonly string[],
  isJersey: boolean,
) {
  const source =
    values && values.length > 0
      ? values
      : [
          {
            variantType: isJersey ? jerseyVariantTypes[0] : null,
            material: materialOptions[0],
            sleeveType: serviceVariantSleeveTypes[0],
            sizes: emptySizes(),
          },
        ];

  return source.map((variant, index) => {
    const variantType =
      isJersey && variant.variantType && isJerseyVariantType(variant.variantType)
        ? variant.variantType
        : isJersey
          ? jerseyVariantTypes[0]
          : null;
    const allowedMaterials = materialsForVariant(
      variantType,
      materialOptions,
    );

    return {
      id: index + 1,
      variantType,
      material: allowedMaterials.some(
        (material) => material === variant.material,
      )
        ? variant.material
        : allowedMaterials[0],
      sleeveType: variant.sleeveType,
      sizes: Object.fromEntries(
        serviceVariantSizes.map((size) => [
          size,
          variant.sizes[size] ?? "",
        ]),
      ),
    };
  });
}

export function ServiceVariantFields({
  materialOptions,
  heading,
  serverError,
  pending,
  restoredValues,
  serviceSlug,
}: {
  materialOptions: readonly string[];
  heading: string;
  serverError?: string;
  pending: boolean;
  restoredValues: SubmittedServiceVariant[] | null;
  serviceSlug: string;
}) {
  const isJersey = serviceSlug === "jersey";
  const [variants, setVariants] = useState<Variant[]>(() =>
    restoredVariants(restoredValues, materialOptions, isJersey),
  );
  const [nextId, setNextId] = useState(variants.length + 1);

  function updateVariant(id: number, patch: Partial<Variant>) {
    setVariants((current) =>
      current.map((variant) =>
        variant.id === id ? { ...variant, ...patch } : variant,
      ),
    );
  }

  function subtotal(variant: Variant) {
    return serviceVariantSizes.reduce((sum, size) => {
      const quantity = Number(variant.sizes[size]);
      return (
        sum +
        (Number.isSafeInteger(quantity) && quantity > 0 ? quantity : 0)
      );
    }, 0);
  }

  const total = variants.reduce(
    (sum, variant) => sum + subtotal(variant),
    0,
  );
  const combinationKeys = variants.map((variant) =>
    [
      isJersey ? variant.variantType : null,
      variant.material,
      variant.sleeveType,
    ].join("\u0000"),
  );
  const combinationCounts = new Map<string, number>();
  combinationKeys.forEach((key) => {
    combinationCounts.set(key, (combinationCounts.get(key) ?? 0) + 1);
  });
  const duplicateKeys = new Set(
    combinationKeys.filter((key) => (combinationCounts.get(key) ?? 0) > 1),
  );
  const duplicate = duplicateKeys.size > 0;

  return (
    <fieldset
      aria-busy={pending}
      className="min-w-0"
    >
      <legend className="font-body text-label-md font-semibold text-primary">
        {heading}
      </legend>
      <p className="mt-1 font-body text-body-sm text-on-surface-variant">
        Pisahkan varian jika material, jenis lengan, atau rincian ukurannya berbeda.
      </p>

      <div className="mt-4 space-y-4">
        {variants.map((variant, index) => {
          const variantSubtotal = subtotal(variant);
          const variantInvalid =
            variantSubtotal === 0 || duplicateKeys.has(combinationKeys[index]);
          const currentMaterialOptions = materialsForVariant(
            variant.variantType,
            materialOptions,
          );

          return (
            <section
              key={variant.id}
              data-variant-card
              data-variant-invalid={variantInvalid ? "true" : undefined}
              aria-labelledby={`variant-${variant.id}-heading`}
              tabIndex={-1}
              className="rounded-md border border-outline-variant bg-surface-container-low p-4 focus:outline-none focus:ring-2 focus:ring-primary sm:p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <h3
                  id={`variant-${variant.id}-heading`}
                  className="font-heading text-heading-sm text-primary"
                >
                  Varian {index + 1}
                </h3>
                {variants.length > 1 ? (
                  <button
                    type="button"
                    onClick={() =>
                      setVariants((current) =>
                        current.filter((item) => item.id !== variant.id),
                      )
                    }
                    disabled={pending}
                    className="inline-flex min-h-10 items-center rounded-md px-2 font-body text-button text-error underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error disabled:opacity-50"
                  >
                    Hapus Varian
                  </button>
                ) : null}
              </div>

              <div
                className={`mt-4 grid gap-4 ${
                  isJersey ? "sm:grid-cols-3" : "sm:grid-cols-2"
                }`}
              >
                {isJersey ? (
                  <label className="font-body text-label-md font-semibold text-primary">
                    Jenis Jersey
                    <select
                      name="variantType"
                      value={variant.variantType ?? ""}
                      onChange={(event) => {
                        if (!pending && isJerseyVariantType(event.target.value)) {
                          const variantType = event.target.value;
                          updateVariant(variant.id, {
                            variantType,
                            material: getJerseyVariantMaterials(variantType)[0],
                          });
                        }
                      }}
                      className="mt-2 block min-h-12 w-full rounded-md border border-outline-variant bg-surface-white px-4 font-body text-body-md font-normal text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      {jerseyVariantTypes.map((variantType) => (
                        <option key={variantType} value={variantType}>
                          {jerseyVariantTypeLabels[variantType]}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : null}

                <label className="font-body text-label-md font-semibold text-primary">
                  Material
                  <select
                    name="variantMaterial"
                    aria-invalid={variantInvalid}
                    value={variant.material}
                    onChange={(event) => {
                      if (!pending) {
                        updateVariant(variant.id, {
                          material: event.target.value,
                        });
                      }
                    }}
                    className="mt-2 block min-h-12 w-full rounded-md border border-outline-variant bg-surface-white px-4 font-body text-body-md font-normal text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary aria-[invalid=true]:border-error aria-[invalid=true]:focus:ring-error"
                  >
                    {currentMaterialOptions.map((material) => (
                      <option key={material}>{material}</option>
                    ))}
                  </select>
                </label>

                <label className="font-body text-label-md font-semibold text-primary">
                  Jenis Lengan
                  <select
                    name="variantSleeveType"
                    value={variant.sleeveType}
                    onChange={(event) => {
                      if (!pending) {
                        updateVariant(variant.id, {
                          sleeveType: event.target.value,
                        });
                      }
                    }}
                    className="mt-2 block min-h-12 w-full rounded-md border border-outline-variant bg-surface-white px-4 font-body text-body-md font-normal text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {serviceVariantSleeveTypes.map((sleeveType) => (
                      <option key={sleeveType}>{sleeveType}</option>
                    ))}
                  </select>
                </label>
              </div>

              <fieldset className="mt-6 border-t border-outline-variant pt-5">
                <legend className="font-body text-label-md font-semibold text-primary">
                  Ukuran & Jumlah
                </legend>
                <p className="mt-1 font-body text-body-sm text-on-surface-variant">
                  Biarkan kosong atau isi 0 untuk ukuran yang tidak dipesan.
                </p>
                <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-6">
                  {serviceVariantSizes.map((size) => (
                    <label
                      key={size}
                      className="font-body text-label-md font-semibold text-primary"
                    >
                      {size}
                      <input
                        name={`variantSize:${size}`}
                        type="number"
                        inputMode="numeric"
                        min={0}
                        max={10000}
                        step={1}
                        value={variant.sizes[size]}
                        readOnly={pending}
                        onChange={(event) =>
                          updateVariant(variant.id, {
                            sizes: {
                              ...variant.sizes,
                              [size]: event.target.value,
                            },
                          })
                        }
                        aria-label={`Jumlah ukuran ${size}, varian ${index + 1}`}
                        className="mt-1 block min-h-11 w-full rounded-md border border-outline-variant bg-surface-white px-3 font-body text-body-md font-normal text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </label>
                  ))}
                </div>
              </fieldset>

              <p className="mt-5 border-t border-outline-variant pt-4 font-body text-body-md font-semibold text-primary">
                Subtotal Varian: {variantSubtotal} pcs
              </p>
              {variantSubtotal === 0 ? (
                <p className="mt-1 font-body text-body-sm text-error">
                  Isi minimal satu ukuran dengan jumlah lebih dari 0.
                </p>
              ) : null}
            </section>
          );
        })}
      </div>

      <button
        type="button"
        disabled={pending || variants.length >= maxServiceVariantCount}
        onClick={() => {
          setVariants((current) => [
            ...current,
            {
              id: nextId,
              variantType: isJersey ? jerseyVariantTypes[0] : null,
              material: isJersey
                ? getJerseyVariantMaterials(jerseyVariantTypes[0])[0]
                : materialOptions[0],
              sleeveType: serviceVariantSleeveTypes[0],
              sizes: emptySizes(),
            },
          ]);
          setNextId((value) => value + 1);
        }}
        className="mt-4 min-h-11 rounded-md border border-primary px-4 font-body text-button text-primary transition-colors hover:bg-surface-container-low focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50"
      >
        + Tambah Varian
      </button>

      <p
        className="mt-5 border-t border-outline-variant pt-4 font-body text-body-md font-semibold text-primary"
        aria-live="polite"
      >
        Total Pesanan: {total} pcs
      </p>
      {duplicate ? (
        <p className="mt-1 font-body text-body-sm text-error">
          {isJersey
            ? "Kombinasi jenis Jersey, material, dan jenis lengan tidak boleh sama."
            : "Kombinasi material dan jenis lengan tidak boleh sama."}
        </p>
      ) : null}
      {serverError ? (
        <p
          className="mt-2 font-body text-body-sm text-error"
          role="alert"
        >
          {serverError}
        </p>
      ) : null}
    </fieldset>
  );
}
