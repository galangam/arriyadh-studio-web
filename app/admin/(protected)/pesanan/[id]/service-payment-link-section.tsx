"use client";

import { useState } from "react";

import { WhatsappMessagePreview } from "@/components/admin/whatsapp-message-preview";

type ServicePaymentLinkSectionProps = {
  paymentUrl: string;
  message: string;
  whatsappUrl: string;
};

export function ServicePaymentLinkSection({ paymentUrl, message, whatsappUrl }: ServicePaymentLinkSectionProps) {
  const [copyLabel, setCopyLabel] = useState("Salin Link Pembayaran");

  async function copyPaymentLink() {
    try {
      await navigator.clipboard.writeText(paymentUrl);
      setCopyLabel("Link Tersalin");
    } catch {
      setCopyLabel("Gagal Menyalin");
    }
  }

  return (
    <section aria-labelledby="service-payment-link-heading" className="border border-outline-variant bg-surface-white p-5 md:p-6">
      <h2 id="service-payment-link-heading" className="font-heading text-admin-section text-primary">Kirim Link Pembayaran</h2>
      <p className="mt-2 max-w-2xl text-admin-body text-on-surface-variant">Bagikan link ini kepada pelanggan agar mereka dapat memilih transfer atau COD dan menyelesaikan proses DP.</p>
      <div className="mt-5">
        <WhatsappMessagePreview message={message} />
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" onClick={copyPaymentLink} className="inline-flex min-h-11 w-full items-center justify-center rounded-md border border-outline px-4 text-admin-label font-semibold text-primary hover:bg-surface-container-low focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:w-auto">{copyLabel}</button>
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 w-full items-center justify-center rounded-md border border-outline-variant px-4 text-admin-label font-semibold text-primary hover:bg-surface-container-low focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:w-auto">Kirim via WhatsApp</a>
      </div>
    </section>
  );
}
