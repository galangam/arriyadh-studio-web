import { demoProductTransferAccount } from "@/lib/payments/payment-constants";

export function DemoTransferAccount() {
  return (
    <aside
      aria-labelledby="demo-transfer-account-heading"
      className="rounded-md border border-outline-variant bg-surface-container-low p-5 sm:p-6"
    >
      <p className="font-body text-label-md font-semibold uppercase tracking-label text-secondary">
        Rekening Pembayaran
      </p>
      <h3
        id="demo-transfer-account-heading"
        className="mt-2 font-body text-body-sm font-semibold text-on-surface-variant"
      >
        Transfer Bank BRI
      </h3>

      <dl className="mt-5 font-body">
        <div>
          <dt className="text-label-md text-on-surface-variant">
            Nomor Rekening
          </dt>
          <dd className="mt-1 break-all font-heading text-heading-md text-primary sm:text-heading-lg">
            {demoProductTransferAccount.accountNumber}
          </dd>
        </div>
        <div className="mt-4 border-t border-outline-variant pt-4">
          <dt className="text-label-md text-on-surface-variant">Atas Nama</dt>
          <dd className="mt-1 text-body-md font-semibold text-primary">
            {demoProductTransferAccount.accountName}
          </dd>
        </div>
      </dl>

      <p className="mt-5 border border-status-amber/40 bg-status-amber/10 px-4 py-3 font-body text-body-sm text-on-surface-variant">
        Catatan pengembangan: rekening yang ditampilkan merupakan data demo dan
        belum boleh dianggap sebagai rekening pembayaran produksi.
      </p>
    </aside>
  );
}
