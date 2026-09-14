import Link from 'next/link'
import type { SiteLinkRendererProps } from '@starter/site-ui/contracts'
import { CatalogMobileFeatureGridView, type CatalogMobileFeatureItem } from '@starter/site-ui/views'

import { routes } from '@/project/routes'

const PRESETS: readonly CatalogMobileFeatureItem[] = [
  {
    icon: 'apartment',
    title: 'Квартиры',
    text: 'Готовые квартиры для жизни и инвестиций',
    href: routes.rootPage('kvartiry'),
  },
  {
    icon: 'home',
    title: 'Дома',
    text: 'Загородные дома для постоянной жизни',
    href: routes.rootPage('doma'),
  },
  {
    icon: 'land',
    title: 'Участки',
    text: 'Земля для дома или собственного проекта',
    href: routes.rootPage('zemelnye-uchastki'),
  },
  {
    icon: 'new-building',
    title: 'Новостройки',
    text: 'Квартиры в новых жилых комплексах',
    href: routes.rootPage('novostroyki'),
  },
]

export function CatalogMobilePresetsSection() {
  return (
    <CatalogMobileFeatureGridView
      id="catalog-mobile-presets-title"
      eyebrow="Быстрый выбор"
      title="Популярные категории"
      items={PRESETS}
      linkRenderer={CatalogPresetLink}
    />
  )
}

function CatalogPresetLink({ href, children, ariaCurrent, ariaLabel, ...props }: SiteLinkRendererProps) {
  return (
    <Link href={href} aria-current={ariaCurrent} aria-label={ariaLabel} {...props}>
      {children}
    </Link>
  )
}
