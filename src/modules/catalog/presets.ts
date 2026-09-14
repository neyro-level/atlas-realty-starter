import type { CatalogQuery } from "@/lib/catalog";
import { routes } from "@/project/routes";
import { tenant } from "@/project/tenant.config";

export type CatalogPresetMode =
  | "all"
  | "flat"
  | "house"
  | "land"
  | "commercial"
  | "new_building"
  | "construction";

export type CatalogPreset = {
  path: string;
  slug: string;
  navLabel: string;
  h1: string;
  title: string;
  description: string;
  mode: CatalogPresetMode;
  fixedFilters: CatalogQuery;
  indexing: "index" | "noindex";
  emptyMessage: string;
  forceEmpty?: boolean;
};

export const catalogPresets: CatalogPreset[] = [
  preset("nedvizhimost", "Вся недвижимость", `Недвижимость в ${tenant.cityRuLocative}`, `Недвижимость в ${tenant.cityRuLocative} купить - квартиры, дома, участки | ${tenant.brand}`, `Недвижимость в ${tenant.cityRuLocative}: квартиры, дома, участки и коммерческие объекты. Подберем варианты, проверим документы, поможем с ипотекой и сделкой.`, "all", {}),
  preset("kvartiry", "Квартиры", `Квартиры в ${tenant.cityRuLocative}`, `Купить квартиру в ${tenant.cityRuLocative} | ${tenant.brand}`, `Квартиры в ${tenant.cityRuLocative} по району, бюджету и комнатности. Покажем актуальные варианты, проверим документы и поможем с ипотекой и сделкой.`, "flat", { category: "flat" }),
  preset("odnokomnatnye-kvartiry", "1-комнатные", `Купить однокомнатную квартиру в ${tenant.cityRuLocative}`, `Купить однокомнатную квартиру в ${tenant.cityRuLocative} | ${tenant.brand}`, `Однокомнатные квартиры в ${tenant.cityRuLocative}: актуальные предложения с подбором по району, бюджету и документам.`, "flat", { category: "flat", rooms: 1 }),
  preset("dvuhkomnatnye-kvartiry", "2-комнатные", `Купить двухкомнатную квартиру в ${tenant.cityRuLocative}`, `Купить двухкомнатную квартиру в ${tenant.cityRuLocative} | ${tenant.brand}`, `Двухкомнатные квартиры в ${tenant.cityRuLocative} с актуальными ценами и подбором по району, бюджету и состоянию. Проверим документы и проведём сделку.`, "flat", { category: "flat", rooms: 2 }),
  preset("trehkomnatnye-kvartiry", "3-комнатные", `Купить трёхкомнатную квартиру в ${tenant.cityRuLocative}`, `Купить трёхкомнатную квартиру в ${tenant.cityRuLocative} | ${tenant.brand}`, `Трёхкомнатные квартиры в ${tenant.cityRuLocative}: семейные варианты с проверкой документов и сопровождением сделки.`, "flat", { category: "flat", rooms: 3 }),
  preset("kvartiry-studii", "Студии", `Купить квартиру-студию в ${tenant.cityRuLocative}`, `Купить квартиру-студию в ${tenant.cityRuLocative} | ${tenant.brand}`, `Квартиры-студии в ${tenant.cityRuLocative}: компактные варианты для жизни, аренды или первого жилья.`, "flat", { category: "flat", studio: true }),
  preset("vtorichnoe-zhile", "Вторичка", `Купить квартиру на вторичном рынке в ${tenant.cityRuLocative}`, `Купить квартиру в ${tenant.cityRuLocative} на вторичке | ${tenant.brand}`, `Вторичные квартиры в ${tenant.cityRuLocative} по району, бюджету и состоянию. Поможем выбрать вариант, проверить документы и провести сделку.`, "flat", { category: "flat" }),
  preset("novostroyki", "Новостройки", `ЖК и новостройки в ${tenant.cityRuLocative}`, `Новостройки и квартиры в ЖК ${tenant.cityRuGenitive} | ${tenant.brand}`, `ЖК и новостройки ${tenant.cityRuGenitive}: цены, планировки, сроки сдачи и ипотека по актуальным условиям. Сравним комплексы и поможем выбрать квартиру.`, "new_building", { category: "new_building" }),
  preset("zagorodnaya", "Загородная", `Загородная недвижимость в ${tenant.cityRuLocative}`, `Купить загородную недвижимость в ${tenant.cityRuLocative} | ${tenant.brand}`, `Дома, участки и строительство в ${tenant.cityRuLocative}. Подберем формат под задачу, проверим документы и поможем пройти сделку спокойно.`, "house", { category: "house" }),
  preset("doma", "Дома", `Купить дом в ${tenant.cityRuLocative}`, `Купить дом в ${tenant.cityRuLocative} - дома с документами | ${tenant.brand}`, `Дома в ${tenant.cityRuLocative} и регионе для покупки: подберем район, площадь и участок, проверим документы на дом и землю перед сделкой.`, "house", { category: "house" }),
  preset("zemelnye-uchastki", "Участки", `Купить земельный участок в ${tenant.cityRuLocative}`, `Купить земельный участок в ${tenant.cityRuLocative} - под строительство | ${tenant.brand}`, `Земельные участки в ${tenant.cityRuLocative} под строительство, дачу или инвестицию. Подберем локацию, проверим назначение, границы и документы.`, "land", { category: "land" }),
  preset("kottedzhnye-poselki", "Коттеджные посёлки", `Купить дом в коттеджном посёлке в ${tenant.cityRuLocative}`, `Купить дом в коттеджном посёлке в ${tenant.cityRuLocative} | ${tenant.brand}`, `Коттеджные посёлки и дома в посёлках ${tenant.cityRuGenitive}. Подберём варианты вручную при появлении данных.`, "house", { category: "house" }, "noindex", true),
  preset("stroitelstvo", "Строительство", `Строительство домов в ${tenant.cityRuLocative}`, `Строительство домов в ${tenant.cityRuLocative} | ${tenant.brand}`, `Проекты строительства домов в ${tenant.cityRuLocative}: выберите площадь и обсудите ипотечный сценарий со специалистом.`, "construction", { category: "construction" }),
  preset("kommercheskaya-nedvizhimost", "Коммерческая", `Коммерческая недвижимость в ${tenant.cityRuLocative}`, `Купить коммерческую недвижимость в ${tenant.cityRuLocative} | ${tenant.brand}`, `Коммерческие объекты в ${tenant.cityRuLocative} для бизнеса и инвестиций. Подберём помещение, проверим локацию, назначение, документы и условия сделки.`, "commercial", { category: "commercial" }),
  preset("ofisy", "Офисы", `Купить офис в ${tenant.cityRuLocative}`, `Купить офис в ${tenant.cityRuLocative} | ${tenant.brand}`, `Офисы в ${tenant.cityRuLocative} для бизнеса и инвестиций с подбором по локации и параметрам.`, "commercial", { category: "commercial", commercialType: "office" }),
  preset("torgovye-pomeshcheniya", "Торговые помещения", `Купить торговое помещение в ${tenant.cityRuLocative}`, `Купить торговое помещение в ${tenant.cityRuLocative} | ${tenant.brand}`, `Торговые помещения в ${tenant.cityRuLocative}: варианты под магазин, сервис или инвестиционную задачу.`, "commercial", { category: "commercial", commercialType: "retail" }),
  preset("sklady", "Склады", `Купить склад в ${tenant.cityRuLocative}`, `Купить склад в ${tenant.cityRuLocative} | ${tenant.brand}`, `Складские помещения в ${tenant.cityRuLocative} для хранения, логистики и бизнеса. Подберем объект по площади, подъезду, документам и задаче.`, "commercial", { category: "commercial", commercialType: "warehouse" }),
  preset("gotovyy-biznes", "Готовый бизнес", `Купить готовый бизнес в ${tenant.cityRuLocative}`, `Купить готовый бизнес в ${tenant.cityRuLocative} | ${tenant.brand}`, `Готовый бизнес в ${tenant.cityRuLocative}: коммерческие объекты и сценарии покупки под действующий проект.`, "commercial", { category: "commercial", commercialType: "business" }),
  preset("svobodnoe-naznachenie", "Свободное назначение", `Купить помещение свободного назначения в ${tenant.cityRuLocative}`, `Купить помещение свободного назначения в ${tenant.cityRuLocative} | ${tenant.brand}`, `Помещения свободного назначения в ${tenant.cityRuLocative} под офис, торговлю, сервис или другой формат бизнеса.`, "commercial", { category: "commercial", commercialType: "free_purpose" }),
];

export const catalogPresetPaths = catalogPresets.map((preset) => preset.path);

export function getCatalogPreset(slug: string) {
  return catalogPresets.find((preset) => preset.slug === slug) ?? null;
}

function preset(
  slug: string,
  navLabel: string,
  h1: string,
  title: string,
  description: string,
  mode: CatalogPresetMode,
  fixedFilters: CatalogQuery,
  indexing: "index" | "noindex" = "index",
  forceEmpty = false,
): CatalogPreset {
  return {
    path: routes.rootPage(slug),
    slug,
    navLabel,
    h1,
    title,
    description,
    mode,
    fixedFilters: { city: tenant.cityEn, dealType: "sale", ...fixedFilters },
    indexing,
    forceEmpty,
    emptyMessage:
      indexing === "noindex"
        ? "В этом разделе пока нет опубликованных объектов. Специалист агентства недвижимости подберёт подходящие варианты вручную."
        : "По выбранным параметрам объектов не найдено. Оставьте заявку, и специалист агентства недвижимости соберёт похожие варианты вручную.",
  };
}
