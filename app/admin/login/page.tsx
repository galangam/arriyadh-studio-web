import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { AdminLoginForm } from "@/components/admin/admin-login-form";

export const metadata: Metadata = {
  title: "Masuk Admin | Arriyadh Studio",
  description: "Halaman masuk administrator Arriyadh Studio.",
};

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-margin-mobile py-12 font-body sm:px-6 lg:py-16">
      <section
        aria-labelledby="login-heading"
        className="w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <Link
            href="/"
            aria-label="Arriyadh Studio — kembali ke beranda"
            className="inline-flex rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4"
          >
            <Image
              src="/branding/arriyadh-logo.png"
              alt="Arriyadh Studio"
              width={72}
              height={72}
              priority
              className="h-16 w-16 object-contain sm:h-[72px] sm:w-[72px]"
            />
          </Link>
          <h1
            id="login-heading"
            className="mt-5 font-heading text-heading-lg text-primary"
          >
            Masuk Admin
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-body-md text-on-surface-variant">
            Masuk untuk mengelola pesanan dan operasional Arriyadh Studio.
          </p>
        </div>

        <div className="rounded-lg border border-outline-variant bg-surface-white px-5 py-7 sm:px-8 sm:py-8">
          <AdminLoginForm />
        </div>

        <div className="mt-7 text-center">
          <Link
            href="/"
            className="inline-flex rounded-sm text-body-sm font-medium text-on-surface-variant underline decoration-outline underline-offset-4 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4"
          >
            Kembali ke situs Arriyadh Studio
          </Link>
        </div>
      </section>
    </main>
  );
}
