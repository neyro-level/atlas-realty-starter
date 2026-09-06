import { newBuildingSchema, type NewBuilding, type NewBuildingInput } from "./schema";

export function defineNewBuilding(input: NewBuildingInput): NewBuilding {
  return newBuildingSchema.parse(input);
}
