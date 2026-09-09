import { CodConfirmationControl } from "@/app/admin/(protected)/pesanan/[id]/payment-verification-controls";
import { WhatsappMessagePreview } from "@/components/admin/whatsapp-message-preview";
import {
  WhatsappActionIcon,
  whatsappActionClassName,
} from "@/components/ui/whatsapp-action";
import type { AdminOrderDetail } from "@/lib/orders/admin-orders";
import { createAdminServiceCodDpWhatsappUrl } from "@/lib/whatsapp";

export function ServiceCodDpConfirmationSection({
  order,
}: {
  order: AdminOrderDetail;
}) {
  if (
    order.order_kind !== "service" ||
    order.payment_method !== "cod" ||
    order.status !== "menunggu_konfirmasi_dp" ||
    order.dp_amount === null
  ) {
    return null;
  }

  const whatsappUrl = createAdminServiceCodDpWhatsappUrl({
    customerWhatsapp: order.customer_whatsapp,
    customerName: order.customer_name,
    orderCode: order.order_code,
    serviceName: order.service_name_snapshot,
    dpAmount: order.dp_amount,
  });
  const whatsappMessage =
    new URL(whatsappUrl).searchParams.get("text") ?? "";

  return (
    <section
      id="confirm-service-cod-dp"
      aria-labelledby="confirm-service-cod-dp-heading"
      className="scroll-mt-24 border border-primary/30 bg-surface-white p-5 md:p-6"
    >
      <p className="text-admin-caption font-semibold uppercase tracking-label text-on-surface-variant">
        Tindakan berikutnya
      </p>
      <h2
        id="confirm-service-cod-dp-heading"
        className="mt-1 font-heading text-admin-section text-primary"
      >
        Konfirmasi Pembayaran DP COD
      </h2>
      <p className="mt-2 max-w-2xl text-admin-body text-on-surface-variant">
        Hubungi pelanggan untuk menentukan cara pembayaran DP. DP dapat
        dibayarkan langsung di workshop atau melalui pertemuan yang disepakati
        bersama. Produksi hanya dapat dimulai setelah DP diterima.
      </p>

      <div className="mt-5">
        <WhatsappMessagePreview message={whatsappMessage} />
      </div>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`${whatsappActionClassName} mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-md px-5 text-center text-admin-label font-semibold sm:w-auto`}
      >
        <WhatsappActionIcon />
        Hubungi Pelanggan via WhatsApp
      </a>

      <div className="mt-5 border-t border-outline-variant pt-5">
        <p className="max-w-2xl text-admin-body text-on-surface-variant">
          Konfirmasikan hanya setelah pembayaran DP COD benar-benar diterima.
        </p>
        <CodConfirmationControl orderId={order.id} />
      </div>
    </section>
  );
}
