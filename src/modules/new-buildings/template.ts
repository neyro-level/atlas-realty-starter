/** Shared outer gutter for the whole new-building detail page. */
export const NEW_BUILDING_DETAIL_FRAME_CLASS = "mx-auto max-w-site-frame px-3 sm:px-5";

export const NEW_BUILDING_DETAIL_TEMPLATE_SECTIONS = [
  "gallery",
  "about",
  "purchaseTerms",
  "selectionBanner",
  "location",
  "related",
] as const;

export type NewBuildingDetailTemplateSection = (typeof NEW_BUILDING_DETAIL_TEMPLATE_SECTIONS)[number];
