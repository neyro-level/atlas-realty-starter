import { NewBuildingPurchaseTermsView } from "@starter/site-ui/views";
import type { NewBuilding } from "../schema";
import { toNewBuildingDetailDto } from "../to-detail-dto";

export function NewBuildingPurchaseTermsSection({ complex, contained = false }: { complex: NewBuilding; contained?: boolean }) {
  return <NewBuildingPurchaseTermsView detail={toNewBuildingDetailDto(complex)} contained={contained} />;
}

export function selectVisiblePurchaseTerms(terms: NewBuilding["purchaseOptions"]) {
  return terms.slice(0, 2);
}
