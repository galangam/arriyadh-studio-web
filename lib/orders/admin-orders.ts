import "server-only";

import { notFound } from "next/navigation";

import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";

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

export const productionStatuses = [
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
] as const satisfies readonly OrderStatus[];

export const paymentVerificationStatuses = [
  "menunggu_konfirmasi_dp",
  "menunggu_verifikasi",
] as const satisfies readonly OrderStatus[];

export const orderKindLabels = {
  product: "Produk",
  service: "Layanan Custom",
} as const;

export type OrderKind = keyof typeof orderKindLabels;

export const statusFilterOptions = [
  { value: "all", label: "Semua Status" },
  { value: "menunggu_harga", label: "Menunggu Harga" },
  {
    value: "menunggu_pembayaran_dp",
    label: "Menunggu Pembayaran DP",
  },
  {
    value: "menunggu_verifikasi_pembayaran",
    label: "Menunggu Verifikasi Pembayaran",
  },
  { value: "produksi", label: "Produksi" },
  { value: "diproses", label: "Diproses" },
  { value: "selesai", label: "Selesai" },
  { value: "dibatalkan", label: "Dibatalkan" },
] as const;

export type OrderStatusFilter = (typeof statusFilterOptions)[number]["value"];

export const typeFilterOptions = [
  { value: "all", label: "Semua Tipe" },
  { value: "product", label: "Produk" },
  { value: "service", label: "Layanan Custom" },
] as const;

export type OrderTypeFilter = (typeof typeFilterOptions)[number]["value"];

export type AdminOrderFilters = {
  q: string;
  status: OrderStatusFilter;
  type: OrderTypeFilter;
  page: number;
};

export type AdminOrderListRow = {
  id: string;
  order_code: string;
  order_kind: OrderKind;
  status: OrderStatus;
  customer_name: string;
  customer_whatsapp: string;
  product_name_snapshot: string | null;
  product_size: string | null;
  service_name_snapshot: string | null;
  quantity: number;
  price: number | null;
  created_at: string;
};

export type AdminOrderDetail = {
  id: string;
  order_code: string;
  order_kind: OrderKind;
  status: OrderStatus;
  customer_name: string;
  customer_whatsapp: string;
  customer_company: string | null;
  customer_email: string | null;
  shipping_address: string | null;
  service_name_snapshot: string | null;
  service_flow: string | null;
  material: string | null;
  job_description: string | null;
  product_name_snapshot: string | null;
  product_size: string | null;
  quantity: number;
  unit_price: number | null;
  price: number | null;
  dp_amount: number | null;
  payment_method: string | null;
  payment_proof_path: string | null;
  payment_verified_at: string | null;
  quoted_at: string | null;
  cancellation_reason: string | null;
  cancelled_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type RecentOrder = Pick<
  AdminOrderListRow,
  | "id"
  | "order_code"
  | "order_kind"
  | "status"
  | "customer_name"
  | "product_name_snapshot"
  | "service_name_snapshot"
  | "created_at"
>;

export type DashboardMetrics = {
  awaitingPrice: number;
  awaitingVerification: number;
  inProduction: number;
  completedThisMonth: number;
};

export type AdminDashboardData =
  | {
      ok: true;
      metrics: DashboardMetrics;
      recentOrders: RecentOrder[];
    }
  | { ok: false };

export type AdminOrdersPageData =
  | {
      ok: true;
      orders: AdminOrderListRow[];
      totalCount: number;
      totalOrderCount: number;
      page: number;
      pageSize: number;
      totalPages: number;
    }
  | { ok: false };

export const adminOrdersPageSize = 10;

const jakartaDateFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeZone: "Asia/Jakarta",
});

const jakartaDateTimeFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Jakarta",
});

const rupiahFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

function firstSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function isStatusFilter(value: string): value is OrderStatusFilter {
  return statusFilterOptions.some((option) => option.value === value);
}

function isTypeFilter(value: string): value is OrderTypeFilter {
  return typeFilterOptions.some((option) => option.value === value);
}

function sanitizeSearch(value: string) {
  return value
    .trim()
    .slice(0, 80)
    .replace(/[^\p{L}\p{N}\s+_-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function parseAdminOrderFilters(searchParams: {
  q?: string | string[];
  status?: string | string[];
  type?: string | string[];
  page?: string | string[];
}): AdminOrderFilters {
  const rawStatus = firstSearchParam(searchParams.status) ?? "all";
  const rawType = firstSearchParam(searchParams.type) ?? "all";
  const rawPage = firstSearchParam(searchParams.page) ?? "1";
  const parsedPage = /^\d+$/.test(rawPage) ? Number(rawPage) : 1;

  return {
    q: sanitizeSearch(firstSearchParam(searchParams.q) ?? ""),
    status: isStatusFilter(rawStatus) ? rawStatus : "all",
    type: isTypeFilter(rawType) ? rawType : "all",
    page: Number.isSafeInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1,
  };
}

function getJakartaMonthRange(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "numeric",
  }).formatToParts(now);
  const year = Number(parts.find((part) => part.type === "year")?.value);
  const month = Number(parts.find((part) => part.type === "month")?.value);
  const jakartaOffsetMilliseconds = 7 * 60 * 60 * 1000;

  return {
    start: new Date(
      Date.UTC(year, month - 1, 1) - jakartaOffsetMilliseconds,
    ).toISOString(),
    end: new Date(
      Date.UTC(year, month, 1) - jakartaOffsetMilliseconds,
    ).toISOString(),
  };
}

export function formatAdminOrderDate(value: string) {
  return jakartaDateFormatter.format(new Date(value));
}

export function formatAdminOrderDateTime(value: string) {
  return jakartaDateTimeFormatter.format(new Date(value)) + " WIB";
}

export function formatOrderPrice(value: number | null) {
  return value === null ? "Menunggu harga" : rupiahFormatter.format(value);
}

export function getOrderSnapshotName(
  order: Pick<
    AdminOrderListRow,
    "order_kind" | "product_name_snapshot" | "service_name_snapshot"
  >,
) {
  const snapshot =
    order.order_kind === "product"
      ? order.product_name_snapshot
      : order.service_name_snapshot;

  return snapshot ?? orderKindLabels[order.order_kind];
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  await requireAdmin();
  const supabase = await createClient();
  const monthRange = getJakartaMonthRange();

  const [
    awaitingPrice,
    awaitingVerification,
    inProduction,
    completedThisMonth,
    recentOrders,
  ] = await Promise.all([
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("status", "menunggu_harga"),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("status", "menunggu_verifikasi"),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .in("status", [...productionStatuses]),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("status", "selesai")
      .gte("completed_at", monthRange.start)
      .lt("completed_at", monthRange.end),
    supabase
      .from("orders")
      .select(
        "id, order_code, order_kind, status, customer_name, service_name_snapshot, product_name_snapshot, created_at",
      )
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .limit(5)
      .returns<RecentOrder[]>(),
  ]);

  const responses = [
    awaitingPrice,
    awaitingVerification,
    inProduction,
    completedThisMonth,
    recentOrders,
  ];

  if (
    responses.some((response) => response.error) ||
    awaitingPrice.count === null ||
    awaitingVerification.count === null ||
    inProduction.count === null ||
    completedThisMonth.count === null ||
    recentOrders.data === null
  ) {
    return { ok: false };
  }

  return {
    ok: true,
    metrics: {
      awaitingPrice: awaitingPrice.count,
      awaitingVerification: awaitingVerification.count,
      inProduction: inProduction.count,
      completedThisMonth: completedThisMonth.count,
    },
    recentOrders: recentOrders.data,
  };
}

export async function getAdminOrdersPage(
  filters: AdminOrderFilters,
): Promise<AdminOrdersPageData> {
  await requireAdmin();
  const supabase = await createClient();

  function createFilteredQuery(page: number) {
    const from = (page - 1) * adminOrdersPageSize;
    const to = from + adminOrdersPageSize - 1;
    let query = supabase
      .from("orders")
      .select(
        "id, order_code, order_kind, status, customer_name, customer_whatsapp, product_name_snapshot, product_size, service_name_snapshot, quantity, price, created_at",
        { count: "exact" },
      );

    if (filters.q) {
      const searchPattern = `%${filters.q}%`;
      query = query.or(
        `order_code.ilike.${searchPattern},customer_name.ilike.${searchPattern},customer_whatsapp.ilike.${searchPattern}`,
      );
    }

    if (filters.status === "produksi") {
      query = query.in("status", [...productionStatuses]);
    } else if (filters.status === "menunggu_verifikasi_pembayaran") {
      query = query.in("status", [...paymentVerificationStatuses]);
    } else if (filters.status !== "all") {
      query = query.eq("status", filters.status);
    }

    if (filters.type !== "all") {
      query = query.eq("order_kind", filters.type);
    }

    return query
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .range(from, to)
      .returns<AdminOrderListRow[]>();
  }

  const [initialOrders, allOrders] = await Promise.all([
    createFilteredQuery(filters.page),
    supabase.from("orders").select("id", { count: "exact", head: true }),
  ]);

  if (
    initialOrders.error ||
    allOrders.error ||
    initialOrders.count === null ||
    initialOrders.data === null ||
    allOrders.count === null
  ) {
    return { ok: false };
  }

  const totalCount = initialOrders.count;
  const totalPages = Math.max(1, Math.ceil(totalCount / adminOrdersPageSize));
  const page = Math.min(filters.page, totalPages);
  let orders = initialOrders.data;

  if (page !== filters.page) {
    const correctedOrders = await createFilteredQuery(page);

    if (correctedOrders.error || correctedOrders.data === null) {
      return { ok: false };
    }

    orders = correctedOrders.data;
  }

  return {
    ok: true,
    orders,
    totalCount,
    totalOrderCount: allOrders.count,
    page,
    pageSize: adminOrdersPageSize,
    totalPages: totalCount === 0 ? 0 : totalPages,
  };
}

export async function getAdminOrderDetail(
  id: string,
): Promise<AdminOrderDetail> {
  await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, order_code, order_kind, status, customer_name, customer_whatsapp, customer_company, customer_email, shipping_address, service_name_snapshot, service_flow, material, job_description, product_name_snapshot, product_size, quantity, unit_price, price, dp_amount, payment_method, payment_proof_path, payment_verified_at, quoted_at, cancellation_reason, cancelled_at, completed_at, created_at, updated_at",
    )
    .eq("id", id)
    .maybeSingle<AdminOrderDetail>();

  if (error || !data) {
    notFound();
  }

  return data;
}
