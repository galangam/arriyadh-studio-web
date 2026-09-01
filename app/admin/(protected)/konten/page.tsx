import Link from "next/link";

import { requireAdmin } from "@/lib/auth/require-admin";

const contentSections = [
  {
    label: "Informasi Bisnis",
    href: "/admin/konten/informasi-bisnis",
  },
  {
    label: "Beranda",
    href: "/admin/konten/beranda",
  },
  {
    label: "Tentang Kami",
    href: "/admin/konten/tentang-kami",
  },
  {
    label: "Layanan",
    href: "/admin/konten/layanan",
  },
  {
    label: "Produk",
    href: "/admin/konten/produk",
  },
  {
    label: "Portofolio",
    href: "/admin/konten/portofolio",
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

        <nav
          aria-label="Bagian kelola konten"
          className="overflow-x-auto border-b border-outline-variant"
        >
          <ul className="flex min-w-max gap-8 px-1 pt-1">
            {contentSections.map((section) => (
              <li key={section.href}>
                <Link
                  href={section.href}
                  className="block border-b-2 border-transparent px-1 py-4 text-admin-label text-on-surface-variant transition-colors hover:border-primary hover:text-primary focus-visible:rounded-sm focus-visible:border-primary focus-visible:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
                >
                  {section.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <section
          aria-labelledby="content-empty-heading"
          className="border-b border-outline-variant py-10 md:py-12"
        >
          <h2
            id="content-empty-heading"
            className="font-heading text-heading-xs text-primary"
          >
            Pilih bagian konten
          </h2>
          <p className="mt-1.5 max-w-xl text-admin-body text-on-surface-variant">
            Gunakan navigasi di atas untuk mulai mengelola konten website
            Arriyadh Studio.
          </p>
        </section>
      </div>
    </main>
  );
}
