import "server-only";

import { createClient } from "@/lib/supabase/server";

const absoluteUrlPattern = /^https?:\/\//i;

export async function resolveContentImageUrl(
  value: string | null,
): Promise<string | null> {
  const imageValue = value?.trim();

  if (!imageValue || imageValue.startsWith("/") || absoluteUrlPattern.test(imageValue)) {
    return imageValue || null;
  }

  const objectPath = imageValue.replace(/^content-images\//, "");
  const supabase = await createClient();
  const { data } = supabase.storage.from("content-images").getPublicUrl(objectPath);

  return data.publicUrl;
}
