"use client";

import { useActionState } from "react";

import {
  createDesignReferenceLink,
  type DesignReferenceLinkState,
} from "@/app/admin/(protected)/pesanan/[id]/actions";

const initialState: DesignReferenceLinkState = {
  error: null,
  signedUrl: null,
};

export function DesignReferenceControl({ referenceId }: { referenceId: string }) {
  const [state, formAction, isPending] = useActionState(
    createDesignReferenceLink.bind(null, referenceId),
    initialState,
  );

  return (
    <div className="mt-3">
      <form action={formAction}>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex min-h-10 items-center justify-center rounded-md border border-outline-variant bg-surface-white px-4 text-admin-label font-semibold text-primary transition-colors hover:bg-surface-container-low focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Menyiapkan..." : "Siapkan Referensi Desain"}
        </button>
        <p className="mt-2 text-admin-caption text-on-surface-variant">
          Setelah siap, tombol untuk membuka referensi akan muncul di bawah.
        </p>
      </form>
      <div aria-live="polite" aria-atomic="true" className="mt-3">
        {state.error ? (
          <p role="alert" className="text-admin-body text-error">
            {state.error}
          </p>
        ) : null}
        {state.signedUrl ? (
          <a
            href={state.signedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-10 items-center justify-center rounded-md border border-outline-variant bg-surface-white px-4 text-admin-label font-semibold text-primary transition-colors hover:bg-surface-container-low focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Buka Referensi Desain
            <span className="sr-only"> di tab baru</span>
          </a>
        ) : null}
      </div>
    </div>
  );
}
