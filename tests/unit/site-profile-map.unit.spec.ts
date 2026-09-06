import { describe, expect, it } from "vitest";

import { getMappableNewBuildings } from "@/components/catalog/new-building-catalog-map-model";
import { siteProfile } from "@/project/site-profile";

describe("Atlas map profile", () => {
  it("uses the Krasnodar identity and center", () => {
    expect(siteProfile.city).toMatchObject({ nominative: "Краснодар", slug: "krasnodar" });
    expect(siteProfile.map.center[0]).toBeGreaterThan(44);
    expect(siteProfile.map.center[0]).toBeLessThan(46);
    expect(siteProfile.map.center[1]).toBeGreaterThan(38);
    expect(siteProfile.map.center[1]).toBeLessThan(40);
  });

  it("keeps objects without coordinates out of the interactive map", () => {
    const complexes = [
      { slug: "mapped", location: { latitude: 45.03, longitude: 38.97 } },
      { slug: "review", location: { latitude: null, longitude: null } },
    ];

    expect(getMappableNewBuildings(complexes as never)).toHaveLength(1);
    expect(getMappableNewBuildings(complexes as never)[0]?.slug).toBe("mapped");
  });
});
