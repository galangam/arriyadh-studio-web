"use client";

import { useActionState } from "react";

import {
  updateAboutContent,
  type AboutContentFormState,
} from "@/app/admin/(protected)/konten/tentang-kami/actions";
import type { AboutContent } from "@/lib/content/about-content";

const initialState: AboutContentFormState = {
  status: "idle",
  message: null,
  errors: {},
};

const fieldClassName =
  "mt-2 w-full rounded-md border border-outline-variant bg-surface-white px-4 py-3 text-admin-body text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/60 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20";

type TextFieldName = Exclude<keyof AboutContent, "founded_year">;

const strengthFields = [
  {
    number: 1,
    titleName: "strength_1_title",
    descriptionName: "strength_1_description",
  },
  {
    number: 2,
    titleName: "strength_2_title",
    descriptionName: "strength_2_description",
  },
  {
    number: 3,
    titleName: "strength_3_title",
    descriptionName: "strength_3_description",
  },
] as const satisfies ReadonlyArray<{
  number: number;
  titleName: TextFieldName;
  descriptionName: TextFieldName;
}>;

type TextFieldProps = {
  name: TextFieldName;
  label: string;
  value: string | null;
  error?: string;
  multiline?: boolean;
  rows?: number;
  maxLength: number;
};

function TextField({
  name,
  label,
  value,
  error,
  multiline = false,
  rows = 4,
  maxLength,
}: TextFieldProps) {
  const errorId = `${name}-error`;
  const commonProps = {
    id: name,
    name,
    defaultValue: value ?? "",
    required: name !== "workshop_image_url",
    maxLength,
    "aria-invalid": Boolean(error),
    "aria-describedby": error ? errorId : undefined,
    className: fieldClassName,
  };

  return (
    <div>
      <label htmlFor={name} className="text-admin-label text-primary">
        {label}
        {name !== "workshop_image_url" ? <span aria-hidden="true"> *</span> : null}
      </label>
      {multiline ? (
        <textarea {...commonProps} rows={rows} />
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

export function AboutContentForm({ content }: { content: AboutContent }) {
  const [state, formAction, isPending] = useActionState(
    updateAboutContent,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-8">
      <section aria-labelledby="about-page-fields" className="space-y-6">
        <h2 id="about-page-fields" className="font-heading text-heading-xs text-primary">
          Pengantar Halaman
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          <TextField name="page_title" label="Judul Halaman" value={content.page_title} error={state.errors.page_title} maxLength={180} />
          <TextField name="page_subtitle" label="Subjudul Halaman" value={content.page_subtitle} error={state.errors.page_subtitle} maxLength={240} />
        </div>
      </section>

      <section aria-labelledby="about-history-fields" className="space-y-6 border-t border-outline-variant pt-8">
        <h2 id="about-history-fields" className="font-heading text-heading-xs text-primary">
          Sejarah / Profil
        </h2>
        <TextField name="history_title" label="Judul Sejarah / Profil" value={content.history_title} error={state.errors.history_title} maxLength={180} />
        <TextField name="history_body" label="Deskripsi Sejarah" value={content.history_body} error={state.errors.history_body} multiline rows={8} maxLength={5000} />
        <div>
          <label htmlFor="founded_year" className="text-admin-label text-primary">
            Tahun Berdiri <span aria-hidden="true">*</span>
          </label>
          <input id="founded_year" name="founded_year" type="number" inputMode="numeric" min={1900} max={2100} step={1} required defaultValue={content.founded_year ?? ""} aria-invalid={Boolean(state.errors.founded_year)} aria-describedby={state.errors.founded_year ? "founded-year-error" : undefined} className={fieldClassName} />
          {state.errors.founded_year ? (
            <p id="founded-year-error" className="mt-1.5 text-admin-caption text-error">
              {state.errors.founded_year}
            </p>
          ) : null}
        </div>
      </section>

      <section aria-labelledby="about-strength-fields" className="space-y-6 border-t border-outline-variant pt-8">
        <h2 id="about-strength-fields" className="font-heading text-heading-xs text-primary">
          Keunggulan
        </h2>
        {strengthFields.map(({ number, titleName, descriptionName }) => {
          return (
            <div key={number} className="grid gap-6 md:grid-cols-2">
              <TextField name={titleName} label={`Keunggulan ${number} — Judul`} value={content[titleName]} error={state.errors[titleName]} maxLength={100} />
              <TextField name={descriptionName} label={`Keunggulan ${number} — Deskripsi`} value={content[descriptionName]} error={state.errors[descriptionName]} maxLength={200} />
            </div>
          );
        })}
      </section>

      <section aria-labelledby="about-workshop-fields" className="space-y-6 border-t border-outline-variant pt-8">
        <h2 id="about-workshop-fields" className="font-heading text-heading-xs text-primary">
          Workshop
        </h2>
        <TextField name="workshop_title" label="Judul Workshop" value={content.workshop_title} error={state.errors.workshop_title} maxLength={180} />
        <TextField name="workshop_description" label="Deskripsi Workshop" value={content.workshop_description} error={state.errors.workshop_description} multiline maxLength={2000} />
        <div className="grid gap-6 md:grid-cols-2">
          <TextField name="workshop_image_url" label="Nilai Gambar Workshop" value={content.workshop_image_url} error={state.errors.workshop_image_url} maxLength={2048} />
          <div>
            <label htmlFor="workshop_image" className="text-admin-label text-primary">
              Gambar Workshop
            </label>
            <input id="workshop_image" name="workshop_image" type="file" accept="image/jpeg,image/png,image/webp" aria-invalid={Boolean(state.errors.workshop_image)} aria-describedby={state.errors.workshop_image ? "workshop-image-error" : "workshop-image-help"} className={`${fieldClassName} file:mr-4 file:rounded-md file:border-0 file:bg-surface-container file:px-3 file:py-2 file:text-admin-label file:text-primary`} />
            <p id="workshop-image-help" className="mt-1.5 text-admin-caption text-on-surface-variant">
              JPEG, PNG, atau WebP. Maksimal 5 MiB. Kosongkan untuk mempertahankan gambar saat ini.
            </p>
            {state.errors.workshop_image ? (
              <p id="workshop-image-error" className="mt-1.5 text-admin-caption text-error">
                {state.errors.workshop_image}
              </p>
            ) : null}
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
