import Link from "next/link";

import { Container } from "@/components/ui/container";

export default function PaymentNotFound() {
  return (
    <main className="bg-surface-container-low py-section-gap text-on-surface">
      <Container>
        <section className="mx-auto max-w-xl border border-outline-variant bg-surface-white p-6 text-center sm:p-8">
          <h1 className="font-heading text-heading-md text-primary">
            Pembayaran Tidak Tersedia
          </h1>
          <p className="mt-3 font-body text-body-md text-on-surface-variant">
            Tautan pembayaran tidak valid atau pesanan tidak dapat menerima
            pembayaran saat ini.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-5 font-body text-button text-on-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Kembali ke Beranda
          </Link>
        </section>
      </Container>
    </main>
  );
}
