import { describe, expect, it } from "vitest";

import { catalogItemListSchema } from "@/shared/lib/seo/schema";

describe("catalog structured data", () => {
  it("builds absolute ItemList entries with pagination positions", () => {
    const schema = catalogItemListSchema({
      name: "Квартиры",
      path: "/kvartiry?page=2",
      startPosition: 25,
      items: [
        { name: "Квартира 1", path: "/obekty/kvartira-1", image: "/media/flat-1.webp" },
        { name: "Квартира 2", path: "/obekty/kvartira-2" },
      ],
    });

    expect(schema["@type"]).toBe("ItemList");
    expect(schema.numberOfItems).toBe(2);
    expect(schema.itemListElement.map((item) => item.position)).toEqual([25, 26]);
    expect(schema.url).toMatch(/\/kvartiry\?page=2$/u);
    expect(schema.itemListElement[0]?.item.url).toMatch(/\/obekty\/kvartira-1$/u);
    expect(schema.itemListElement[0]?.item.image).toMatch(/\/media\/flat-1\.webp$/u);
  });
});
