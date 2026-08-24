import { requireAdmin } from "@/lib/auth/require-admin";

export default async function AdminDashboardPage() {
  await requireAdmin();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-content items-center px-margin-mobile py-12 md:px-gutter">
      <section aria-labelledby="dashboard-heading" className="max-w-2xl">
        <p className="text-label-md font-medium uppercase tracking-wider text-on-surface-variant">
          Arriyadh Studio
        </p>
        <h1
          id="dashboard-heading"
          className="mt-3 font-heading text-heading-lg text-primary"
        >
          Dashboard Admin
        </h1>
        <p className="mt-4 text-body-lg text-on-surface-variant">
          Selamat datang. Panel pengelolaan admin akan dibangun pada tahap
          berikutnya.
        </p>
      </section>
    </main>
  );
}
