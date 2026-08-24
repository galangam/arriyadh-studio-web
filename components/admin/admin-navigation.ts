export type AdminNavigationItem = {
  label: string;
  href: string;
};

export const ADMIN_NAVIGATION: readonly AdminNavigationItem[] = [
  { label: "Dashboard", href: "/admin" },
  { label: "Pesanan", href: "/admin/pesanan" },
  { label: "Produk", href: "/admin/produk" },
  { label: "Layanan", href: "/admin/layanan" },
  { label: "Produksi", href: "/admin/produksi" },
];

export function isAdminNavigationActive(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function getAdminPageTitle(pathname: string) {
  return (
    ADMIN_NAVIGATION.find((item) =>
      isAdminNavigationActive(pathname, item.href),
    )?.label ?? "Area Admin"
  );
}
