import Link from "next/link";
import { BadgePercent, Map, Sparkles, WalletCards } from "lucide-react";
import { NewBuildingQuickSelectionsView, type NewBuildingQuickSelectionItem, type SiteLinkRendererProps } from "@starter/site-ui";
import type { CatalogQuery } from "@/lib/catalog";
import { filterNewBuildings, type NewBuilding } from "@/modules/new-buildings";
import { buildNewBuildingQuickSelectionModel } from "./new-building-quick-selections-model";
import { tenant } from "@/project/tenant.config";

export function NewBuildingQuickSelections({ basePath, query, complexes }: { basePath: string; query: CatalogQuery; complexes: readonly NewBuilding[] }) {
  const affordableCount = filterNewBuildings(complexes, { priceTo: 6_000_000 }).length;
  const model = buildNewBuildingQuickSelectionModel(basePath, query, affordableCount, complexes.length);
  const items: NewBuildingQuickSelectionItem[] = [
    {
      ...model[0],
      icon: WalletCards,
    },
    {
      ...model[1],
      icon: Map,
    },
    {
      ...model[2],
      icon: BadgePercent,
      request: {
        title: "Проверить условия ипотеки для новостройки",
        subtitle: "Оставьте контакты. Специалист проверит применимые программы, рассчитает платёж и поможет подготовить документы.",
        source: model[2].source,
        formType: model[2].formType,
        submitLabel: "Проверить ипотеку",
        showSubtitle: true,
      },
    },
    {
      ...model[3],
      icon: Sparkles,
      request: {
        title: "Получить подборку новостроек",
        subtitle: `Оставьте контакты. Уточним требования и сравним подходящие квартиры в жилых комплексах ${tenant.cityRuGenitive}.`,
        source: model[3].source,
        formType: model[3].formType,
        submitLabel: "Получить подбор",
        showSubtitle: true,
      },
    },
  ];

  return <NewBuildingQuickSelectionsView items={items} linkRenderer={LinkAdapter} />;
}

function LinkAdapter({ href, children, ariaLabel, ariaCurrent, scroll, ...props }: SiteLinkRendererProps) {
  return <Link href={href} aria-label={ariaLabel} aria-current={ariaCurrent} scroll={scroll} {...props}>{children}</Link>;
}
