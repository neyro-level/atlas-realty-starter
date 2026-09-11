import Image from "next/image";
import { NewBuildingSelectionView } from "@ams/realty-ui";
import type { NewBuilding } from "../schema";
import { toNewBuildingDetailDto } from "../to-detail-dto";
import { RequestCta } from "./RequestCta";
import { siteProfile } from "@/project/site-profile";

export function NewBuildingLayoutsSection({ complex, contained = false }: { complex: NewBuilding; contained?: boolean }) {
  return (
    <NewBuildingSelectionView
      detail={toNewBuildingDetailDto(complex)}
      contained={contained}
      cityPrepositional={siteProfile.city.prepositional}
      imageRenderer={Image}
      requestAction={
        <RequestCta
          label="Получить подборку"
          complexName={complex.name}
          slug={complex.slug}
          complexId={complex.sourceId}
          variant="primary"
          modalTitle={`Получить подборку новостроек в ${siteProfile.city.prepositional}`}
          showIcon={false}
          className="mt-8 w-full bg-[var(--accent)] text-white shadow-[var(--new-building-layouts-section-shadow-01)] hover:bg-[var(--accent-hover)] md:w-auto"
        />
      }
    />
  );
}
