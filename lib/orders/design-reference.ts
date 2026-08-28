import "server-only";

export const maxDesignReferenceSize = 10 * 1024 * 1024;
export const maxDesignReferenceFiles = 5;

const designReferenceMimeTypes = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
} as const;

export type ValidatedDesignReference = {
  bytes: Uint8Array;
  contentType: keyof typeof designReferenceMimeTypes;
  extension: (typeof designReferenceMimeTypes)[keyof typeof designReferenceMimeTypes];
};

function hasValidSignature(bytes: Uint8Array, mimeType: string) {
  if (mimeType === "image/jpeg") {
    return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }
  if (mimeType === "image/png") {
    const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
    return signature.every((value, index) => bytes[index] === value);
  }
  if (mimeType === "image/webp") {
    return bytes.length >= 12 && String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
  }
  if (mimeType === "application/pdf") {
    return bytes.length >= 5 && String.fromCharCode(...bytes.slice(0, 5)) === "%PDF-";
  }
  return false;
}

export async function validateDesignReference(reference: File | null): Promise<ValidatedDesignReference | null> {
  if (!reference) return null;
  if (reference.size === 0) throw new Error("REFERENCE_EMPTY");
  if (reference.size > maxDesignReferenceSize) throw new Error("REFERENCE_TOO_LARGE");
  if (!(reference.type in designReferenceMimeTypes)) throw new Error("REFERENCE_FORMAT_INVALID");

  const contentType = reference.type as keyof typeof designReferenceMimeTypes;
  const bytes = new Uint8Array(await reference.arrayBuffer());
  if (!hasValidSignature(bytes, contentType)) throw new Error("REFERENCE_FORMAT_INVALID");

  return { bytes, contentType, extension: designReferenceMimeTypes[contentType] };
}

export async function validateDesignReferences(
  references: File[],
): Promise<ValidatedDesignReference[]> {
  if (references.length > maxDesignReferenceFiles) {
    throw new Error("REFERENCE_TOO_MANY");
  }

  const validatedReferences: ValidatedDesignReference[] = [];
  for (const reference of references) {
    const validated = await validateDesignReference(reference);
    if (validated) validatedReferences.push(validated);
  }

  return validatedReferences;
}
