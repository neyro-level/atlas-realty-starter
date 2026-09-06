export function normalizeLeadPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (/^\d{10}$/.test(digits)) return `+7${digits}`;
  if (/^7\d{10}$/.test(digits)) return `+${digits}`;
  if (/^8\d{10}$/.test(digits)) return `+7${digits.slice(1)}`;
  return "";
}
