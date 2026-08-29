import "server-only";

import { createClient } from "@/lib/supabase/server";

export const publicServiceFlows = ["konveksi_sablon", "permak"] as const;

export type PublicServiceFlow = (typeof publicServiceFlows)[number];

export type PublicService = {
  id: string;
  slug: string;
  name: string;
  flow: PublicServiceFlow;
  description: string | null;
  image_url: string | null;
};

type ServiceRow = Omit<PublicService, "flow"> & { flow: string };

const publicServiceColumns = "id, slug, name, flow, description, image_url";

function isPublicServiceFlow(value: string): value is PublicServiceFlow {
  return publicServiceFlows.some((flow) => flow === value);
}

function normalizeService(row: ServiceRow): PublicService {
  if (!isPublicServiceFlow(row.flow)) {
    throw new Error("Unsupported service flow returned by the database.");
  }

  return { ...row, flow: row.flow };
}

export async function getActiveServices(): Promise<PublicService[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("services")
    .select(publicServiceColumns)
    .eq("is_active", true)
    .neq("slug", "jersey-embos")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true })
    .returns<ServiceRow[]>();

  if (error || !data) {
    throw new Error("Active services could not be loaded.");
  }

  return data.map(normalizeService);
}

export async function getActiveServiceBySlug(
  slug: string,
): Promise<PublicService | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("services")
    .select(publicServiceColumns)
    .eq("slug", slug)
    .neq("slug", "jersey-embos")
    .eq("is_active", true)
    .maybeSingle<ServiceRow>();

  if (error) throw new Error("Service could not be loaded.");

  return data ? normalizeService(data) : null;
}

export async function getActiveServiceById(
  id: string,
): Promise<PublicService | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("services")
    .select(publicServiceColumns)
    .eq("id", id)
    .eq("is_active", true)
    .maybeSingle<ServiceRow>();

  if (error) throw new Error("Service could not be loaded.");

  return data ? normalizeService(data) : null;
}
