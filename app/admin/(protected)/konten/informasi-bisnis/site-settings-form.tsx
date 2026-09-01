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
        {required ? <span aria-hidden="true"> *</span> : null}
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
    <form action={formAction} className="mt-8 space-y-8">
      <div className="grid gap-6 md:grid-cols-2">
        <FormField name="business_name" label="Nama Bisnis" value={settings.business_name} error={state.errors.business_name} required maxLength={120} autoComplete="organization" />
        <FormField name="whatsapp" label="Nomor WhatsApp" value={settings.whatsapp} error={state.errors.whatsapp} required maxLength={30} type="tel" autoComplete="tel" placeholder="0812..." />
        <FormField name="phone" label="Nomor Telepon" value={settings.phone} error={state.errors.phone} maxLength={50} type="tel" autoComplete="tel" />
        <FormField name="email" label="Email" value={settings.email} error={state.errors.email} maxLength={254} type="email" autoComplete="email" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <FormField name="address" label="Alamat" value={settings.address} error={state.errors.address} required maxLength={1000} multiline autoComplete="street-address" />
        <FormField name="operating_hours" label="Jam Operasional" value={settings.operating_hours} error={state.errors.operating_hours} maxLength={500} multiline />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <FormField name="maps_url" label="Google Maps URL" value={settings.maps_url} error={state.errors.maps_url} maxLength={2048} type="url" />
        <FormField name="instagram_url" label="Instagram URL" value={settings.instagram_url} error={state.errors.instagram_url} maxLength={2048} type="url" />
        <FormField name="facebook_url" label="Facebook URL" value={settings.facebook_url} error={state.errors.facebook_url} maxLength={2048} type="url" />
        <FormField name="tiktok_url" label="TikTok URL" value={settings.tiktok_url} error={state.errors.tiktok_url} maxLength={2048} type="url" />
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
          {isPending ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </div>
    </form>
  );
}
