export default function Home() {
  return (
    <main className="min-h-screen bg-background text-on-background">
      <section className="mx-auto max-w-content px-margin-mobile py-section-gap md:px-gutter">
        <div className="space-y-gutter rounded-xl border border-outline-variant bg-surface-white p-gutter">

          <div>
            <p className="font-body text-label-md text-secondary">
              TERPERCAYA SEJAK 2010
            </p>

            <h1 className="mt-base font-heading text-display-lg text-primary">
              Solusi Konveksi & Sablon Terbaik di Subang
            </h1>

            <p className="mt-base max-w-2xl font-body text-body-lg text-on-surface-variant">
              Kualitas premium untuk seragam, kaos, dan
              merchandise custom Anda.
            </p>
          </div>

          <div>
            <h2 className="font-heading text-heading-lg text-primary">
              Layanan Kami
            </h2>

            <p className="mt-base font-body text-body-md text-on-surface-variant">
              Produksi pakaian custom dengan standar
              pengerjaan profesional.
            </p>
          </div>

          <div>
            <h3 className="font-heading text-heading-md">
              Konveksi & Sablon
            </h3>

            <p className="font-body text-body-sm text-on-surface-variant">
              Produksi pakaian massal dengan kualitas premium.
            </p>
          </div>

          <div className="flex flex-wrap gap-base">
            <button
              type="button"
              className="rounded-lg bg-primary px-4 py-3 font-body text-button text-on-primary"
            >
              Pesan Sekarang
            </button>

            <span className="rounded-full bg-success-green px-3 py-1 font-body text-label-md text-white">
              SELESAI
            </span>
          </div>

          <hr className="border-outline-variant" />

          <div>
            <p className="font-heading text-admin-caption text-secondary">
              ADMIN TYPOGRAPHY
            </p>

            <h2 className="font-heading text-admin-title">
              Halo, Admin Arriyadh
            </h2>

            <p className="font-heading text-admin-body text-on-surface-variant">
              Ringkasan aktivitas produksi hari ini.
            </p>
          </div>

        </div>
      </section>
    </main>
  );
}