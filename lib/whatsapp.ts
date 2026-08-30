export const arriyadhWhatsappNumber = "6281214719630";

export function normalizeWhatsappNumber(value: string) {
  const digits = value.replace(/\D/g, "");

  if (digits.startsWith("62")) return digits;
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;

  return digits;
}

export function createWhatsappUrl(phoneNumber: string, message: string) {
  const normalizedNumber = normalizeWhatsappNumber(phoneNumber);
  return `https://wa.me/${normalizedNumber}?text=${encodeURIComponent(message)}`;
}

type ProductOrderWhatsappHandoff = {
  orderCode: string;
  productName: string;
  material: string | null;
  sleeveType: string | null;
  size: string;
  quantity: number;
  total: number;
};

const productTotalFormatter = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 0,
});

export function createProductOrderWhatsappUrl(
  handoff: "transfer" | "cod",
  order: ProductOrderWhatsappHandoff,
) {
  const introduction =
    handoff === "transfer"
      ? `Halo Arriyadh Studio, saya sudah mengirim bukti pembayaran untuk pesanan ${order.orderCode}.`
      : `Halo Arriyadh Studio, saya sudah membuat pesanan COD dengan kode ${order.orderCode}.`;
  const closing =
    handoff === "transfer"
      ? "Mohon dicek dan dikonfirmasi. Terima kasih."
      : "Mohon konfirmasi pesanan dan informasi pengambilannya. Terima kasih.";
  const detailLines = [
    `Produk: ${order.productName}`,
    order.material ? `Bahan: ${order.material}` : null,
    order.sleeveType ? `Lengan: ${order.sleeveType}` : null,
    `Ukuran: ${order.size}`,
    `Jumlah: ${order.quantity} pcs`,
    `Total: Rp${productTotalFormatter.format(order.total)}`,
  ].filter((line): line is string => line !== null);

  return createWhatsappUrl(
    arriyadhWhatsappNumber,
    `${introduction}\n\n${detailLines.join("\n")}\n\n${closing}`,
  );
}
