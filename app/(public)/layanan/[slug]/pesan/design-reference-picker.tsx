"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const maxFiles = 5;
const maxFileSize = 10 * 1024 * 1024;
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

export function DesignReferencePicker({ serverError }: { serverError?: string }) {
  const submittedInputRef = useRef<HTMLInputElement>(null);
  const selectedReferencesRef = useRef<SelectedReference[]>([]);
  const [selectedReferences, setSelectedReferences] = useState<SelectedReference[]>([]);
  const [clientError, setClientError] = useState<string | null>(null);

  useEffect(() => {
    selectedReferencesRef.current = selectedReferences;
  }, [selectedReferences]);

  useEffect(() => {
    return () => {
      selectedReferencesRef.current.forEach(({ previewUrl }) => {
        URL.revokeObjectURL(previewUrl);
      });
    };
  }, []);

  function syncSubmittedFiles(references: SelectedReference[]) {
    if (!submittedInputRef.current) return;

    const transfer = new DataTransfer();
    references.forEach(({ file }) => transfer.items.add(file));
    submittedInputRef.current.files = transfer.files;
  }

  function selectFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const incomingFiles = Array.from(event.currentTarget.files ?? []);
    event.currentTarget.value = "";
    if (incomingFiles.length === 0) return;

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
    const removed = selectedReferences.find((reference) => reference.key === key);
    if (removed) URL.revokeObjectURL(removed.previewUrl);

    const nextReferences = selectedReferences.filter(
      (reference) => reference.key !== key,
    );
    setClientError(null);
    setSelectedReferences(nextReferences);
    syncSubmittedFiles(nextReferences);
  }

  return (
    <div>
      <p className="font-body text-label-md font-semibold text-primary">
        Referensi Desain{" "}
        <span className="font-normal text-on-surface-variant">(Opsional)</span>
      </p>
      <input
        ref={submittedInputRef}
        name="designReferences"
        type="file"
        multiple
        tabIndex={-1}
        aria-hidden="true"
        className="sr-only"
      />
      <label
        htmlFor="design-reference-picker"
        aria-disabled={selectedReferences.length >= maxFiles}
        className="mt-3 inline-flex min-h-11 cursor-pointer items-center justify-center rounded-md border border-outline px-4 font-body text-button text-primary hover:bg-surface-container-low"
      >
        Tambah File
      </label>
      <input
        id="design-reference-picker"
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,application/pdf"
        disabled={selectedReferences.length >= maxFiles}
        onChange={selectFiles}
        className="sr-only"
      />
      <p className="mt-2 font-body text-body-sm text-on-surface-variant">
        Unggah hingga 5 gambar atau PDF. Maksimal 10 MB per file.
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
                    className="mt-1 inline-flex font-body text-label-md font-semibold text-link-blue underline underline-offset-4"
                  >
                    Lihat
                    <span className="sr-only"> {file.name} di tab baru</span>
                  </a>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(key)}
                  aria-label={`Hapus ${file.name}`}
                  className="inline-flex size-10 shrink-0 items-center justify-center rounded-md border border-outline-variant font-body text-heading-sm text-primary hover:bg-surface-container"
                >
                  <span aria-hidden="true">×</span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}

      <div aria-live="polite" aria-atomic="true">
        {clientError || serverError ? (
          <p role="alert" className="mt-2 font-body text-body-sm text-error">
            {clientError ?? serverError}
          </p>
        ) : null}
      </div>
    </div>
  );
}
