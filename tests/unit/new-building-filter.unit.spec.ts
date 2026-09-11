import { describe, expect, it } from "vitest";
import { filterNewBuildings } from "@/modules/new-buildings/filter";
import type { NewBuilding } from "@/modules/new-buildings";

function complex(slug: string, name: string, priceFrom: number | null, developer = "ГК Тест") {
  return {
    slug,
    name,
    shortName: name,
    developer: { name: developer },
    location: { city: "Краснодар", district: null, address: `${name}, Краснодар` },
    facts: { completionLabel: "2027", formats: ["Квартиры"], priceFrom },
  } as NewBuilding;
}

describe("new-building catalog filter", () => {
  const complexes = [
    complex("opera", "ЖК Опера", 5_900_000, "ГК Альфа"),
    complex("rekord", "ЖК Рекорд", 7_400_000, "ГК Бета"),
    complex("future", "ЖК Будущий", null, "ГК Альфа"),
  ];

  it("filters by searchable fields and inclusive price bounds", () => {
    expect(filterNewBuildings(complexes, { q: "альфа", priceTo: 6_000_000 }).map((item) => item.slug)).toEqual(["opera"]);
    expect(filterNewBuildings(complexes, { priceFrom: 6_000_000 }).map((item) => item.slug)).toEqual(["rekord"]);
  });

  it("sorts priced complexes and keeps missing prices last", () => {
    expect(filterNewBuildings(complexes, { sort: "price_desc" }).map((item) => item.slug)).toEqual(["rekord", "opera", "future"]);
    expect(filterNewBuildings(complexes, { sort: "price_asc" }).map((item) => item.slug)).toEqual(["opera", "rekord", "future"]);
  });
});
