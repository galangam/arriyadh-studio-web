"use client";

import { usePathname } from "next/navigation";

import { getAdminPageTitle } from "@/components/admin/admin-navigation";

type AdminHeaderProps = {
  email: string | null;
};

export function AdminHeader({ email }: AdminHeaderProps) {
  const pathname = usePathname();
  const pageTitle = getAdminPageTitle(pathname);

  return (
    <header className="sticky top-0 z-20 border-b border-outline-variant bg-surface-white">
      <div className="flex h-16 min-w-0 items-center justify-between gap-3 pl-16 pr-margin-mobile md:pr-gutter lg:px-gutter">
        <p className="truncate font-heading text-heading-xs text-primary">
          {pageTitle}
        </p>

        <div className="flex min-w-0 items-center gap-3">
          {email ? (
            <span className="hidden max-w-64 truncate text-admin-caption text-on-surface-variant sm:block">
              {email}
            </span>
          ) : null}
          <span className="rounded-full border border-outline-variant bg-surface-container-low px-3 py-1 text-admin-caption font-semibold text-primary">
            Admin
          </span>
        </div>
      </div>
    </header>
  );
}
