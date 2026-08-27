import { demoProductTransferAccount } from "@/lib/payments/payment-constants";

export function DemoTransferAccount() {
  return (
    <aside
      aria-labelledby="demo-transfer-account-heading"
      className="mt-6 border border-status-amber/40 bg-surface-container-low p-5"
    >
      <p className="font-body text-label-md font-semibold uppercase tracking-label text-status-amber">
        Rekening Demo
      </p>
      <h3
        id="demo-transfer-account-heading"
        className="mt-1 font-heading text-heading-sm text-primary"
      >
        Informasi Transfer Demonstrasi
      </h3>
      <p className="mt-2 font-body text-body-sm text-on-surface-variant">
        Data berikut hanya untuk demonstrasi dan bukan rekening resmi.
      </p>
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
          <dt className="text-on-surface-variant">Nama Rekening</dt>
          <dd className="mt-1 font-semibold text-primary">
            {demoProductTransferAccount.accountName}
          </dd>
        </div>
      </dl>
    </aside>
  );
}
