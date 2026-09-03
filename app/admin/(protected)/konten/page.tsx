import Link from "next/link";

import { requireAdmin } from "@/lib/auth/require-admin";

const contentSections = [
  {
    label: "Informasi Bisnis",
    href: "/admin/konten/informasi-bisnis",
    description: "Identitas, kontak, lokasi, dan media sosial.",
    group: "Informasi & Halaman Utama",
  },
  {
    label: "Beranda",
    href: "/admin/konten/beranda",
    description: "Hero, pengantar, dan konten unggulan beranda.",
    group: "Informasi & Halaman Utama",
  },
  {
    label: "Tentang Kami",
    href: "/admin/konten/tentang-kami",
    description: "Profil, sejarah, dan informasi workshop.",
    group: "Informasi & Halaman Utama",
  },
  {
    label: "Layanan",
    href: "/admin/konten/layanan",
    description: "Daftar dan informasi layanan yang ditawarkan.",
    group: "Katalog",
  },
  {
    label: "Produk",
    href: "/admin/konten/produk",
    description: "Produk ready stock, varian, dan harga.",
    group: "Katalog",
  },
  {
    label: "Portofolio",
    href: "/admin/konten/portofolio",
    description: "Dokumentasi hasil pekerjaan Arriyadh Studio.",
    group: "Portofolio",
  },
] as const;

export default async function AdminContentPage() {
  await requireAdmin();

  return (
    <main className="w-full px-margin-mobile py-8 md:px-gutter md:py-10">
      <div className="mx-auto w-full max-w-content">
        <section
          aria-labelledby="content-heading"
          className="border-b border-outline-variant pb-6"
        >
          <h1
            id="content-heading"
            className="font-heading text-admin-title text-primary"
          >
            Kelola Konten
          </h1>
          <p className="mt-2 max-w-2xl text-admin-body text-on-surface-variant">
            Atur informasi publik dan portofolio Arriyadh Studio.
          </p>
        </section>

        <nav aria-label="Bagian kelola konten" className="mt-8 space-y-9">
          {["Informasi & Halaman Utama", "Katalog", "Portofolio"].map((group) => (
            <section key={group} aria-labelledby={`content-${group.toLowerCase().replaceAll(" ", "-").replace("&", "dan")}`}>
              <h2 id={`content-${group.toLowerCase().replaceAll(" ", "-").replace("&", "dan")}`} className="font-heading text-heading-xs text-primary">
                {group}
              </h2>
              <ul className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {contentSections.filter((section) => section.group === group).map((section) => (
                  <li key={section.href}>
                    <Link href={section.href} className="group flex h-full min-h-32 flex-col justify-between rounded-md border border-outline-variant bg-surface-white p-5 transition-colors hover:border-primary/40 hover:bg-surface-container-low focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
                      <span>
                        <span className="block font-heading text-admin-section text-primary">{section.label}</span>
                        <span className="mt-1.5 block text-admin-body text-on-surface-variant">{section.description}</span>
                      </span>
                      <span className="mt-4 text-admin-label font-semibold text-primary">Edit konten <span aria-hidden="true">→</span></span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </nav>
      </div>
    </main>
  );
}
