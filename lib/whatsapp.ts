export const arriyadhWhatsappNumber = "6281214393252";

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

type ServiceOrderReviewWhatsappHandoff = {
  orderCode: string;
  serviceName: string | null;
};

export function createServiceOrderReviewWhatsappUrl(
  order: ServiceOrderReviewWhatsappHandoff,
) {
  const serviceName = order.serviceName ?? "Layanan custom";
  const message = [
    "Halo Admin Arriyadh Studio.",
    "",
    "Saya ingin mengonfirmasi pesanan layanan saya.",
    "",
    "Kode Pesanan: " + order.orderCode,
    "Layanan: " + serviceName,
    "Status: Menunggu peninjauan harga.",
    "",
    "Mohon pesanan saya ditinjau. Terima kasih.",
  ].join("\n");

  return createWhatsappUrl(arriyadhWhatsappNumber, message);
}

type ServicePaymentWhatsappHandoff = {
  orderCode: string;
  serviceName: string | null;
};

export function createServicePaymentWhatsappUrl(
  handoff: "transfer" | "cod",
  order: ServicePaymentWhatsappHandoff,
) {
  const serviceName = order.serviceName ?? "Layanan custom";
  const message =
    handoff === "transfer"
      ? [
          "Halo Admin Arriyadh Studio.",
          "",
          "Saya ingin mengonfirmasi pembayaran pesanan saya.",
          "",
          `Kode Pesanan: ${order.orderCode}`,
          `Layanan: ${serviceName}`,
          "Status: Bukti pembayaran sudah dikirim dan sedang menunggu verifikasi.",
          "",
          "Mohon dicek ya. Terima kasih.",
        ].join("\n")
      : [
          "Halo Admin Arriyadh Studio.",
          "",
          "Saya ingin mengonfirmasi pembayaran DP COD untuk pesanan saya.",
          "",
          `Kode Pesanan: ${order.orderCode}`,
          `Layanan: ${serviceName}`,
          "Status: Menunggu konfirmasi pembayaran DP COD.",
          "",
          "Mohon informasi jadwal/koordinasi selanjutnya. Terima kasih.",
        ].join("\n");

  return createWhatsappUrl(arriyadhWhatsappNumber, message);
}

type AdminOrderStatusWhatsappHandoff = {
  customerWhatsapp: string;
  customerName: string;
  orderCode: string;
  orderKind: "service" | "product";
  orderName: string;
  statusLabel: string;
};

export function createAdminOrderStatusWhatsappUrl(
  update: "progress" | "product_processing" | "completed" | "cancelled",
  order: AdminOrderStatusWhatsappHandoff,
) {
  const orderLabel = order.orderKind === "product" ? "Produk" : "Layanan";
  let messageLines: string[];

  if (update === "progress") {
    messageLines = [
      "Halo " + order.customerName + ",",
      "",
      "Update pesanan Arriyadh Studio:",
      "",
      "Kode Pesanan: " + order.orderCode,
      orderLabel + ": " + order.orderName,
      "Status terbaru: " + order.statusLabel,
      "",
      "Pesanan Anda sedang kami proses pada tahap tersebut.",
      "Terima kasih.",
    ];
  } else if (update === "product_processing") {
    messageLines = [
      "Halo " + order.customerName + ",",
      "",
      "Pesanan produk Anda sedang disiapkan.",
      "",
      "Kode Pesanan: " + order.orderCode,
      "Produk: " + order.orderName,
      "Status terbaru: " + order.statusLabel,
      "",
      "Terima kasih.",
    ];
  } else if (update === "completed") {
    messageLines =
      order.orderKind === "product"
        ? [
            "Halo " + order.customerName + ",",
            "",
            "Pesanan produk Anda di Arriyadh Studio telah selesai disiapkan.",
            "",
            "Kode Pesanan: " + order.orderCode,
            "Produk: " + order.orderName,
            "",
            "Silakan hubungi kami untuk koordinasi pengambilan.",
            "Terima kasih.",
          ]
        : [
            "Halo " + order.customerName + ",",
            "",
            "Pesanan Anda di Arriyadh Studio telah selesai.",
            "",
            "Kode Pesanan: " + order.orderCode,
            "Layanan: " + order.orderName,
            "",
            "Silakan hubungi kami untuk koordinasi pengambilan atau informasi selanjutnya.",
            "Terima kasih.",
          ];
  } else {
    messageLines = [
      "Halo " + order.customerName + ",",
      "",
      "Kami ingin menginformasikan bahwa pesanan berikut telah dibatalkan:",
      "",
      "Kode Pesanan: " + order.orderCode,
      orderLabel + ": " + order.orderName,
      "",
      "Untuk informasi lebih lanjut mengenai pembayaran atau refund jika ada, silakan hubungi admin Arriyadh Studio.",
      "",
      "Terima kasih.",
    ];
  }

  return createWhatsappUrl(order.customerWhatsapp, messageLines.join("\n"));
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
