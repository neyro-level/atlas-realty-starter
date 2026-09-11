import type { CatalogQuery } from "@/lib/catalog";
import type { NewBuilding } from "./schema";

export function filterNewBuildings(complexes: readonly NewBuilding[], query: Pick<CatalogQuery, "priceFrom" | "priceTo" | "q" | "sort">) {
  const needle = query.q?.trim().toLocaleLowerCase("ru-RU");
  const filtered = complexes.filter((complex) => {
    const price = complex.facts.priceFrom;
    if (query.priceFrom && (price === null || price < query.priceFrom)) return false;
    if (query.priceTo && (price === null || price > query.priceTo)) return false;
    if (!needle) return true;

    const haystack = [
      complex.name,
      complex.shortName,
      complex.location.city,
      complex.location.district,
      complex.location.address,
      complex.developer.name,
      complex.facts.completionLabel,
      complex.facts.formats.join(" "),
    ]
      .filter(Boolean)
      .join(" ")
      .toLocaleLowerCase("ru-RU");

    return haystack.includes(needle);
  });

  if (query.sort !== "price_asc" && query.sort !== "price_desc") return filtered;
  const direction = query.sort === "price_asc" ? 1 : -1;
  return [...filtered].sort((left, right) => comparePrices(left.facts.priceFrom, right.facts.priceFrom, direction));
}

function comparePrices(left: number | null, right: number | null, direction: 1 | -1) {
  if (left === null && right === null) return 0;
  if (left === null) return 1;
  if (right === null) return -1;
  return (left - right) * direction;
}
