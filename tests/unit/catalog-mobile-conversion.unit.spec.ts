import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('mobile catalog conversion contract', () => {
  it('keeps the main catalog composition scoped to /nedvizhimost', () => {
    const page = readFileSync('src/components/marketing/CorporateLandingPage.tsx', 'utf8')

    expect(page).toContain('isMainCatalogIndex ? <CatalogMobilePresetsSection /> : null')
    expect(page).toContain('isMainCatalogIndex ? "main-catalog"')
    expect(page).toContain('<CatalogMobileBenefitsSection />')
    expect(page).toContain('<NewBuildingMobileConversionBar variant="all-property" />')
  })

  it('uses one collapsed mobile filter entry on the main catalog', () => {
    const view = readFileSync('src/components/catalog/CatalogMobileFilterView.tsx', 'utf8')

    expect(view).toContain('mode === "main-catalog"')
    expect(view).toContain('data-main-catalog-mobile-filter')
    expect(view).toContain('Фильтры и сортировка')
    expect(view).toContain('CatalogTypeSheet')
  })

  it('replaces mobile contact icons with a clear property details affordance', () => {
    const card = readFileSync('packages/site-ui/src/views/property/PropertyCardGridLayout.tsx', 'utf8')

    expect(card).toContain('Подробнее')
    expect(card).toContain('row-start-3')
    expect(card).toContain('lg:no-underline')
    expect(card).not.toContain('catalog_property_card_call')
  })

  it('keeps sticky visibility shared and the catalog request tenant-owned', () => {
    const visibility = readFileSync('src/components/marketing/useMobileStickyConversionVisibility.ts', 'utf8')
    const conversion = readFileSync('src/components/marketing/NewBuildingMobileConversionBar.tsx', 'utf8')

    expect(visibility).toContain('isCookieNoticeDismissed')
    expect(visibility).toContain('#site-footer .site-footer__bottom')
    expect(conversion).toContain('catalog:nedvizhimost:mobile_sticky')
    expect(conversion).toContain('property_purchase_split')
  })
})
