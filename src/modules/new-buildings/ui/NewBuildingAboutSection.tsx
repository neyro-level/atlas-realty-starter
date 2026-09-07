import { NewBuildingAboutView } from "@ams/realty-ui";
import type { NewBuilding } from "../schema";
import { toNewBuildingDetailDto } from "../to-detail-dto";

export function NewBuildingAboutSection({
  complex,
  contained = false,
}: {
  complex: NewBuilding;
  contained?: boolean;
}) {
  return <NewBuildingAboutView detail={toNewBuildingDetailDto(complex)} contained={contained} />;
}
