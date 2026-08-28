export const arriyadhWhatsappNumber = "6281214719630";

export function normalizeWhatsappNumber(value: string) {
  const digits = value.replace(/\D/g, "");

  if (digits.startsWith("62")) return digits;
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;

  return digits;
}

export function createWhatsappUrl(phoneNumber: string, message: string) {
  const normalizedNumber = normalizeWhatsappNumber(phoneNumber);
  return `https://wa.me/${normalizedNumber}?text=${encodeURIComponent(message)}`;
}
