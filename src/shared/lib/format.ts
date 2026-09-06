export function formatPrice(price: number | null | undefined, fallback = "Цена по запросу"): string {
  if (price === null || price === undefined) {
    return fallback;
  }

  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatDateTime(value: Date | string | null | undefined): string {
  if (!value) return "нет данных";

  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "нет данных";

  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
