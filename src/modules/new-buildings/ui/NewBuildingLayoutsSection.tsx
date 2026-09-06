import Image from "next/image";
import { NewBuildingSelectionView } from "@starter/site-ui";
import type { NewBuilding } from "../schema";
import { toNewBuildingDetailDto } from "../to-detail-dto";
import { RequestCta } from "./RequestCta";

export function NewBuildingLayoutsSection({ complex, contained = false }: { complex: NewBuilding; contained?: boolean }) {
  return (
    <NewBuildingSelectionView
      detail={toNewBuildingDetailDto(complex)}
      contained={contained}
      imageRenderer={Image}
      requestAction={
        <RequestCta
          label="Получить подборку"
          complexName={complex.name}
          slug={complex.slug}
          variant="primary"
          modalTitle="Получить подборку новостроек в вашем городе"
          showIcon={false}
          className="mt-8 w-full bg-[#8A1515] text-white shadow-[0_8px_18px_rgba(138,21,21,0.18)] hover:bg-[#630E0E] md:w-auto"
        />
      }
    />
  );
}
