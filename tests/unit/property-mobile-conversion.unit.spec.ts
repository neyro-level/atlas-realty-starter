import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('mobile property conversion contract', () => {
  it('keeps mobile order explicit while preserving desktop DOM order', () => {
    const view = readFileSync('src/components/property/PropertyDetailPageView.tsx', 'utf8')

    expect(view.indexOf('{description}')).toBeLessThan(view.indexOf('{details}'))
    expect(view).toContain('order-4 lg:order-none')
    expect(view).toContain('order-3 lg:order-none')
    expect(view).toContain('hidden lg:block">{building}')
    expect(view).toContain('hidden lg:block">{viewing}')
    expect(view).not.toContain('inlineSidebar')
  })

  it('shows price in the summary only below desktop', () => {
    const sections = readFileSync('packages/site-ui/src/views/property/PropertyDetailSectionsView.tsx', 'utf8')

    expect(sections).toContain('data-property-mobile-price')
    expect(sections).toContain('text-price-large')
    expect(sections).toContain('lg:hidden')
  })

  it('passes complete property context into the mobile request', () => {
    const page = readFileSync('src/app/(site)/obekty/[slug]/page.tsx', 'utf8')
    const bar = readFileSync('src/components/property/PropertyObjectMobileConversionBar.tsx', 'utf8')

    expect(page).toContain('<PropertyObjectMobileConversionBar')
    for (const field of ['propertyId', 'agentId', 'propertyTitle', 'propertyAddress', 'propertyObjectCode', 'propertyPath']) {
      expect(bar).toContain(field)
    }
    expect(bar).toContain('property_consultation')
  })

  it('uses the neutral shared sticky view instead of a property-specific duplicate', () => {
    const propertyBar = readFileSync('src/components/property/PropertyObjectMobileConversionBar.tsx', 'utf8')
    const newBuildingView = readFileSync('packages/site-ui/src/views/new-building/NewBuildingStickyConversionView.tsx', 'utf8')
    const sharedView = readFileSync('packages/site-ui/src/views/shared/MobileStickyConversionView.tsx', 'utf8')

    expect(propertyBar).toContain('MobileStickyConversionView')
    expect(newBuildingView).toContain('MobileStickyConversionView')
    expect(sharedView).toContain('text-white [&_svg]:text-white')
  })
})
