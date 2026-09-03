import { ProductCodConfirmationControl } from "@/app/admin/(protected)/pesanan/[id]/payment-verification-controls";
import type { AdminOrderDetail } from "@/lib/orders/admin-orders";

export function ProductCodConfirmationSection({
  order,
}: {
  order: AdminOrderDetail;
}) {
  if (
    order.order_kind !== "product" ||
    order.payment_method !== "cod" ||
    order.status !== "menunggu_verifikasi"
  ) {
    return null;
  }

  return (
    <section
      id="confirm-product-cod"
      aria-labelledby="confirm-product-cod-heading"
      className="scroll-mt-24 border border-primary/30 bg-surface-white p-5 md:p-6"
    >
      <p className="text-admin-caption font-semibold uppercase tracking-label text-on-surface-variant">
        Tindakan berikutnya
      </p>
      <h2
        id="confirm-product-cod-heading"
        className="mt-1 font-heading text-admin-section text-primary"
      >
        Konfirmasi Pesanan COD
      </h2>
      <p className="mt-2 max-w-2xl text-admin-body text-on-surface-variant">
        Konfirmasi pesanan COD untuk mulai menyiapkan produk ready-stock.
      </p>
      <ProductCodConfirmationControl orderId={order.id} />
    </section>
  );
}
