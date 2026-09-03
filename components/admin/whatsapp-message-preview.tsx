export function WhatsappMessagePreview({ message }: { message: string }) {
  return (
    <div>
      <p className="text-admin-caption font-semibold uppercase tracking-label text-on-surface-variant">
        Pesan yang akan dikirim
      </p>
      <div
        aria-label="Pratinjau pesan WhatsApp, hanya baca"
        className="mt-2 max-w-3xl whitespace-pre-wrap break-words rounded-md border border-outline-variant bg-surface-container-low px-4 py-3 text-admin-body leading-relaxed text-on-surface"
      >
        {message}
      </div>
    </div>
  );
}
