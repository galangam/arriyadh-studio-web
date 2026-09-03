"use client";

import { useActionState } from "react";

import {
  updateSiteSettings,
  type SiteSettingsFormState,
} from "@/app/admin/(protected)/konten/informasi-bisnis/actions";
import type { SiteSettings } from "@/lib/content/site-settings";

const initialState: SiteSettingsFormState = {
  status: "idle",
  message: null,
  errors: {},
};

type FieldProps = {
  name: keyof SiteSettings;
  label: string;
  value: string | null;
  error?: string;
  required?: boolean;
  type?: "text" | "email" | "url" | "tel";
  multiline?: boolean;
  maxLength: number;
  autoComplete?: string;
  placeholder?: string;
};

const inputClassName =
  "mt-2 w-full rounded-md border border-outline-variant bg-surface-white px-4 py-3 text-admin-body text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/60 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20";

function FormField({
  name,
  label,
  value,
  error,
  required = false,
  type = "text",
  multiline = false,
  maxLength,
  autoComplete,
  placeholder,
}: FieldProps) {
  const errorId = `${name}-error`;
  const sharedProps = {
    id: name,
    name,
    defaultValue: value ?? "",
    required,
    maxLength,
    placeholder,
    "aria-invalid": Boolean(error),
    "aria-describedby": error ? errorId : undefined,
    className: inputClassName,
  };

  return (
    <div>
      <label htmlFor={name} className="text-admin-label text-primary">
        {label}
        {required ? (
          <span aria-hidden="true"> *</span>
        ) : (
          <span className="ml-1 font-normal text-on-surface-variant">(opsional)</span>
        )}
      </label>
      {multiline ? (
        <textarea {...sharedProps} rows={4} />
      ) : (
        <input {...sharedProps} type={type} autoComplete={autoComplete} />
      )}
      {error ? (
        <p id={errorId} className="mt-1.5 text-admin-caption text-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function SiteSettingsForm({ settings }: { settings: SiteSettings }) {
  const [state, formAction, isPending] = useActionState(
    updateSiteSettings,
    initialState,
  );

  return (
    <form action={formAction} className="mt-8 max-w-5xl space-y-10">
      <section aria-labelledby="business-identity-heading" className="space-y-5">
        <div>
          <h2 id="business-identity-heading" className="font-heading text-heading-xs text-primary">Identitas Bisnis</h2>
          <p className="mt-1.5 text-admin-body text-on-surface-variant">Nama yang ditampilkan pada identitas dan footer website.</p>
        </div>
        <FormField name="business_name" label="Nama Bisnis" value={settings.business_name} error={state.errors.business_name} required maxLength={120} autoComplete="organization" />
      </section>

      <section aria-labelledby="business-contact-heading" className="space-y-5 border-t border-outline-variant pt-8">
        <div>
          <h2 id="business-contact-heading" className="font-heading text-heading-xs text-primary">Kontak</h2>
          <p className="mt-1.5 text-admin-body text-on-surface-variant">Kontak publik yang dapat digunakan pelanggan untuk menghubungi bisnis.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
        <FormField name="whatsapp" label="Nomor WhatsApp" value={settings.whatsapp} error={state.errors.whatsapp} required maxLength={30} type="tel" autoComplete="tel" placeholder="0812..." />
        <FormField name="phone" label="Nomor Telepon" value={settings.phone} error={state.errors.phone} maxLength={50} type="tel" autoComplete="tel" />
        <FormField name="email" label="Email" value={settings.email} error={state.errors.email} maxLength={254} type="email" autoComplete="email" />
        </div>
      </section>

      <section aria-labelledby="business-location-heading" className="space-y-5 border-t border-outline-variant pt-8">
        <div>
          <h2 id="business-location-heading" className="font-heading text-heading-xs text-primary">Lokasi & Jam Operasional</h2>
          <p className="mt-1.5 text-admin-body text-on-surface-variant">Informasi kunjungan yang ditampilkan kepada pelanggan.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <FormField name="address" label="Alamat" value={settings.address} error={state.errors.address} required maxLength={1000} multiline autoComplete="street-address" />
          <FormField name="operating_hours" label="Jam Operasional" value={settings.operating_hours} error={state.errors.operating_hours} maxLength={500} multiline />
        </div>
        <FormField name="maps_url" label="Google Maps URL" value={settings.maps_url} error={state.errors.maps_url} maxLength={2048} type="url" placeholder="https://maps.google.com/..." />
      </section>

      <section aria-labelledby="business-social-heading" className="space-y-5 border-t border-outline-variant pt-8">
        <div>
          <h2 id="business-social-heading" className="font-heading text-heading-xs text-primary">Media Sosial</h2>
          <p className="mt-1.5 text-admin-body text-on-surface-variant">Tambahkan URL profil yang ingin ditampilkan. Kosongkan platform yang tidak digunakan.</p>
        </div>
        <div className="grid min-w-0 gap-6 md:grid-cols-2">
          <FormField name="instagram_url" label="Instagram URL" value={settings.instagram_url} error={state.errors.instagram_url} maxLength={2048} type="url" />
          <FormField name="facebook_url" label="Facebook URL" value={settings.facebook_url} error={state.errors.facebook_url} maxLength={2048} type="url" />
          <FormField name="tiktok_url" label="TikTok URL" value={settings.tiktok_url} error={state.errors.tiktok_url} maxLength={2048} type="url" />
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
        <button type="submit" disabled={isPending} className="mt-4 min-h-12 w-full rounded-md bg-primary px-6 text-admin-label text-on-primary transition-colors hover:bg-primary-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto">
          {isPending ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </div>
    </form>
  );
}
