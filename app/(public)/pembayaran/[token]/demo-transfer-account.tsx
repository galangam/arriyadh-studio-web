import { demoProductTransferAccount } from "@/lib/payments/payment-constants";

export function DemoTransferAccount() {
  return (
    <aside
      aria-labelledby="demo-transfer-account-heading"
      className="border border-outline-variant bg-surface-container-low p-5"
    >
      <p className="font-body text-label-md font-semibold uppercase tracking-label text-secondary">
        Informasi Rekening
      </p>
      <h3
        id="demo-transfer-account-heading"
        className="mt-1 font-heading text-heading-sm text-primary"
      >
        Transfer Bank BRI
      </h3>
      
        <dl className="mt-4 grid gap-3 font-body text-body-sm sm:grid-cols-3">
        <div>
          <dt className="text-on-surface-variant">Bank</dt>
          <dd className="mt-1 font-semibold text-primary">
            {demoProductTransferAccount.bank}
          </dd>
        </div>
        <div>
          <dt className="text-on-surface-variant">Nomor Rekening</dt>
          <dd className="mt-1 break-all font-semibold text-primary">
            {demoProductTransferAccount.accountNumber}
          </dd>
        </div>
        <div>
          <dt className="text-on-surface-variant">Atas Nama</dt>
          <dd className="mt-1 font-semibold text-primary">
            {demoProductTransferAccount.accountName}
          </dd>
        </div>
      </dl>

      <p className="mt-4 border-t border-status-amber/40 pt-4 font-body text-body-sm text-on-surface-variant">
        Catatan pengembangan: rekening yang ditampilkan merupakan data demo dan
        belum boleh dianggap sebagai rekening pembayaran produksi.
      </p>
    </aside>
  );
}
