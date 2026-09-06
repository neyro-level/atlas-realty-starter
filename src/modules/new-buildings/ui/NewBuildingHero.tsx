import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { NewBuildingHeroView } from "@starter/site-ui";
import { NEW_BUILDING_DETAIL_FRAME_CLASS } from "../template";
import type { NewBuilding } from "../schema";

export function NewBuildingHero({ complex }: { complex: NewBuilding }) {
  return <NewBuildingHeroView
      name={complex.name}
      frameClassName={NEW_BUILDING_DETAIL_FRAME_CLASS}
      breadcrumbs={<Breadcrumbs
          items={[
            { label: "Главная", href: "/" },
            { label: "Недвижимость", href: "/nedvizhimost" },
            { label: "Новостройки", href: "/novostroyki" },
            { label: complex.name },
          ]}
          className="mb-7 md:mb-8"
        />}
    />;
}
