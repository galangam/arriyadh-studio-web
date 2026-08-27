import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/ui/container";
import { getProductOrderConfirmation } from "@/lib/orders/product-orders";

export const metadata: Metadata = {
  title: "Pesanan Berhasil | Arriyadh Studio",
  description: "Konfirmasi pesanan produk ready-stock Arriyadh Studio.",
  robots: { index: false, follow: false },
};

const rupiahFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export default async function ProductOrderConfirmationPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const order = await getProductOrderConfirmation(token);

  if (!order) notFound();

  const isTransfer = order.payment_method === "transfer";

  return (
    <main className="bg-surface-container-low py-12 text-on-surface sm:py-16 md:py-section-gap">
      <Container>
        <div className="mx-auto max-w-3xl">
          <section className="border border-outline-variant bg-surface-white p-6 sm:p-8">
            <p className="font-body text-label-md font-semibold uppercase tracking-label text-success-green">
              Pesanan Berhasil Dibuat
            </p>
            <h1 className="mt-2 font-heading text-heading-lg text-primary">
              Terima kasih, pesanan Anda sudah tercatat.
            </h1>
            <p className="mt-3 font-body text-body-md text-on-surface-variant">
              Simpan Order ID berikut untuk komunikasi dan pengecekan pesanan.
            </p>

            <div className="mt-6 bg-surface-container-low p-5">
              <p className="font-body text-label-md text-on-surface-variant">
                Order ID
              </p>
              <p className="mt-1 break-words font-heading text-heading-md text-primary">
                {order.order_code}
              </p>
            </div>

            <dl className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <dt className="font-body text-label-md text-on-surface-variant">
                  Produk
                </dt>
                <dd className="mt-1 font-body text-body-md font-semibold text-primary">
                  {order.product_name_snapshot}
                </dd>
              </div>
              <div>
                <dt className="font-body text-label-md text-on-surface-variant">
                  Ukuran
                </dt>
                <dd className="mt-1 font-body text-body-md font-semibold text-primary">
                  {order.product_size}
                </dd>
              </div>
              <div>
                <dt className="font-body text-label-md text-on-surface-variant">
                  Jumlah
                </dt>
                <dd className="mt-1 font-body text-body-md font-semibold text-primary">
                  {order.quantity} pcs
                </dd>
              </div>
              <div>
                <dt className="font-body text-label-md text-on-surface-variant">
                  Metode Pembayaran
                </dt>
                <dd className="mt-1 font-body text-body-md font-semibold text-primary">
                  {isTransfer ? "Transfer Bank BRI" : "COD"}
                </dd>
              </div>
              <div className="border-t border-outline-variant pt-5 sm:col-span-2">
                <dt className="font-body text-label-md text-on-surface-variant">
                  Total
                </dt>
                <dd className="mt-1 font-heading text-heading-md text-primary">
                  {rupiahFormatter.format(order.price)}
                </dd>
              </div>
            </dl>

            <div className="mt-6 border border-outline-variant p-5">
              <h2 className="font-heading text-heading-sm text-primary">
                Langkah Berikutnya
              </h2>
              <p className="mt-2 font-body text-body-md text-on-surface-variant">
                {isTransfer
                  ? "Lanjutkan ke halaman pembayaran untuk membayar total penuh dan mengunggah bukti transfer. Jika bukti sudah dikirim, pembayaran sedang menunggu verifikasi admin."
                  : "Pesanan COD berhasil dibuat. Siapkan pembayaran sesuai total pesanan saat pesanan diterima atau sesuai konfirmasi COD dari admin."}
              </p>
            </div>

            <Link
              href={isTransfer ? `/pembayaran/${token}` : "/produk"}
              className="mt-6 inline-flex min-h-12 items-center justify-center rounded-md bg-primary px-gutter font-body text-button text-on-primary transition-colors hover:bg-primary-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              {isTransfer ? "Lanjut ke Pembayaran" : "Kembali ke Produk"}
            </Link>
          </section>
        </div>
      </Container>
    </main>
  );
}
