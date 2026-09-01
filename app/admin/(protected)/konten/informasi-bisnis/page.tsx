import Link from "next/link";

import { SiteSettingsForm } from "@/app/admin/(protected)/konten/informasi-bisnis/site-settings-form";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getSiteSettings } from "@/lib/content/site-settings";

export default async function BusinessInformationPage() {
  await requireAdmin();
  const settings = await getSiteSettings();

  return (
    <main className="w-full px-margin-mobile py-8 md:px-gutter md:py-10">
      <div className="mx-auto w-full max-w-content">
        <Link href="/admin/konten" className="text-admin-label text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
          Kembali ke Kelola Konten
        </Link>
        <section aria-labelledby="business-information-heading" className="mt-6 border-b border-outline-variant pb-6">
          <h1 id="business-information-heading" className="font-heading text-admin-title text-primary">
            Informasi Bisnis
          </h1>
          <p className="mt-2 max-w-2xl text-admin-body text-on-surface-variant">
            Kelola informasi kontak dan tautan sosial yang ditampilkan pada website publik.
          </p>
        </section>
        <SiteSettingsForm settings={settings} />
      </div>
    </main>
  );
}
