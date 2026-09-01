export const adminProductSizes = ["S", "M", "L", "XL", "XXL", "XXXL"] as const;

export type AdminProductSize = (typeof adminProductSizes)[number];
