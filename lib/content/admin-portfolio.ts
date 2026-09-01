import "server-only";

import { resolveContentImageUrl } from "@/lib/content/content-images";
import { createClient } from "@/lib/supabase/server";

export type AdminPortfolioItem = {
  id: string;
  service_id: string | null;
  title: string;
  description: string | null;
  image_url: string;
  image_preview_url: string;
  is_published: boolean;
  sort_order: number;
  created_at: string;
};

type AdminPortfolioRow = Omit<
  AdminPortfolioItem,
  "image_preview_url" | "sort_order"
> & {
  sort_order: number | string;
};

const adminPortfolioColumns =
  "id, service_id, title, description, image_url, is_published, sort_order, created_at";

async function normalizePortfolioItem(
  row: AdminPortfolioRow,
): Promise<AdminPortfolioItem> {
  const sortOrder = Number(row.sort_order);
  if (!Number.isSafeInteger(sortOrder) || sortOrder < 0) {
    throw new Error("Invalid portfolio sort order returned by the database.");
  }

  return {
    ...row,
    sort_order: sortOrder,
    image_preview_url:
      (await resolveContentImageUrl(row.image_url)) ?? row.image_url,
  };
}

export async function getAdminPortfolioItems(): Promise<AdminPortfolioItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("portfolio")
    .select(adminPortfolioColumns)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true })
    .returns<AdminPortfolioRow[]>();

  if (error || !data) {
    throw new Error("Daftar portofolio gagal dimuat.");
  }

  return Promise.all(data.map(normalizePortfolioItem));
}

export async function getAdminPortfolioItemById(
  id: string,
): Promise<AdminPortfolioItem | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("portfolio")
    .select(adminPortfolioColumns)
    .eq("id", id)
    .maybeSingle<AdminPortfolioRow>();

  if (error) {
    throw new Error("Item portofolio gagal dimuat.");
  }

  return data ? normalizePortfolioItem(data) : null;
}
