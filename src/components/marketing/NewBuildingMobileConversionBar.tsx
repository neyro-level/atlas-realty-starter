"use client";

import { NewBuildingStickyConversionView } from "@starter/site-ui/views";
import { tenant } from "@/project/tenant.config";
import { useMobileStickyConversionVisibility } from "./useMobileStickyConversionVisibility";

export function NewBuildingMobileConversionBar({ complexName, complexSlug, complexId, variant = "new-buildings" }: { complexName?: string; complexSlug?: string; complexId?: string | null; variant?: "new-buildings" | "all-property" } = {}) {
  const visible = useMobileStickyConversionVisibility("[data-new-building-mobile-sticky-trigger]");
  const isDetail = Boolean(complexName && complexSlug);
  const isAllProperty = variant === "all-property";
  return <NewBuildingStickyConversionView
    visible={visible}
    ariaLabel={isAllProperty ? "Быстрый подбор недвижимости" : undefined}
    title={isDetail ? "Цены и планировки" : isAllProperty ? "Подбор недвижимости" : "Актуальные цены и наличие"}
    note={isDetail ? complexName! : isAllProperty ? "Бесплатно и по вашим критериям" : "Подбор бесплатный"}
    label={isDetail ? "Получить цены" : isAllProperty ? "Подобрать варианты" : "Получить подбор"}
    request={{
      title: isDetail ? `Получить цены и планировки в ${complexName}` : isAllProperty ? "Подобрать недвижимость" : "Получить подборку новостроек",
      subtitle: isDetail ? `Проверим актуальное наличие квартир в ${complexName}, запросим цены и пришлём подходящие планировки.` : isAllProperty ? "Уточним ваши требования и подберём подходящие квартиры, дома, участки или коммерческую недвижимость." : `Уточним ваши требования и подберём подходящие квартиры в новостройках ${tenant.cityRuGenitive}.`,
      source: isDetail ? `new_building:${complexSlug}:mobile_sticky` : isAllProperty ? "catalog:nedvizhimost:mobile_sticky" : "catalog:novostroyki:mobile_sticky",
      formType: isDetail ? "new_building_prices_plans_request" : isAllProperty ? "property_purchase_split" : "new_building_catalog_selection",
      submitLabel: isDetail ? "Получить цены" : isAllProperty ? "Подобрать объект" : "Получить подбор",
      showSubtitle: true,
      complexId: complexId ?? undefined,
      complexName,
    }}
  />;
}
