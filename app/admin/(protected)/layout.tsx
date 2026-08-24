import type { ReactNode } from "react";

import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { requireAdmin } from "@/lib/auth/require-admin";

type ProtectedAdminLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default async function ProtectedAdminLayout({
  children,
}: ProtectedAdminLayoutProps) {
  const admin = await requireAdmin();

  return (
    <div className="min-h-screen bg-surface font-heading text-on-surface">
      <AdminSidebar />
      <div className="min-w-0 lg:pl-64">
        <AdminHeader email={admin.email} />
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
