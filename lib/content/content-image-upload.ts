import "server-only";

export const MAX_CONTENT_IMAGE_SIZE = 5 * 1024 * 1024;

export const contentImageExtensions = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

export type AllowedContentImageType = keyof typeof contentImageExtensions;

export type ValidatedContentImage = {
  file: File;
  bytes: ArrayBuffer;
  extension: (typeof contentImageExtensions)[AllowedContentImageType];
};

function hasValidImageSignature(bytes: ArrayBuffer, mimeType: string) {
  const signature = new Uint8Array(bytes.slice(0, 12));

  if (mimeType === "image/jpeg") {
    return signature[0] === 0xff && signature[1] === 0xd8 && signature[2] === 0xff;
  }

  if (mimeType === "image/png") {
    return [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every(
      (byte, index) => signature[index] === byte,
    );
  }

  if (mimeType === "image/webp") {
    return (
      String.fromCharCode(...signature.slice(0, 4)) === "RIFF" &&
      String.fromCharCode(...signature.slice(8, 12)) === "WEBP"
    );
  }

  return false;
}

export async function validateContentImageUpload(
  value: FormDataEntryValue | null,
): Promise<{ image: ValidatedContentImage | null; error: string | null }> {
  if (!(value instanceof File) || value.size === 0) {
    return { image: null, error: null };
  }

  if (!(value.type in contentImageExtensions)) {
    return {
      image: null,
      error: "Gambar harus berformat JPEG, PNG, atau WebP.",
    };
  }

  if (value.size > MAX_CONTENT_IMAGE_SIZE) {
    return { image: null, error: "Ukuran gambar maksimal 5 MiB." };
  }

  const bytes = await value.arrayBuffer();
  if (!hasValidImageSignature(bytes, value.type)) {
    return {
      image: null,
      error: "Isi file tidak sesuai dengan format gambar yang dipilih.",
    };
  }

  return {
    image: {
      file: value,
      bytes,
      extension:
        contentImageExtensions[value.type as AllowedContentImageType],
    },
    error: null,
  };
}

export function validateContentImageValue(value: string, folder: string) {
  if (!value) return null;
  if (value.length > 2048) return "Nilai gambar terlalu panjang.";
  if (value.startsWith("/images/")) return null;
  if (/^https?:\/\//i.test(value)) return null;

  const escapedFolder = folder.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const objectPathPattern = new RegExp(
    `^(content-images/)?${escapedFolder}/[a-zA-Z0-9/_-]+\\.(jpe?g|png|webp)$`,
    "i",
  );

  return objectPathPattern.test(value)
    ? null
    : `Gunakan path /images, URL http/https, atau object path folder ${folder}.`;
}
