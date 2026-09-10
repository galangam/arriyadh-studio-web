import { briTransferAccount } from "@/lib/payments/payment-constants";

export function TransferAccount() {
  return (
    <aside
      aria-labelledby="transfer-account-heading"
      className="rounded-md border border-outline-variant bg-surface-container-low p-5 sm:p-6"
    >
      <p className="font-body text-label-md font-semibold uppercase tracking-label text-secondary">
        Rekening Pembayaran
      </p>
      <h3
        id="transfer-account-heading"
        className="mt-2 font-body text-body-sm font-semibold text-on-surface-variant"
      >
        Transfer Bank {briTransferAccount.bank}
      </h3>

      <dl className="mt-5 font-body">
        <div>
          <dt className="text-label-md text-on-surface-variant">
            Nomor Rekening
          </dt>
          <dd className="mt-1 break-all font-heading text-heading-md text-primary sm:text-heading-lg">
            {briTransferAccount.accountNumber}
          </dd>
        </div>
        <div className="mt-4 border-t border-outline-variant pt-4">
          <dt className="text-label-md text-on-surface-variant">Atas Nama</dt>
          <dd className="mt-1 text-body-md font-semibold text-primary">
            {briTransferAccount.accountName}
          </dd>
        </div>
      </dl>
    </aside>
  );
}
