import { CatalogMobileFeatureGridView, type CatalogMobileFeatureItem } from '@starter/site-ui/views'

const BENEFITS: readonly CatalogMobileFeatureItem[] = [
  {
    icon: 'selection',
    title: 'Бесплатный подбор',
    text: 'Соберём варианты под вашу задачу и бюджет.',
  },
  {
    icon: 'mortgage',
    title: 'Помощь с ипотекой',
    text: 'Рассчитаем платёж и подскажем порядок заявки.',
  },
  {
    icon: 'legal',
    title: 'Проверка документов',
    text: 'Проверим документы и риски до задатка.',
  },
  {
    icon: 'support',
    title: 'Сопровождение сделки',
    text: 'Проведём по этапам от выбора до получения ключей.',
  },
]

export function CatalogMobileBenefitsSection() {
  return (
    <CatalogMobileFeatureGridView
      id="catalog-mobile-benefits-title"
      title="Преимущества покупки с агентством"
      items={BENEFITS}
    />
  )
}
