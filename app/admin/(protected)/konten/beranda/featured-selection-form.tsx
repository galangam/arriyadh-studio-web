"use client";

import { useActionState, useState } from "react";

import type { FeaturedFormState } from "@/app/admin/(protected)/konten/beranda/actions";

export type FeaturedOption = {
  id: string;
  name: string;
};

type FeaturedSelectionFormProps = {
  title: string;
  description: string;
  options: FeaturedOption[];
  initialSelectedIds: string[];
  action: (
    state: FeaturedFormState,
    formData: FormData,
  ) => Promise<FeaturedFormState>;
};

const initialState: FeaturedFormState = {
  status: "idle",
  message: null,
};

export function FeaturedSelectionForm({
  title,
  description,
  options,
  initialSelectedIds,
  action,
}: FeaturedSelectionFormProps) {
  const [selectedIds, setSelectedIds] = useState(initialSelectedIds);
  const [state, formAction, isPending] = useActionState(action, initialState);
  const optionById = new Map(options.map((option) => [option.id, option]));

  function toggle(id: string) {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((selectedId) => selectedId !== id)
        : [...current, id],
    );
  }

  function move(id: string, direction: -1 | 1) {
    setSelectedIds((current) => {
      const index = current.indexOf(id);
      const destination = index + direction;
      if (index < 0 || destination < 0 || destination >= current.length) {
        return current;
      }
      const next = [...current];
      [next[index], next[destination]] = [next[destination], next[index]];
      return next;
    });
  }

  return (
    <form action={formAction} className="border-t border-outline-variant pt-8">
      <h2 className="font-heading text-heading-xs text-primary">{title}</h2>
      <p className="mt-1.5 max-w-2xl text-admin-body text-on-surface-variant">
        {description}
      </p>

      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <fieldset>
          <legend className="text-admin-label text-primary">Pilihan tersedia</legend>
          <div className="mt-3 space-y-2">
            {options.map((option) => (
              <label key={option.id} className="flex min-h-11 items-center gap-3 border border-outline-variant bg-surface-white px-4 py-2 text-admin-body text-on-surface">
                <input type="checkbox" checked={selectedIds.includes(option.id)} onChange={() => toggle(option.id)} className="size-4 accent-primary" />
                {option.name}
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <h3 className="text-admin-label text-primary">Urutan di beranda</h3>
          <ol className="mt-3 space-y-2">
            {selectedIds.map((id, index) => {
              const option = optionById.get(id);
              if (!option) return null;
              return (
                <li key={id} className="flex min-h-12 items-center gap-3 border border-outline-variant bg-surface-white px-4 py-2">
                  <input type="hidden" name="featured_ids" value={id} />
                  <span className="w-7 text-admin-caption text-on-surface-variant">{index + 1}.</span>
                  <span className="flex-1 text-admin-body text-on-surface">{option.name}</span>
                  <button type="button" onClick={() => move(id, -1)} disabled={index === 0} aria-label={`Naikkan ${option.name}`} className="rounded border border-outline-variant px-2 py-1 text-admin-label text-primary disabled:opacity-40">↑</button>
                  <button type="button" onClick={() => move(id, 1)} disabled={index === selectedIds.length - 1} aria-label={`Turunkan ${option.name}`} className="rounded border border-outline-variant px-2 py-1 text-admin-label text-primary disabled:opacity-40">↓</button>
                </li>
              );
            })}
          </ol>
          {selectedIds.length === 0 ? (
            <p className="mt-3 text-admin-body text-on-surface-variant">Tidak ada item yang dipilih.</p>
          ) : null}
        </div>
      </div>

      <div aria-live="polite" aria-atomic="true" className="mt-6 min-h-6">
        {state.message ? (
          <p className={state.status === "success" ? "text-admin-body text-success-green" : "text-admin-body text-error"}>{state.message}</p>
        ) : null}
      </div>
      <button type="submit" disabled={isPending} className="mt-3 min-h-12 rounded-md bg-primary px-6 text-admin-label text-on-primary transition-colors hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-60">
        {isPending ? "Menyimpan..." : "Simpan Perubahan"}
      </button>
    </form>
  );
}
