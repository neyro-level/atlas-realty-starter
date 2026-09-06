export type HouseProject = {
  id: string;
  slug: string;
  number: number;
  area: number;
  status: "preview";
  updatedAt: string;
};

const areas = [75, 82, 85, 90, 95, 97, 100, 102, 105, 110, 115, 120] as const;

export const houseProjects: HouseProject[] = areas.map((area, index) => {
  const number = index + 1;
  const padded = String(number).padStart(2, "0");
  const id = `hp-${String(number).padStart(3, "0")}`;

  return {
    id,
    slug: `proekt-stroitelstva-${padded}-${id}`,
    number,
    area,
    status: "preview",
    updatedAt: "2026-07-23",
  };
});

export function getHouseProject(slug: string) {
  return houseProjects.find((project) => project.slug === slug) ?? null;
}

