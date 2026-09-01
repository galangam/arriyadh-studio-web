import { requireAdmin } from "@/lib/auth/require-admin";
import {
  getAdminOrdersForExport,
  getOrderSnapshotName,
  orderKindLabels,
  parseAdminOrderFilters,
  type AdminOrderListRow,
} from "@/lib/orders/admin-orders";
import { orderStatusLabels } from "@/lib/orders/order-status";

const csvHeaders = [
  "Order ID",
  "Tanggal",
  "Nama Pelanggan",
  "Nomor WhatsApp",
  "Tipe Pesanan",
  "Layanan / Produk",
  "Jumlah",
  "Total Harga",
  "Metode Pembayaran",
  "Status",
] as const;

const jakartaCsvDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Jakarta",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function escapeCsvCell(
  value: string | number | null,
  options: { forceText?: boolean } = {},
) {
  let cell = value === null ? "" : String(value);

  if (
    cell &&
    (options.forceText === true || /^\s*[=+\-@]/.test(cell))
  ) {
    cell = "'" + cell;
  }

  return /[",\r\n]/.test(cell) ? `"${cell.replaceAll('"', '""')}"` : cell;
}

function getPaymentMethodLabel(paymentMethod: string | null) {
  if (paymentMethod === "transfer") return "Transfer";
  if (paymentMethod === "cod") return "COD";
  return "";
}

function serializeOrderRow(order: AdminOrderListRow) {
  return [
    escapeCsvCell(order.order_code, { forceText: true }),
    escapeCsvCell(jakartaCsvDateFormatter.format(new Date(order.created_at))),
    escapeCsvCell(order.customer_name),
    escapeCsvCell(order.customer_whatsapp, { forceText: true }),
    escapeCsvCell(orderKindLabels[order.order_kind]),
    escapeCsvCell(getOrderSnapshotName(order)),
    escapeCsvCell(order.quantity),
    escapeCsvCell(order.price),
    escapeCsvCell(getPaymentMethodLabel(order.payment_method)),
    escapeCsvCell(orderStatusLabels[order.status]),
  ].join(",");
}

function getJakartaDateForFilename(now = new Date()) {
  return jakartaCsvDateFormatter.format(now);
}

export async function GET(request: Request) {
  await requireAdmin();
  const searchParams = new URL(request.url).searchParams;
  const filters = parseAdminOrderFilters({
    q: searchParams.get("q") ?? undefined,
    status: searchParams.get("status") ?? undefined,
    type: searchParams.get("type") ?? undefined,
  });
  const result = await getAdminOrdersForExport(filters);

  if (!result.ok) {
    return new Response("Data pesanan tidak dapat diekspor saat ini.", {
      status: 500,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const csv = [
    csvHeaders.map((header) => escapeCsvCell(header)).join(","),
    ...result.orders.map(serializeOrderRow),
  ].join("\r\n");
  const filename = `arriyadh-orders-${getJakartaDateForFilename()}.csv`;

  return new Response("\uFEFF" + csv, {
    headers: {
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Type": "text/csv; charset=utf-8",
      "Cache-Control": "private, no-store",
    },
  });
}
