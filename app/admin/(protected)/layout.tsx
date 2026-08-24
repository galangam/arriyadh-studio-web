import type { ReactNode } from "react";

import { requireAdmin } from "@/lib/auth/require-admin";

type ProtectedAdminLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default async function ProtectedAdminLayout({
  children,
}: ProtectedAdminLayoutProps) {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-surface font-body text-on-surface">
      {children}
    </div>
  );
}
