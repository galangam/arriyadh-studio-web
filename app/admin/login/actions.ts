"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type AdminLoginState = {
  error: string | null;
};

const INVALID_CREDENTIALS_MESSAGE = "Email atau kata sandi tidak valid.";

export async function loginAdmin(
  _previousState: AdminLoginState,
  formData: FormData,
): Promise<AdminLoginState> {
  const email = formData.get("email");
  const password = formData.get("password");

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    email.trim() === "" ||
    password === ""
  ) {
    return { error: INVALID_CREDENTIALS_MESSAGE };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error || !data.user) {
    return { error: INVALID_CREDENTIALS_MESSAGE };
  }

  if (data.user.app_metadata?.role !== "admin") {
    await supabase.auth.signOut();
    return { error: INVALID_CREDENTIALS_MESSAGE };
  }

  redirect("/admin");
}
