import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabasePublishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl) {
    throw new Error(
      "Missing environment variable: NEXT_PUBLIC_SUPABASE_URL"
    );
  }

  if (!supabasePublishableKey) {
    throw new Error(
      "Missing environment variable: NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
    );
  }

  return createServerClient(
    supabaseUrl,
    supabasePublishableKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },

        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(
              ({ name, value, options }) => {
                cookieStore.set(name, value, options);
              }
            );
          } catch {
            /*
             * setAll() bisa dipanggil dari Server Component,
             * sementara Server Component tidak selalu dapat
             * menulis cookie.
             *
             * Ini aman diabaikan karena refresh session
             * ditangani oleh proxy.ts.
             */
          }
        },
      },
    }
  );
}