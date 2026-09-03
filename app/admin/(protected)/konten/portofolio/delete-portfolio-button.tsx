"use client";

import { useActionState } from "react";

import {
  deletePortfolioItem,
  type DeletePortfolioState,
} from "@/app/admin/(protected)/konten/portofolio/actions";

const initialState: DeletePortfolioState = {
  status: "idle",
  message: null,
};

export function DeletePortfolioButton({
  itemId,
  title,
}: {
  itemId: string;
  title: string;
}) {
  const deleteCurrentItem = deletePortfolioItem.bind(null, itemId);
  const [state, formAction, isPending] = useActionState(
    deleteCurrentItem,
    initialState,
  );

  function confirmDelete(event: React.FormEvent<HTMLFormElement>) {
    if (
      !window.confirm(
        `Hapus item portofolio “${title}”? Item akan dihapus dari daftar publik. Tindakan ini tidak memengaruhi layanan atau pesanan.`,
      )
    ) {
      event.preventDefault();
    }
  }

  return (
    <form action={formAction} onSubmit={confirmDelete} className="text-right">
      <button type="submit" disabled={isPending} className="rounded-sm text-admin-label text-error underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60">
        {isPending ? "Menghapus..." : "Hapus"}
      </button>
      {state.status === "error" && state.message ? (
        <p aria-live="polite" className="mt-1 text-admin-caption text-error">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
