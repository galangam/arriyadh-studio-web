import "server-only";

import { redirect } from "next/navigation";
import { cache } from "react";

import { createClient } from "@/lib/supabase/server";

export type AuthenticatedAdmin = {
  id: string;
  email: string | null;
  role: "admin";
};

export const requireAdmin = cache(async (): Promise<AuthenticatedAdmin> => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (error || !claims || claims.app_metadata?.role !== "admin") {
    redirect("/admin/login");
  }

  return {
    id: claims.sub,
    email: typeof claims.email === "string" ? claims.email : null,
    role: "admin",
  };
});
