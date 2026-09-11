import { formatRussianCount } from "@ams/realty-ui";
import { tenant } from "@/project/tenant";

/** Neutral share packaging for `/izbrannoe/s/[token]` (messenger OG + Web Share). */
export function buildSavedSelectionShareTitle() {
  return `Подборка недвижимости в ${tenant.cityRu}`;
}

export function buildSavedSelectionShareDescription(count: number) {
  if (count <= 0) {
    return `Сохранённая подборка объектов. Откройте ссылку, чтобы посмотреть варианты.`;
  }

  return `${formatRussianCount(count, ["объект", "объекта", "объектов"])} в сохранённой подборке. Откройте ссылку, чтобы посмотреть варианты.`;
}

export function buildSavedSelectionShareText(count: number) {
  return buildSavedSelectionShareDescription(count);
}
