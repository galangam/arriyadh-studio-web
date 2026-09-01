import "server-only";

import {
  publicServiceFlows,
  type PublicServiceFlow,
} from "@/lib/services/public-services";
import { createClient } from "@/lib/supabase/server";

export type AdminService = {
  id: string;
  slug: string;
  name: string;
  flow: PublicServiceFlow;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
};

type AdminServiceRow = Omit<AdminService, "flow" | "sort_order"> & {
  flow: string;
  sort_order: number | string;
};

const adminServiceColumns =
  "id, slug, name, flow, description, image_url, is_active, sort_order";

function normalizeAdminService(row: AdminServiceRow): AdminService {
  if (!publicServiceFlows.some((flow) => flow === row.flow)) {
    throw new Error("Unsupported service flow returned by the database.");
  }

  const sortOrder = Number(row.sort_order);
  if (!Number.isSafeInteger(sortOrder) || sortOrder < 0) {
    throw new Error("Invalid service sort order returned by the database.");
  }

  return {
    ...row,
    flow: row.flow as PublicServiceFlow,
    sort_order: sortOrder,
  };
}

export async function getAdminServices(): Promise<AdminService[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("services")
    .select(adminServiceColumns)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true })
    .returns<AdminServiceRow[]>();

  if (error || !data) {
    throw new Error("Daftar layanan gagal dimuat.");
  }

  return data.map(normalizeAdminService);
}

export async function getAdminServiceById(
  id: string,
): Promise<AdminService | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("services")
    .select(adminServiceColumns)
    .eq("id", id)
    .maybeSingle<AdminServiceRow>();

  if (error) {
    throw new Error("Layanan gagal dimuat.");
  }

  return data ? normalizeAdminService(data) : null;
}
