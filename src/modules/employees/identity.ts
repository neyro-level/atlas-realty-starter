import { createHash } from "node:crypto";
import { toTranslitSlug } from "@/shared/lib/slugify";

export function normalizeAgentName(value: string | null | undefined) {
  return value
    ?.trim()
    .replace(/\s+/g, " ")
    .toLocaleLowerCase("ru-RU")
    .replace(/ё/g, "е") ?? "";
}

export function normalizeAgentPhone(value: string | null | undefined) {
  const digits = value?.replace(/\D/g, "") ?? "";
  if (digits.length === 11 && digits.startsWith("8")) return `+7${digits.slice(1)}`;
  if (digits.length === 11 && digits.startsWith("7")) return `+${digits}`;
  if (digits.length === 10 && digits.startsWith("9")) return `+7${digits}`;
  return digits ? `+${digits}` : "";
}

export function normalizeAgentEmail(value: string | null | undefined) {
  return value?.trim().toLocaleLowerCase("ru-RU") ?? "";
}

export function buildAgentSlug(fullName: string, identity: string) {
  const base = toTranslitSlug(fullName, 96) || "specialist-agencya";
  const suffix = createHash("sha256").update(identity || fullName).digest("hex").slice(0, 7);
  return `${base}-${suffix}`;
}

export function buildPublicReviewName(value: string) {
  const parts = value.trim().replace(/\s+/g, " ").split(" ").filter(Boolean);
  if (parts.length === 0) return "Клиент агентства недвижимости";
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[1].charAt(0).toLocaleUpperCase("ru-RU")}.`;
}
