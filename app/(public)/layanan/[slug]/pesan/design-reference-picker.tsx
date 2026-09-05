"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import type { DesignReferenceRequirement } from "@/lib/services/service-requirements";

const maxFiles = 5;
const maxFileSize = 10 * 1024 * 1024;
const missingReferenceMessage = "Unggah minimal 1 referensi desain.";
const allowedTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

type SelectedReference = {
  file: File;
  key: string;
  previewUrl: string;
};

function fileKey(file: File) {
  return `${file.name}:${file.size}:${file.lastModified}:${file.type}`;
}

function formatFileSize(size: number) {
  if (size >= 1024 * 1024) return `${(size / 1024 / 1024).toFixed(1)} MB`;
  return `${Math.max(1, Math.ceil(size / 1024))} KB`;
}

export function DesignReferencePicker({
  serverError,
  responseRevision,
  pending,
  requirement,
}: {
  serverError?: string;
  responseRevision: number;
  pending: boolean;
  requirement: Exclude<DesignReferenceRequirement, "unsupported">;
}) {
  const required = requirement === "required";
  const submittedInputRef = useRef<HTMLInputElement>(null);
  const pickerInputRef = useRef<HTMLInputElement>(null);
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const selectedReferencesRef = useRef<SelectedReference[]>([]);
  const [selectedReferences, setSelectedReferences] = useState<
    SelectedReference[]
  >([]);
  const [clientError, setClientError] = useState<string | null>(null);
  const [dismissedServerRevision, setDismissedServerRevision] =
    useState<number | null>(null);

  useEffect(() => {
    selectedReferencesRef.current = selectedReferences;
  }, [selectedReferences]);

  useEffect(() => {
    const input = submittedInputRef.current;
    if (!input) return;

    input.setCustomValidity(
      required && selectedReferences.length === 0
        ? missingReferenceMessage
        : "",
    );
  }, [required, selectedReferences.length]);

  useEffect(() => {
    return () => {
      selectedReferencesRef.current.forEach(({ previewUrl }) => {
        URL.revokeObjectURL(previewUrl);
      });
    };
  }, []);

  useEffect(() => {
    if (responseRevision === 0 || !submittedInputRef.current) return;

    const transfer = new DataTransfer();
    selectedReferencesRef.current.forEach(({ file }) => {
      transfer.items.add(file);
    });
    submittedInputRef.current.files = transfer.files;
  }, [responseRevision]);

  function syncSubmittedFiles(references: SelectedReference[]) {
    if (!submittedInputRef.current) return;

    const transfer = new DataTransfer();
    references.forEach(({ file }) => transfer.items.add(file));
    submittedInputRef.current.files = transfer.files;
    submittedInputRef.current.setCustomValidity(
      required && references.length === 0 ? missingReferenceMessage : "",
    );
  }

  function dismissServerError() {
    setDismissedServerRevision(responseRevision);
  }

  function selectFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const incomingFiles = Array.from(event.currentTarget.files ?? []);
    event.currentTarget.value = "";
    if (incomingFiles.length === 0) return;

    dismissServerError();

    const invalidFile = incomingFiles.find(
      (file) =>
        file.size === 0 ||
        file.size > maxFileSize ||
        !allowedTypes.has(file.type),
    );
    if (invalidFile) {
      setClientError(
        "Setiap file harus berupa JPEG, PNG, WebP, atau PDF, tidak kosong, dan maksimal 10 MB.",
      );
      return;
    }

    const existingKeys = new Set(selectedReferences.map(({ key }) => key));
    const uniqueFiles = incomingFiles.filter(
      (file) => !existingKeys.has(fileKey(file)),
    );

    if (selectedReferences.length + uniqueFiles.length > maxFiles) {
      setClientError("Maksimal 5 file referensi desain.");
      return;
    }

    const nextReferences = [
      ...selectedReferences,
      ...uniqueFiles.map((file) => ({
        file,
        key: fileKey(file),
        previewUrl: URL.createObjectURL(file),
      })),
    ];
    setClientError(null);
    setSelectedReferences(nextReferences);
    syncSubmittedFiles(nextReferences);
  }

  function removeFile(key: string) {
    const removed = selectedReferences.find(
      (reference) => reference.key === key,
    );
    if (removed) URL.revokeObjectURL(removed.previewUrl);

    const nextReferences = selectedReferences.filter(
      (reference) => reference.key !== key,
    );
    dismissServerError();
    setClientError(
      required && nextReferences.length === 0
        ? missingReferenceMessage
        : null,
    );
    setSelectedReferences(nextReferences);
    syncSubmittedFiles(nextReferences);
  }

  const visibleServerError =
    dismissedServerRevision === responseRevision ? undefined : serverError;
  const displayedError = clientError ?? visibleServerError;

  return (
    <div
      data-design-reference-target
      data-reference-missing={
        required && selectedReferences.length === 0 ? "true" : undefined
      }
    >
      <p className="font-body text-label-md font-semibold text-primary">
        {required ? (
          "File Referensi (Wajib)"
        ) : (
          <>
            File Referensi{" "}
            <span className="font-normal text-on-surface-variant">
              (Opsional)
            </span>
          </>
        )}
      </p>
      <input
        ref={submittedInputRef}
        name="designReferences"
        type="file"
        multiple
        required={required}
        aria-invalid={Boolean(displayedError)}
        onInvalid={(event) => {
          event.preventDefault();
          if (required && selectedReferences.length === 0) {
            setClientError(missingReferenceMessage);
            addButtonRef.current?.focus();
          }
        }}
        aria-describedby="design-reference-help design-reference-error"
        className="sr-only"
      />
      <button
        ref={addButtonRef}
        id="design-reference-add"
        type="button"
        disabled={pending || selectedReferences.length >= maxFiles}
        aria-describedby="design-reference-help design-reference-error"
        onClick={() => pickerInputRef.current?.click()}
        className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-md border border-primary px-4 font-body text-button text-primary hover:bg-surface-container-low focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      >
        Tambah File
      </button>
      <input
        ref={pickerInputRef}
        id="design-reference-picker"
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,application/pdf"
        disabled={pending || selectedReferences.length >= maxFiles}
        onChange={selectFiles}
        className="sr-only"
      />
      <p
        id="design-reference-help"
        className="mt-2 font-body text-body-sm text-on-surface-variant"
      >
        {required
          ? "Unggah minimal 1 file JPEG, PNG, WebP, atau PDF. Maksimal 5 file, masing-masing maksimal 10 MB."
          : "Jika tersedia, unggah JPEG, PNG, WebP, atau PDF. Maksimal 5 file, masing-masing maksimal 10 MB."}
      </p>

      {selectedReferences.length > 0 ? (
        <ul className="mt-4 space-y-3" aria-label="Referensi desain terpilih">
          {selectedReferences.map(({ file, key, previewUrl }) => {
            const isImage = file.type.startsWith("image/");
            return (
              <li
                key={key}
                className="flex items-center gap-3 border border-outline-variant bg-surface-container-low p-3"
              >
                {isImage ? (
                  <Image
                    src={previewUrl}
                    alt={"Pratinjau " + file.name}
                    width={64}
                    height={64}
                    unoptimized
                    className="size-16 shrink-0 object-cover"
                  />
                ) : (
                  <div
                    aria-hidden="true"
                    className="flex size-16 shrink-0 items-center justify-center bg-surface-container font-body text-label-md font-semibold text-primary"
                  >
                    PDF
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-body text-body-sm font-semibold text-on-surface">
                    {file.name}
                  </p>
                  <p className="font-body text-body-sm text-on-surface-variant">
                    {formatFileSize(file.size)}
                  </p>
                  <a
                    href={previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex min-h-9 items-center justify-center rounded-md border border-outline-variant bg-surface-white px-3 font-body text-label-md font-semibold text-primary transition-colors hover:bg-surface-container-low focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  >
                    Lihat
                    <span className="sr-only"> {file.name} di tab baru</span>
                  </a>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(key)}
                  disabled={pending}
                  aria-label={`Hapus ${file.name}`}
                  className="inline-flex size-10 shrink-0 items-center justify-center rounded-md border border-error/30 font-body text-heading-sm text-error hover:bg-error-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error"
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}

      <div
        id="design-reference-error"
        aria-live="polite"
        aria-atomic="true"
      >
        {displayedError ? (
          <p role="alert" className="mt-2 font-body text-body-sm text-error">
            {displayedError}
          </p>
        ) : null}
      </div>
    </div>
  );
}
