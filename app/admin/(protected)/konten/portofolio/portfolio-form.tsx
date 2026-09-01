"use client";

import Image from "next/image";
import { useActionState, useState } from "react";

import {
  createPortfolioItem,
  updatePortfolioItem,
  type PortfolioFormState,
} from "@/app/admin/(protected)/konten/portofolio/actions";
import type { AdminPortfolioItem } from "@/lib/content/admin-portfolio";

type ServiceOption = {
  id: string;
  name: string;
  isActive: boolean;
};

type PortfolioFormProps = {
  item?: AdminPortfolioItem;
  services: ServiceOption[];
};

const initialState: PortfolioFormState = {
  status: "idle",
  message: null,
  errors: {},
};

const fieldClassName =
  "mt-2 w-full rounded-md border border-outline-variant bg-surface-white px-4 py-3 text-admin-body text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/60 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20";

export function PortfolioForm({ item, services }: PortfolioFormProps) {
  const action = item
    ? updatePortfolioItem.bind(null, item.id)
    : createPortfolioItem;
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [isPublished, setIsPublished] = useState(item?.is_published ?? true);

  return (
    <form action={formAction} className="space-y-6">
      {item ? (
        <div className="relative aspect-[16/9] max-w-xl overflow-hidden border border-outline-variant bg-surface-container-low">
          <Image src={item.image_preview_url} alt={item.title} fill unoptimized={item.image_preview_url.startsWith("http")} sizes="(min-width: 768px) 576px, 100vw" className="object-cover" />
        </div>
      ) : null}

      <div>
        <label htmlFor="title" className="text-admin-label text-primary">
          Judul <span aria-hidden="true">*</span>
        </label>
        <input id="title" name="title" type="text" required maxLength={180} defaultValue={item?.title ?? ""} aria-invalid={Boolean(state.errors.title)} aria-describedby={state.errors.title ? "title-error" : undefined} className={fieldClassName} />
        {state.errors.title ? <p id="title-error" className="mt-1.5 text-admin-caption text-error">{state.errors.title}</p> : null}
      </div>

      <div>
        <label htmlFor="description" className="text-admin-label text-primary">
          Deskripsi
        </label>
        <textarea id="description" name="description" rows={4} maxLength={2000} defaultValue={item?.description ?? ""} aria-invalid={Boolean(state.errors.description)} aria-describedby={state.errors.description ? "description-error" : undefined} className={fieldClassName} />
        {state.errors.description ? <p id="description-error" className="mt-1.5 text-admin-caption text-error">{state.errors.description}</p> : null}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label htmlFor="service_id" className="text-admin-label text-primary">
            Layanan Terkait
          </label>
          <select id="service_id" name="service_id" defaultValue={item?.service_id ?? ""} aria-invalid={Boolean(state.errors.service_id)} aria-describedby={state.errors.service_id ? "service-id-error" : undefined} className={fieldClassName}>
            <option value="">Tidak terkait layanan tertentu</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name}{service.isActive ? "" : " (Nonaktif)"}
              </option>
            ))}
          </select>
          {state.errors.service_id ? <p id="service-id-error" className="mt-1.5 text-admin-caption text-error">{state.errors.service_id}</p> : null}
        </div>

        <div>
          <label htmlFor="sort_order" className="text-admin-label text-primary">
            Urutan Tampil <span aria-hidden="true">*</span>
          </label>
          <input id="sort_order" name="sort_order" type="number" inputMode="numeric" min={0} max={100000} step={1} required defaultValue={item?.sort_order ?? 0} aria-invalid={Boolean(state.errors.sort_order)} aria-describedby={state.errors.sort_order ? "sort-order-error" : undefined} className={fieldClassName} />
          {state.errors.sort_order ? <p id="sort-order-error" className="mt-1.5 text-admin-caption text-error">{state.errors.sort_order}</p> : null}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label htmlFor="portfolio_image" className="text-admin-label text-primary">
            {item ? "Gambar Pengganti" : "Gambar Portofolio"}
            {!item ? <span aria-hidden="true"> *</span> : null}
          </label>
          <input id="portfolio_image" name="portfolio_image" type="file" required={!item} accept="image/jpeg,image/png,image/webp" aria-invalid={Boolean(state.errors.portfolio_image)} aria-describedby={state.errors.portfolio_image ? "portfolio-image-error" : "portfolio-image-help"} className={`${fieldClassName} file:mr-4 file:rounded-md file:border-0 file:bg-surface-container file:px-3 file:py-2 file:text-admin-label file:text-primary`} />
          <p id="portfolio-image-help" className="mt-1.5 text-admin-caption text-on-surface-variant">
            JPEG, PNG, atau WebP. Maksimal 5 MiB.{item ? " Kosongkan untuk mempertahankan gambar saat ini." : ""}
          </p>
          {state.errors.portfolio_image ? <p id="portfolio-image-error" className="mt-1.5 text-admin-caption text-error">{state.errors.portfolio_image}</p> : null}
        </div>

        <div>
          <span className="text-admin-label text-primary">Status Publikasi</span>
          <label className="mt-2 flex min-h-12 items-center gap-3 border border-outline-variant bg-surface-white px-4 py-3 text-admin-body text-on-surface">
            <input name="is_published" type="checkbox" checked={isPublished} onChange={(event) => setIsPublished(event.target.checked)} className="size-4 accent-primary" />
            {isPublished ? "Dipublikasikan" : "Disembunyikan"}
          </label>
        </div>
      </div>

      <div className="border-t border-outline-variant pt-6">
        <div aria-live="polite" aria-atomic="true" className="min-h-6">
          {state.message ? (
            <p className={state.status === "success" ? "text-admin-body text-success-green" : "text-admin-body text-error"}>
              {state.message}
            </p>
          ) : null}
        </div>
        <button type="submit" disabled={isPending} className="mt-4 min-h-12 rounded-md bg-primary px-6 text-admin-label text-on-primary transition-colors hover:bg-primary-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60">
          {isPending ? "Menyimpan..." : item ? "Simpan Perubahan" : "Tambah Portofolio"}
        </button>
      </div>
    </form>
  );
}
