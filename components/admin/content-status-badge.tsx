export function ContentStatusBadge({
  active,
  activeLabel = "Aktif",
  inactiveLabel = "Nonaktif",
}: {
  active: boolean;
  activeLabel?: string;
  inactiveLabel?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-admin-caption font-semibold ${active ? "border-success-green/30 bg-success-green/10 text-success-green" : "border-outline-variant bg-surface-container-low text-on-surface-variant"}`}>
      <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-current" />
      {active ? activeLabel : inactiveLabel}
    </span>
  );
}
