export const orderStatuses = [
  "menunggu_harga",
  "menunggu_pembayaran_dp",
  "menunggu_konfirmasi_dp",
  "menunggu_verifikasi",
  "sample_mockup",
  "desain",
  "pecah_warna",
  "potong",
  "sablon",
  "jahit",
  "iron",
  "packing",
  "diterima",
  "dikerjakan",
  "quality_check",
  "diproses",
  "selesai",
  "dibatalkan",
] as const;

export type OrderStatus = (typeof orderStatuses)[number];

export const orderStatusLabels: Record<OrderStatus, string> = {
  menunggu_harga: "Menunggu Harga",
  menunggu_pembayaran_dp: "Menunggu Pembayaran DP",
  menunggu_konfirmasi_dp: "Menunggu Konfirmasi DP",
  menunggu_verifikasi: "Menunggu Verifikasi",
  sample_mockup: "Sample / Mockup",
  desain: "Desain",
  pecah_warna: "Pecah Warna",
  potong: "Potong",
  sablon: "Sablon",
  jahit: "Jahit",
  iron: "Iron",
  packing: "Packing",
  diterima: "Diterima",
  dikerjakan: "Dikerjakan",
  quality_check: "Quality Check",
  diproses: "Diproses",
  selesai: "Selesai",
  dibatalkan: "Dibatalkan",
};

export function isOrderStatus(value: string): value is OrderStatus {
  return orderStatuses.some((status) => status === value);
}
