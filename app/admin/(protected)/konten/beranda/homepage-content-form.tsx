"use client";

import { useActionState } from "react";

import {
  updateHomepageContent,
  type HomepageContentFormState,
} from "@/app/admin/(protected)/konten/beranda/actions";
import type { HomepageContent } from "@/lib/content/homepage-content";

const initialState: HomepageContentFormState = {
  status: "idle",
  message: null,
  errors: {},
};

type TextFieldProps = {
  name: keyof HomepageContent;
  label: string;
  value: string | null;
  error?: string;
  required?: boolean;
  multiline?: boolean;
  maxLength: number;
};

const fieldClassName =
  "mt-2 w-full rounded-md border border-outline-variant bg-surface-white px-4 py-3 text-admin-body text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/60 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20";

function TextField({
  name,
  label,
  value,
  error,
  required = false,
  multiline = false,
  maxLength,
}: TextFieldProps) {
  const errorId = `${name}-error`;
  const commonProps = {
    id: name,
    name,
    defaultValue: value ?? "",
    required,
    maxLength,
    "aria-invalid": Boolean(error),
    "aria-describedby": error ? errorId : undefined,
    className: fieldClassName,
  };

  return (
    <div>
      <label htmlFor={name} className="text-admin-label text-primary">
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </label>
      {multiline ? (
        <textarea {...commonProps} rows={4} />
      ) : (
        <input {...commonProps} type="text" />
      )}
      {error ? (
        <p id={errorId} className="mt-1.5 text-admin-caption text-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function HomepageContentForm({ content }: { content: HomepageContent }) {
  const [state, formAction, isPending] = useActionState(
    updateHomepageContent,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2">
        <TextField name="hero_eyebrow" label="Eyebrow Hero" value={content.hero_eyebrow} error={state.errors.hero_eyebrow} required maxLength={100} />
        <TextField name="hero_title" label="Judul Hero" value={content.hero_title} error={state.errors.hero_title} required maxLength={180} />
      </div>
      <TextField name="hero_description" label="Deskripsi Hero" value={content.hero_description} error={state.errors.hero_description} required multiline maxLength={1000} />

      <div className="grid gap-6 md:grid-cols-2">
        <TextField name="hero_image_url" label="Nilai Gambar Hero" value={content.hero_image_url} error={state.errors.hero_image_url} maxLength={2048} />
        <div>
          <label htmlFor="hero_image" className="text-admin-label text-primary">
            Unggah Pengganti Gambar Hero
          </label>
          <input id="hero_image" name="hero_image" type="file" accept="image/jpeg,image/png,image/webp" aria-invalid={Boolean(state.errors.hero_image)} aria-describedby={state.errors.hero_image ? "hero-image-error" : "hero-image-help"} className={`${fieldClassName} file:mr-4 file:rounded-md file:border-0 file:bg-surface-container file:px-3 file:py-2 file:text-admin-label file:text-primary`} />
          <p id="hero-image-help" className="mt-1.5 text-admin-caption text-on-surface-variant">
            JPEG, PNG, atau WebP. Maksimal 5 MiB. Kosongkan untuk mempertahankan gambar saat ini.
          </p>
          {state.errors.hero_image ? (
            <p id="hero-image-error" className="mt-1.5 text-admin-caption text-error">
              {state.errors.hero_image}
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <TextField name="intro_title" label="Judul Pengantar" value={content.intro_title} error={state.errors.intro_title} required maxLength={180} />
        <TextField name="experience_value" label="Nilai Pengalaman" value={content.experience_value} error={state.errors.experience_value} maxLength={30} />
      </div>
      <TextField name="intro_description" label="Deskripsi Pengantar" value={content.intro_description} error={state.errors.intro_description} required multiline maxLength={2000} />
      <TextField name="experience_label" label="Label Pengalaman" value={content.experience_label} error={state.errors.experience_label} maxLength={100} />

      <div className="grid gap-6 md:grid-cols-2">
        <TextField name="portfolio_title" label="Judul Portofolio" value={content.portfolio_title} error={state.errors.portfolio_title} required maxLength={180} />
        <TextField name="portfolio_description" label="Deskripsi Portofolio" value={content.portfolio_description} error={state.errors.portfolio_description} required multiline maxLength={1000} />
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
