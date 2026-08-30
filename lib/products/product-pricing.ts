export type ProductVariant = {
  id: string;
  product_id: string;
  material: string;
  sleeve_type: string | null;
  base_unit_price: number;
  large_size_surcharge: number;
};

export function calculateProductUnitPrice(
  variant: Pick<
    ProductVariant,
    "base_unit_price" | "large_size_surcharge"
  >,
  size: string,
) {
  const surcharge = ["XXL", "XXXL"].includes(size)
    ? variant.large_size_surcharge
    : 0;

  return variant.base_unit_price + surcharge;
}

export function findProductVariant(
  variants: ProductVariant[],
  material: string,
  sleeveType: string,
) {
  return variants.find(
    (variant) =>
      variant.material === material &&
      (variant.sleeve_type ?? "") === sleeveType,
  );
}

export function getProductStartingPrice(
  catalogPrice: number,
  variants: ProductVariant[],
) {
  if (variants.length === 0) return catalogPrice;
  return Math.min(...variants.map((variant) => variant.base_unit_price));
}

export function getProductAvailabilitySupport(slug: string) {
  if (slug === "kaos-polos-premium") {
    return {
      label: "Lihat Pilihan Warna via WhatsApp",
      message:
        "Halo Arriyadh Studio, saya ingin melihat pilihan warna Kaos Polos yang tersedia.",
    };
  }

  if (slug === "celana-kolor-santai") {
    return {
      label: "Lihat Pilihan Motif via WhatsApp",
      message:
        "Halo Arriyadh Studio, saya ingin melihat pilihan motif Celana Kolor yang tersedia.",
    };
  }

  return null;
}
