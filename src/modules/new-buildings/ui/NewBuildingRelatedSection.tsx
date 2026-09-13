import { CatalogResidentialComplexCard } from "@/components/catalog/CatalogResidentialComplexCard";
import { NewBuildingRelatedView } from "@starter/site-ui";
import type { NewBuilding } from "../schema";
import { toNewBuildingCardDto } from "../to-detail-dto";

export function NewBuildingRelatedSection({
  contained = false,
  related,
}: {
  contained?: boolean;
  related: NewBuilding[];
}) {
  return <NewBuildingRelatedView related={related.map(toNewBuildingCardDto)} contained={contained} renderCard={(item) => {
    const complex = related.find((candidate) => candidate.slug === item.slug);
    return complex ? <CatalogResidentialComplexCard complex={complex} /> : null;
  }} />;
}
