export const designOrientedServiceSlugs = [
  "sablon",
  "kaos",
  "kemeja",
  "jersey",
] as const;

export const structuredVariantServiceSlugs = [
  "sablon",
  "kaos",
  "kemeja",
  "jersey",
] as const;

export type StructuredVariantServiceSlug =
  (typeof structuredVariantServiceSlugs)[number];

export const jerseyVariantTypes = ["jersey", "jersey_embos"] as const;
export type JerseyVariantType = (typeof jerseyVariantTypes)[number];

export const jerseyVariantTypeLabels: Record<JerseyVariantType, string> = {
  jersey: "Jersey",
  jersey_embos: "Jersey Embos",
};

export const jerseyVariantMaterialsByType = {
  jersey: [
    "Dryfit Milano",
    "Dryfit Adidas",
    "Dryfit MU",
    "Dryfit Wafel",
    "Dryfit Nike Brazil",
    "Dryfit Puma",
    "Dryfit Benzema",
  ],
  jersey_embos: ["Dryfit Toppo", "Dryfit Straw", "Dryfit Toppo Grafi"],
} as const satisfies Record<JerseyVariantType, readonly string[]>;

export const serviceVariantMaterialsBySlug = {
  sablon: ["Cotton Combed 24s", "Cotton Combed 30s"],
  kaos: ["Cotton Combed 24s", "Cotton Combed 30s"],
  kemeja: ["Japan Drill", "American Drill"],
  jersey: [
    ...jerseyVariantMaterialsByType.jersey,
    ...jerseyVariantMaterialsByType.jersey_embos,
  ],
} as const satisfies Record<StructuredVariantServiceSlug, readonly string[]>;

export const serviceVariantSleeveTypes = [
  "Lengan Pendek",
  "Lengan Panjang",
] as const;

export const serviceVariantSizes = [
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "XXXL",
] as const;

export const maxServiceVariantCount = 8;
export const maxServiceOrderQuantity = 10000;

export const serviceDesignReferenceRequirements = {
  sablon: "required",
  kaos: "required",
  kemeja: "required",
  jersey: "required",
  lainnya: "optional",
  permak: "unsupported",
} as const;

export type DesignReferenceRequirement =
  | "required"
  | "optional"
  | "unsupported";

export type ServiceVariantSizeInput = {
  size: string;
  quantity: number;
};

export type ServiceVariantInput = {
  variantType: string | null;
  material: string;
  sleeveType: string;
  sizes: ServiceVariantSizeInput[];
};

export function isDesignOrientedService(slug: string) {
  return designOrientedServiceSlugs.some(
    (designSlug) => designSlug === slug,
  );
}

export function getDesignReferenceRequirement(
  slug: string,
): DesignReferenceRequirement {
  return slug in serviceDesignReferenceRequirements
    ? serviceDesignReferenceRequirements[
        slug as keyof typeof serviceDesignReferenceRequirements
      ]
    : "unsupported";
}

export function allowsDesignReference(slug: string) {
  return getDesignReferenceRequirement(slug) !== "unsupported";
}

export function requiresDesignReference(slug: string) {
  return getDesignReferenceRequirement(slug) === "required";
}

export function usesServiceVariants(
  slug: string,
): slug is StructuredVariantServiceSlug {
  return structuredVariantServiceSlugs.some(
    (variantSlug) => variantSlug === slug,
  );
}

export function getServiceVariantMaterials(slug: string) {
  return usesServiceVariants(slug)
    ? serviceVariantMaterialsBySlug[slug]
    : null;
}

export function getServiceVariantHeading(slug: string) {
  if (slug === "kemeja") return "Rincian Kemeja";
  if (slug === "jersey") return "Rincian Jersey";
  return "Rincian Kaos";
}

export function isJerseyVariantType(
  value: string,
): value is JerseyVariantType {
  return jerseyVariantTypes.some((variantType) => variantType === value);
}

export function getJerseyVariantMaterials(variantType: JerseyVariantType) {
  return jerseyVariantMaterialsByType[variantType];
}

export function getJerseyVariantTypeLabel(value: string | null) {
  return value && isJerseyVariantType(value)
    ? jerseyVariantTypeLabels[value]
    : "Jersey";
}

export function isServiceVariantSleeveType(value: string) {
  return serviceVariantSleeveTypes.some(
    (sleeveType) => sleeveType === value,
  );
}

export function isServiceVariantSize(value: string) {
  return serviceVariantSizes.some((size) => size === value);
}
