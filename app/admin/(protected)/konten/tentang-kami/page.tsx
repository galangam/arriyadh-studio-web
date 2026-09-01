import Link from "next/link";

import { AboutContentForm } from "@/app/admin/(protected)/konten/tentang-kami/about-content-form";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getAboutContent } from "@/lib/content/about-content";

export default async function AboutAdminPage() {
  await requireAdmin();
  const content = await getAboutContent();

  return (
    <main className="w-full px-margin-mobile py-8 md:px-gutter md:py-10">
      <div className="mx-auto w-full max-w-content">
        <Link href="/admin/konten" className="text-admin-label text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
          Kembali ke Kelola Konten
        </Link>
        <section aria-labelledby="about-admin-heading" className="mt-6 border-b border-outline-variant pb-6">
          <h1 id="about-admin-heading" className="font-heading text-admin-title text-primary">
            Tentang Kami
          </h1>
          <p className="mt-2 max-w-2xl text-admin-body text-on-surface-variant">
            Kelola pengantar, profil, keunggulan, dan informasi visual workshop pada halaman Tentang Kami.
          </p>
        </section>

        <div className="py-8">
          <AboutContentForm content={content} />
        </div>
      </div>
    </main>
  );
}
