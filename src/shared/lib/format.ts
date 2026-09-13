export { formatRublePrice as formatPrice } from "@starter/site-ui";

export function formatDateTime(value: Date | string | null | undefined): string {
  if (!value) return "нет данных";

  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "нет данных";

  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
