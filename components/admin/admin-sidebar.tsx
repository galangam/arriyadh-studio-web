"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";

import { logoutAdmin } from "@/app/admin/(protected)/actions";
import {
  ADMIN_NAVIGATION,
  isAdminNavigationActive,
} from "@/components/admin/admin-navigation";

type AdminNavigationProps = {
  onNavigate?: () => void;
};

function LogoutButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="flex min-h-10 w-full items-center px-4 text-left text-admin-body font-medium text-inverse-on-surface transition-colors hover:bg-on-primary/5 hover:text-on-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inverse-primary focus-visible:ring-inset disabled:cursor-wait disabled:opacity-70"
    >
      {pending ? "Keluar..." : "Keluar"}
    </button>
  );
}

function AdminNavigation({ onNavigate }: AdminNavigationProps) {
  const pathname = usePathname();

  return (
    <nav aria-label="Navigasi admin" className="mt-7 flex-1">
      <ul className="space-y-0.5">
        {ADMIN_NAVIGATION.map((item) => {
          const isActive = isAdminNavigationActive(pathname, item.href);

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                onClick={onNavigate}
                className={`flex min-h-10 items-center border-l-2 px-4 text-admin-body font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inverse-primary focus-visible:ring-inset ${
                  isActive
                    ? "border-on-primary bg-on-primary/10 text-on-primary"
                    : "border-transparent text-inverse-on-surface hover:bg-on-primary/5 hover:text-on-primary"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function SidebarContent({ onNavigate }: AdminNavigationProps) {
  return (
    <div className="flex h-full flex-col px-5 py-5">
      <Link
        href="/admin"
        onClick={onNavigate}
        className="flex items-center gap-3 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inverse-primary focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center">
          <Image
            src="/branding/arriyadh-logo.png"
            alt=""
            width={32}
            height={36}
            className="h-8 w-auto object-contain invert"
          />
        </span>
        <span className="min-w-0">
          <span className="block truncate font-heading text-admin-body font-semibold text-on-primary">
            Arriyadh Studio
          </span>
          <span className="block text-admin-caption text-inverse-on-surface">
            Panel Admin
          </span>
        </span>
      </Link>

      <AdminNavigation onNavigate={onNavigate} />

      <form action={logoutAdmin} className="border-t border-on-primary/15 pt-3">
        <LogoutButton />
      </form>
    </div>
  );
}

export function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
    requestAnimationFrame(() => menuButtonRef.current?.focus());
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeMenu();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeMenu, isOpen]);

  return (
    <>
      <button
        ref={menuButtonRef}
        type="button"
        aria-label="Buka navigasi admin"
        aria-controls="admin-mobile-navigation"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(true)}
        className="fixed left-4 top-3 z-40 flex h-10 w-10 items-center justify-center rounded-md border border-outline-variant bg-surface-white text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 lg:hidden"
      >
        <span aria-hidden="true" className="space-y-1.5">
          <span className="block h-0.5 w-5 bg-current" />
          <span className="block h-0.5 w-5 bg-current" />
          <span className="block h-0.5 w-5 bg-current" />
        </span>
      </button>

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-on-primary/10 bg-primary lg:block">
        <SidebarContent />
      </aside>

      <button
        type="button"
        tabIndex={-1}
        aria-label="Tutup navigasi admin"
        onClick={closeMenu}
        className={`fixed inset-0 z-40 bg-primary/55 transition-opacity lg:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        id="admin-mobile-navigation"
        aria-label="Menu admin"
        aria-hidden={!isOpen}
        inert={!isOpen}
        className={`fixed inset-y-0 left-0 z-50 w-[min(18rem,calc(100vw-3rem))] bg-primary transition-transform duration-200 lg:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          ref={closeButtonRef}
          type="button"
          aria-label="Tutup navigasi admin"
          onClick={closeMenu}
          className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-md text-on-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inverse-primary"
        >
          <span aria-hidden="true" className="text-2xl leading-none">
            ×
          </span>
        </button>
        <SidebarContent onNavigate={closeMenu} />
      </aside>
    </>
  );
}
