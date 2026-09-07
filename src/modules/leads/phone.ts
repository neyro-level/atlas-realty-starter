export function normalizeRuMobileDigits(value: string) {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("7") || digits.startsWith("8")) digits = digits.slice(1);
  if (!digits) return "";
  if (!digits.startsWith("9")) digits = `9${digits}`;
  return digits.slice(0, 10);
}

export function formatRuMobileDigits(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (!digits) return "";
  let formatted = `+7 (${digits.slice(0, 3)}`;
  if (digits.length >= 3) formatted += ")";
  if (digits.length > 3) formatted += ` ${digits.slice(3, 6)}`;
  if (digits.length > 6) formatted += `-${digits.slice(6, 8)}`;
  if (digits.length > 8) formatted += `-${digits.slice(8, 10)}`;
  return formatted;
}

export function formatRuMobilePhone(value: string) {
  return formatRuMobileDigits(normalizeRuMobileDigits(value));
}

export function isValidRuMobilePhone(value: string) {
  const digits = normalizeRuMobileDigits(value);
  return digits.length === 10 && digits.startsWith("9");
}
