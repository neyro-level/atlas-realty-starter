import { describe, expect, it } from "vitest";

import {
  formatArea,
  formatCompactRublePrice,
  formatFloorLabel,
  formatRussianCount,
  formatRublePrice,
  pluralizeRussian,
} from "../../packages/site-ui/src/lib/realty-format";

describe("Russian real-estate formatting", () => {
  it("uses Russian plural forms including teen exceptions", () => {
    const forms = ["объект", "объекта", "объектов"] as const;
    expect(pluralizeRussian(1, forms)).toBe("объект");
    expect(pluralizeRussian(2, forms)).toBe("объекта");
    expect(pluralizeRussian(5, forms)).toBe("объектов");
    expect(pluralizeRussian(11, forms)).toBe("объектов");
    expect(pluralizeRussian(21, forms)).toBe("объект");
  });

  it("formats prices, areas and counts consistently", () => {
    expect(formatRublePrice(12_500_000)).toMatch(/12\s500\s000\s₽/u);
    expect(formatCompactRublePrice(12_500_000)).toBe("12,5 млн ₽");
    expect(formatCompactRublePrice(null)).toBe("Цена уточняется");
    expect(formatArea(42.6)).toBe("42,6 м²");
    expect(formatRussianCount(24, ["объект", "объекта", "объектов"])).toBe("24 объекта");
  });

  it("normalizes floor labels without changing an existing label", () => {
    expect(formatFloorLabel("1–3")).toBe("1–3 этажа");
    expect(formatFloorLabel("11")).toBe("11 этажей");
    expect(formatFloorLabel("24 этажа")).toBe("24 этажа");
  });
});
