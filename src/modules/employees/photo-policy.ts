export const EMPLOYEE_PORTRAIT_PLACEHOLDER = "/images/employee-placeholder-v2.webp";


export type EmployeePhotoSource = "manual" | "xml" | "none";

export function resolveEmployeePhotoUrl(
  manualPhotoUrl: string | null | undefined,
  sourcePhotoUrl: string | null | undefined,
) {
  return [manualPhotoUrl, sourcePhotoUrl]
    .map((value) => value?.trim() ?? "")
    .find(isSupportedEmployeePhotoUrl) || null;
}

export function resolveEmployeePhotoSource(
  manualPhotoUrl: string | null | undefined,
  sourcePhotoUrl: string | null | undefined,
): EmployeePhotoSource {
  if (isSupportedEmployeePhotoUrl(manualPhotoUrl?.trim() ?? "")) return "manual";
  if (isSupportedEmployeePhotoUrl(sourcePhotoUrl?.trim() ?? "")) return "xml";
  return "none";
}

export function isSupportedEmployeePhotoUrl(value: string) {
  if (!value) return false;
  if (value.startsWith("/")) return !value.startsWith("//");

  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}
