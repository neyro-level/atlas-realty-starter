import Image, { type ImageProps } from "next/image";
import { NewBuildingCatalogWhyAgencyView, NewBuildingPurchaseProcessView, type SiteImageRendererProps } from "@ams/realty-ui";
import { siteProfile } from "@/project/site-profile";

const BENEFITS = [
  "Сравним квартиры разных застройщиков.",
  "Уточним реальное наличие и актуальные условия.",
  "Рассчитаем ипотеку и ежемесячный платёж.",
  "Проверим документы и схему расчётов.",
  "Организуем показы и сопроводим сделку.",
] as const;

const STEPS = [
  { title: "Уточняем бюджет и требования", description: "Определяем способ оплаты, желаемый район, площадь квартиры и подходящий срок переезда." },
  { title: "Сравниваем ЖК и квартиры", description: "Сопоставляем цены, планировки, сроки сдачи и условия разных застройщиков." },
  { title: "Проверяем ипотеку и документы", description: "Рассчитываем ежемесячный платёж, проверяем программу и документы перед бронированием." },
  { title: "Организуем показы и сопровождаем сделку", description: "Согласовываем просмотры, помогаем с оформлением и остаёмся рядом до завершения сделки." },
] as const;

export function NewBuildingCatalogConversion() {
  return <><NewBuildingCatalogWhyAgencyView brand={siteProfile.brand} benefits={BENEFITS} expertName={siteProfile.expert.name} expertRole={siteProfile.expert.role} portrait={siteProfile.expert.portrait} imageRenderer={CatalogImage} /><NewBuildingPurchaseProcessView steps={STEPS} /></>;
}

function CatalogImage({ alt, ...props }: SiteImageRendererProps) {
  return <Image alt={alt} {...props as Omit<ImageProps, "alt">} />;
}
