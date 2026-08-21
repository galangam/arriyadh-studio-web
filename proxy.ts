import { type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(
  request: NextRequest
) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Jalankan Proxy untuk route aplikasi,
     * tetapi skip static assets Next.js
     * dan file gambar.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};