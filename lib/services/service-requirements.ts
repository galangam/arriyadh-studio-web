export const designOrientedServiceSlugs = [
  "sablon",
  "kaos",
  "kemeja",
  "jersey",
] as const;

export function isDesignOrientedService(slug: string) {
  return designOrientedServiceSlugs.some(
    (designSlug) => designSlug === slug,
  );
}

export function allowsDesignReference(slug: string) {
  return isDesignOrientedService(slug) || slug === "lainnya";
}
