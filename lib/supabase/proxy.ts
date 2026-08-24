import { createServerClient } from "@supabase/ssr";
import {
  NextResponse,
  type NextRequest,
} from "next/server";

const SUPABASE_AUTH_CACHE_HEADERS = [
  "cache-control",
  "expires",
  "pragma",
] as const;

function copySupabaseAuthState(
  sourceResponse: NextResponse,
  targetResponse: NextResponse
) {
  sourceResponse.cookies
    .getAll()
    .forEach((cookie) => {
      targetResponse.cookies.set(cookie);
    });

  SUPABASE_AUTH_CACHE_HEADERS.forEach(
    (headerName) => {
      const headerValue =
        sourceResponse.headers.get(headerName);

      if (headerValue) {
        targetResponse.headers.set(
          headerName,
          headerValue
        );
      }
    }
  );
}

export async function updateSession(
  request: NextRequest
) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

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

  const supabase = createServerClient(
    supabaseUrl,
    supabasePublishableKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },

        setAll(cookiesToSet, headers) {
          /*
           * Simpan cookie baru ke request agar Server Components
           * mendapatkan session terbaru.
           */
          cookiesToSet.forEach(
            ({ name, value }) => {
              request.cookies.set(name, value);
            }
          );

          /*
           * Buat response baru menggunakan request
           * yang sudah memiliki cookie terbaru.
           */
          supabaseResponse = NextResponse.next({
            request,
          });

          /*
           * Kirim cookie session terbaru ke browser.
           */
          cookiesToSet.forEach(
            ({ name, value, options }) => {
              supabaseResponse.cookies.set(
                name,
                value,
                options
              );
            }
          );

          /*
           * Salin header yang dibutuhkan Supabase.
           */
          Object.entries(headers).forEach(
            ([key, value]) => {
              supabaseResponse.headers.set(
                key,
                value
              );
            }
          );
        },
      },
    }
  );

  /*
   * PENTING:
   *
   * Jangan memasukkan logic apa pun antara
   * createServerClient() dan getClaims().
   *
   * getClaims() memvalidasi JWT/session yang digunakan
   * untuk authorization.
   */
  const { data } =
    await supabase.auth.getClaims();

  const claims = data?.claims;

  const pathname = request.nextUrl.pathname;

  const isAdminRoute =
    pathname === "/admin" ||
    pathname.startsWith("/admin/");

  const isAdminLoginRoute =
    pathname === "/admin/login";

  /*
   * Semua halaman publik Arriyadh Studio tetap terbuka.
   *
   * Hanya route /admin yang membutuhkan autentikasi
   * dan role admin.
   */
  if (
    isAdminRoute &&
    !isAdminLoginRoute
  ) {
    const userRole =
      claims?.app_metadata?.role;

    if (!claims || userRole !== "admin") {
      const loginUrl = request.nextUrl.clone();

      loginUrl.pathname = "/admin/login";
      loginUrl.search = "";

      const redirectResponse =
        NextResponse.redirect(loginUrl);

      /*
       * Pertahankan cookie yang mungkin baru saja
       * di-refresh Supabase.
       */
      copySupabaseAuthState(
        supabaseResponse,
        redirectResponse
      );

      return redirectResponse;
    }
  }

  /*
   * Jika admin sudah login dan membuka /admin/login,
   * arahkan langsung ke dashboard.
   */
  if (
    isAdminLoginRoute &&
    claims?.app_metadata?.role === "admin"
  ) {
    const adminUrl = request.nextUrl.clone();

    adminUrl.pathname = "/admin";
    adminUrl.search = "";

    const redirectResponse =
      NextResponse.redirect(adminUrl);

    copySupabaseAuthState(
      supabaseResponse,
      redirectResponse
    );

    return redirectResponse;
  }

  return supabaseResponse;
}