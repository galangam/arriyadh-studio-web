"use client";

import { useActionState, useState } from "react";

import {
  updateService,
  type ServiceFormState,
} from "@/app/admin/(protected)/konten/layanan/[id]/actions";
import type { AdminService } from "@/lib/services/admin-services";

const initialState: ServiceFormState = {
  status: "idle",
  message: null,
  errors: {},
};

const fieldClassName =
  "mt-2 w-full rounded-md border border-outline-variant bg-surface-white px-4 py-3 text-admin-body text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/60 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20";

const flowLabels = {
  konveksi_sablon: "Konveksi / Sablon",
  permak: "Permak",
} as const;

export function ServiceForm({ service }: { service: AdminService }) {
  const updateCurrentService = updateService.bind(null, service.id);
  const [state, formAction, isPending] = useActionState(
    updateCurrentService,
    initialState,
  );
  const [isActive, setIsActive] = useState(service.is_active);

  function confirmDeactivation(event: React.FormEvent<HTMLFormElement>) {
    if (
      service.is_active &&
      !isActive &&
      !window.confirm(
        "Menonaktifkan layanan akan menyembunyikannya dari halaman publik dan mencegah pesanan baru untuk layanan tersebut. Pesanan lama tetap tersimpan. Lanjutkan?",
      )
    ) {
      event.preventDefault();
    }
  }

  return (
    <form action={formAction} onSubmit={confirmDeactivation} className="space-y-8">
      <section aria-labelledby="service-system-fields" className="space-y-5">
        <div>
          <h2 id="service-system-fields" className="font-heading text-heading-xs text-primary">
            Informasi Sistem
          </h2>
          <p className="mt-1.5 text-admin-body text-on-surface-variant">
            Slug dan alur layanan dikendalikan sistem karena terhubung dengan route, persyaratan pesanan, serta workflow produksi.
          </p>
        </div>
        <dl className="grid gap-5 md:grid-cols-2">
          <div>
            <dt className="text-admin-label text-primary">Slug</dt>
            <dd className="mt-2 border border-outline-variant bg-surface-container-low px-4 py-3 font-mono text-admin-body text-on-surface-variant">
              {service.slug}
            </dd>
          </div>
          <div>
            <dt className="text-admin-label text-primary">Flow / Alur Layanan</dt>
            <dd className="mt-2 border border-outline-variant bg-surface-container-low px-4 py-3 text-admin-body text-on-surface-variant">
              {flowLabels[service.flow]} ({service.flow})
            </dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="service-editable-fields" className="space-y-6 border-t border-outline-variant pt-8">
        <h2 id="service-editable-fields" className="font-heading text-heading-xs text-primary">
          Informasi Katalog
        </h2>

        <div>
          <label htmlFor="name" className="text-admin-label text-primary">
            Nama Layanan <span aria-hidden="true">*</span>
          </label>
          <input id="name" name="name" type="text" required maxLength={160} defaultValue={service.name} aria-invalid={Boolean(state.errors.name)} aria-describedby={state.errors.name ? "name-error" : undefined} className={fieldClassName} />
          {state.errors.name ? <p id="name-error" className="mt-1.5 text-admin-caption text-error">{state.errors.name}</p> : null}
        </div>

        <div>
          <label htmlFor="description" className="text-admin-label text-primary">
            Deskripsi
          </label>
          <textarea id="description" name="description" rows={5} maxLength={2000} defaultValue={service.description ?? ""} aria-invalid={Boolean(state.errors.description)} aria-describedby={state.errors.description ? "description-error" : undefined} className={fieldClassName} />
          {state.errors.description ? <p id="description-error" className="mt-1.5 text-admin-caption text-error">{state.errors.description}</p> : null}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label htmlFor="image_url" className="text-admin-label text-primary">
              Nilai Gambar Layanan
            </label>
            <input id="image_url" name="image_url" type="text" maxLength={2048} defaultValue={service.image_url ?? ""} aria-invalid={Boolean(state.errors.image_url)} aria-describedby={state.errors.image_url ? "image-url-error" : "image-url-help"} className={fieldClassName} />
            <p id="image-url-help" className="mt-1.5 text-admin-caption text-on-surface-variant">
              Nilai saat ini dipertahankan jika tidak diubah dan tidak ada upload baru.
            </p>
            {state.errors.image_url ? <p id="image-url-error" className="mt-1.5 text-admin-caption text-error">{state.errors.image_url}</p> : null}
          </div>
          <div>
            <label htmlFor="service_image" className="text-admin-label text-primary">
              Gambar Layanan
            </label>
            <input id="service_image" name="service_image" type="file" accept="image/jpeg,image/png,image/webp" aria-invalid={Boolean(state.errors.service_image)} aria-describedby={state.errors.service_image ? "service-image-error" : "service-image-help"} className={`${fieldClassName} file:mr-4 file:rounded-md file:border-0 file:bg-surface-container file:px-3 file:py-2 file:text-admin-label file:text-primary`} />
            <p id="service-image-help" className="mt-1.5 text-admin-caption text-on-surface-variant">
              JPEG, PNG, atau WebP. Maksimal 5 MiB.
            </p>
            {state.errors.service_image ? <p id="service-image-error" className="mt-1.5 text-admin-caption text-error">{state.errors.service_image}</p> : null}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label htmlFor="sort_order" className="text-admin-label text-primary">
              Urutan Tampil <span aria-hidden="true">*</span>
            </label>
            <input id="sort_order" name="sort_order" type="number" inputMode="numeric" min={0} max={100000} step={1} required defaultValue={service.sort_order} aria-invalid={Boolean(state.errors.sort_order)} aria-describedby={state.errors.sort_order ? "sort-order-error" : undefined} className={fieldClassName} />
            {state.errors.sort_order ? <p id="sort-order-error" className="mt-1.5 text-admin-caption text-error">{state.errors.sort_order}</p> : null}
          </div>

          <div>
            <span className="text-admin-label text-primary">Status Aktif</span>
            <label className="mt-2 flex min-h-12 items-center gap-3 border border-outline-variant bg-surface-white px-4 py-3 text-admin-body text-on-surface">
              <input name="is_active" type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} className="size-4 accent-primary" />
              {isActive ? "Aktif — tampil di halaman publik" : "Nonaktif — disembunyikan dari halaman publik"}
            </label>
          </div>
        </div>
      </section>

      <div className="border-t border-outline-variant pt-6">
        <div aria-live="polite" aria-atomic="true" className="min-h-6">
          {state.message ? (
            <p className={state.status === "success" ? "text-admin-body text-success-green" : "text-admin-body text-error"}>
              {state.message}
            </p>
          ) : null}
        </div>
        <button type="submit" disabled={isPending} className="mt-4 min-h-12 rounded-md bg-primary px-6 text-admin-label text-on-primary transition-colors hover:bg-primary-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60">
          {isPending ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </div>
    </form>
  );
}
