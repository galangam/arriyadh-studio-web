import "server-only";

import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";

export type AdminDesignReferenceUrlResult =
  | { ok: true; signedUrl: string }
  | { ok: false; error: string };

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type DesignReferenceRow = {
  order_id: string;
  storage_path: string;
};

export async function getAdminDesignReferenceSignedUrl(
  referenceId: string,
): Promise<AdminDesignReferenceUrlResult> {
  await requireAdmin();

  if (!uuidPattern.test(referenceId)) {
    return { ok: false, error: "Referensi desain tidak tersedia." };
  }

  const supabase = createAdminClient();
  const { data: reference, error: referenceError } = await supabase
    .from("order_design_references")
    .select("order_id, storage_path")
    .eq("id", referenceId)
    .maybeSingle<DesignReferenceRow>();

  if (referenceError || !reference) {
    return { ok: false, error: "Referensi desain tidak tersedia." };
  }

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id")
    .eq("id", reference.order_id)
    .eq("order_kind", "service")
    .maybeSingle<{ id: string }>();

  if (orderError || !order) {
    return { ok: false, error: "Referensi desain tidak tersedia." };
  }

  const { data, error } = await supabase.storage
    .from("design-references")
    .createSignedUrl(reference.storage_path, 300);

  if (error || !data?.signedUrl) {
    return { ok: false, error: "Referensi desain tidak tersedia." };
  }

  return { ok: true, signedUrl: data.signedUrl };
}
