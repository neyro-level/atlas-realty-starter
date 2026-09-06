import { tenant } from "@/project/tenant";

/** Neutral share packaging for `/izbrannoe/s/[token]` (messenger OG + Web Share). */
export function buildSavedSelectionShareTitle() {
  return `Подборка недвижимости в ${tenant.cityRu}`;
}

export function buildSavedSelectionShareDescription(count: number) {
  if (count <= 0) {
    return `Сохранённая подборка объектов. Откройте ссылку, чтобы посмотреть варианты.`;
  }

  return `${count} ${pluralizeShareObjects(count)} в сохранённой подборке. Откройте ссылку, чтобы посмотреть варианты.`;
}

export function buildSavedSelectionShareText(count: number) {
  return buildSavedSelectionShareDescription(count);
}

function pluralizeShareObjects(value: number) {
  const mod10 = value % 10;
  const mod100 = value % 100;

  if (mod10 === 1 && mod100 !== 11) return "объект";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "объекта";
  return "объектов";
}
