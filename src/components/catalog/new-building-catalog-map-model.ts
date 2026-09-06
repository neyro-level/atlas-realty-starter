import type { NewBuilding } from "@/modules/new-buildings";

export type MappableNewBuilding = NewBuilding & {
  location: NewBuilding["location"] & {
    latitude: number;
    longitude: number;
  };
};

/** Only registry coordinates are allowed to become visible map points. */
export function getMappableNewBuildings(complexes: NewBuilding[]): MappableNewBuilding[] {
  return complexes.filter((complex): complex is MappableNewBuilding => (
    complex.location.latitude !== null && complex.location.longitude !== null
  ));
}
