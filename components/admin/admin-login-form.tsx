"use client";

import { useActionState } from "react";

import {
  loginAdmin,
  type AdminLoginState,
} from "@/app/admin/login/actions";

const initialState: AdminLoginState = {
  error: null,
};

export function AdminLoginForm() {
  const [state, formAction, isPending] = useActionState(
    loginAdmin,
    initialState,
  );
  const hasError = Boolean(state.error);

  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-2">
        <label
          htmlFor="email"
          className="block text-label-md font-medium text-primary"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          aria-invalid={hasError}
          aria-describedby={hasError ? "login-error" : undefined}
          className="min-h-12 w-full rounded-md border border-outline-variant bg-surface-white px-4 text-body-md text-primary outline-none transition-colors placeholder:text-on-surface-variant/60 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
          placeholder="nama@gmail.com"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="password"
          className="block text-label-md font-medium text-primary"
        >
          Kata Sandi
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          aria-invalid={hasError}
          aria-describedby={hasError ? "login-error" : undefined}
          className="min-h-12 w-full rounded-md border border-outline-variant bg-surface-white px-4 text-body-md text-primary outline-none transition-colors focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
        />
      </div>

      <div aria-live="polite" aria-atomic="true" className="min-h-5">
        {state.error ? (
          <p id="login-error" role="alert" className="text-body-sm text-error">
            {state.error}
          </p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="min-h-12 w-full rounded-md bg-primary px-5 text-button text-on-primary transition-colors hover:bg-primary-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Memproses..." : "Masuk"}
      </button>
    </form>
  );
}
