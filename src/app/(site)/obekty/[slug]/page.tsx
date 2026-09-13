import type { HouseProjectPreviewDto } from '@starter/site-contracts'
import {
  HouseProjectPreviewView,
  PropertyBuildingView,
  PropertyDescriptionView,
  PropertyDetailsView,
  PropertyDetailSummaryView,
  PropertyRelatedView,
  type SiteLinkRendererProps,
} from '@starter/site-ui'
import { PropertyDetailPageView } from '@/components/property/PropertyDetailPageView'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import {
  OBJECT_METADATA_DESCRIPTION_MAX_LENGTH,
  OBJECT_METADATA_TITLE_MAX_LENGTH,
  buildBuildingDescription,
  buildDetailsHeading,
  buildObjectBreadcrumbs,
  buildObjectDetailRows,
  buildObjectMetaDescription,
  buildObjectMobileTopBarTitle,
  buildObjectSeoTitle,
  buildObjectSummarySpecs,
  buildObjectVisibleHeadingTitle,
  buildRelatedPropertyItem,
  buildSuggestedOffer,
  buildViewingDateOptions,
  buildYandexMapUrl,
  getPricePerMeter,
  getPropertySocialPreviewImage,
  getPublicListingBySlug,
  getSimilarListings,
  normalizeObjectDescription,
  resolvePropertyRobots,
  resolveVisibleHeadingAddress,
} from './property-page-model'
import { PropertyPageActions } from './PropertyPageActions'
import { DeferredSimilarPropertyImage, PropertyObjectGallery } from './PropertyObjectGallery'
import { PropertyObjectMobileTopBar } from './PropertyObjectMobileTopBar'
import { PropertyObjectSidebar } from './PropertyObjectSidebar'
import { PropertyViewingRequestSection } from './PropertyViewingRequestSection'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { formatPrice } from '@/lib/catalog'
import { getHouseProject } from '@/modules/house-projects'
import { toSessionListingItem } from '@/modules/session-collections'
import { appendBrandOnce, truncateSeoText } from '@/modules/seo/metadata'
import { getPropertyPath, getSiteUrl, siteConfig } from '@/project/site-config'
import {
  defaultSocialPreview,
  defaultSocialPreviewPath,
  socialImage,
} from '@/project/social-preview'
import { splitBlurredAddress, shouldBlurPropertyAddress } from '@/shared/lib/property-address-blur'
import { breadcrumbSchema, propertySchema } from '@/shared/lib/seo/schema'
import { JsonLd } from '@/shared/ui/JsonLd'
import { getPublicSiteContacts } from '@/site-engine/site-contacts'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const houseProject = getHouseProject(slug)

  if (houseProject) {
    const title = `Проект строительства дома ${String(houseProject.number).padStart(2, '0')} - ${houseProject.area} м²`
    const description = `Preview проекта строительства дома ${houseProject.area} м² в Краснодаре. Стоимость, материалы и сроки уточняются после разбора участка и задачи.`
    return {
      alternates: { canonical: getPropertyPath(houseProject.slug) },
      description,
      openGraph: {
        description,
        images: [defaultSocialPreview],
        siteName: siteConfig.clientFullName,
        title,
        type: 'website',
        url: getPropertyPath(houseProject.slug),
      },
      robots: { follow: true, index: false },
      title,
      twitter: {
        card: 'summary_large_image',
        description,
        images: [defaultSocialPreviewPath],
        title,
      },
    }
  }

  const listing = await getPublicListingBySlug(slug)
  if (!listing) return { robots: { follow: false, index: false }, title: 'Объект не найден' }

  const path = getPropertyPath(listing.slug)
  const url = `${getSiteUrl().replace(/\/$/u, '')}${path}`
  const publicContacts = await getPublicSiteContacts()
  const hideHouseNumber = shouldBlurPropertyAddress({
    categoryKey: listing.categoryKey,
    enabled: publicContacts.hidePropertyHouseNumbers,
    origin: listing.origin,
  })
  const generatedTitle = buildObjectSeoTitle(listing, { hideHouseNumber })
  const customMetaTitle = hideHouseNumber ? null : listing.seoTitle?.trim()
  const customMetaDescription = hideHouseNumber ? null : listing.seoDescription?.trim()
  const metaTitle = appendBrandOnce(
    customMetaTitle || generatedTitle.baseTitle,
    siteConfig.clientName,
    OBJECT_METADATA_TITLE_MAX_LENGTH,
  )
  const metaDescription = truncateSeoText(
    customMetaDescription || buildObjectMetaDescription(listing, generatedTitle),
    OBJECT_METADATA_DESCRIPTION_MAX_LENGTH,
  )
  const previewImage = getPropertySocialPreviewImage(listing)

  return {
    alternates: { canonical: path },
    description: metaDescription,
    openGraph: {
      description: metaDescription,
      images: [socialImage(previewImage, metaTitle)],
      title: metaTitle,
      url,
    },
    robots: resolvePropertyRobots(listing),
    title: { absolute: metaTitle },
    twitter: {
      card: 'summary_large_image',
      description: metaDescription,
      images: [previewImage ?? defaultSocialPreviewPath],
      title: metaTitle,
    },
  }
}

export default async function PropertyPage({ params }: Props) {
  const { slug } = await params
  const houseProject = getHouseProject(slug)
  if (houseProject) return <HouseProjectPreviewPage project={houseProject} />

  const listing = await getPublicListingBySlug(slug)
  if (!listing) notFound()

  const path = getPropertyPath(listing.slug)
  const objectBreadcrumbs = buildObjectBreadcrumbs(listing)
  const breadcrumbs = breadcrumbSchema([
    { name: 'Главная', url: '/' },
    ...objectBreadcrumbs.map((item, index) => ({
      name: index === objectBreadcrumbs.length - 1 ? listing.title : item.label,
      url: item.href ?? path,
    })),
  ])
  const generatedTitle = buildObjectSeoTitle(listing)
  const displayTitle = listing.h1 ?? generatedTitle.h1
  const visibleHeadingTitle = listing.h1 ?? buildObjectVisibleHeadingTitle(listing)
  const images = listing.images.length ? listing.images : listing.image ? [listing.image] : []
  const publicContacts = await getPublicSiteContacts()
  const shouldBlurAddress = shouldBlurPropertyAddress({
    categoryKey: listing.categoryKey,
    enabled: publicContacts.hidePropertyHouseNumbers,
    origin: listing.origin,
  })
  const visibleHeadingAddress = resolveVisibleHeadingAddress(
    listing,
    generatedTitle,
    visibleHeadingTitle,
    shouldBlurAddress,
  )
  const visibleHeadingAddressParts = shouldBlurAddress
    ? splitBlurredAddress(visibleHeadingAddress)
    : { hiddenHousePart: null, visiblePrefix: visibleHeadingAddress }
  const pricePerMeter = getPricePerMeter(listing)
  const suggestedOffer = buildSuggestedOffer(listing)
  const sessionItem = toSessionListingItem(listing, displayTitle)
  const objectLeadAddress = listing.address?.trim() || visibleHeadingAddress || null
  const descriptionParagraphs = normalizeObjectDescription(listing.description, listing.objectCode)
  const similarListings = await getSimilarListings(listing)

  return (
    <PropertyDetailPageView
      structuredData={
        <>
          <JsonLd data={propertySchema(listing)} />
          <JsonLd data={breadcrumbs} />
        </>
      }
      mobileTopBar={
        <PropertyObjectMobileTopBar
          backHref={
            [...objectBreadcrumbs].reverse().find((item) => item.href)?.href ?? '/nedvizhimost'
          }
          price={formatPrice(listing.price)}
          sessionItem={sessionItem}
          title={buildObjectMobileTopBarTitle(listing)}
        />
      }
      breadcrumbs={
        <Breadcrumbs
          className="mb-5 max-lg:hidden"
          items={[{ href: '/', label: 'Главная' }, ...objectBreadcrumbs]}
        />
      }
      gallery={
        <PropertyObjectGallery
          address={listing.address}
          imageAlt={listing.title}
          images={images}
          mapUrl={buildYandexMapUrl(listing.address)}
          videoUrl={listing.videoUrl}
          videoUrls={listing.videoUrls}
        />
      }
      summary={
        <PropertyDetailSummaryView
          address={visibleHeadingAddressParts.visiblePrefix}
          addressHidden={Boolean(visibleHeadingAddressParts.hiddenHousePart)}
          exclusive={listing.isExclusive}
          items={buildObjectSummarySpecs(listing)}
          title={visibleHeadingTitle}
        />
      }
      inlineSidebar={
        <PropertyObjectSidebar
          agentId={listing.agentId}
          agentName={listing.agentName}
          agentPhotoUrl={listing.agentPhotoUrl}
          className="lg:hidden"
          meterPrice={pricePerMeter}
          objectAddress={objectLeadAddress}
          objectCode={listing.objectCode}
          price={formatPrice(listing.price)}
          propertyId={listing.id}
          sessionItem={sessionItem}
          sourcePage={path}
          suggestedOffer={suggestedOffer}
          title={visibleHeadingTitle}
          variant="inline"
        />
      }
      description={
        descriptionParagraphs ? (
          <PropertyDescriptionView paragraphs={descriptionParagraphs} />
        ) : null
      }
      details={
        <PropertyDetailsView
          rows={buildObjectDetailRows(listing, shouldBlurAddress)}
          title={buildDetailsHeading(listing)}
        />
      }
      building={<PropertyBuildingView description={buildBuildingDescription(listing)} />}
      viewing={
        <PropertyViewingRequestSection
          agentId={listing.agentId}
          dates={buildViewingDateOptions()}
          propertyId={listing.id}
          sourcePage={path}
          title={listing.title}
        />
      }
      related={
        <PropertyRelatedView
          imageRenderer={DeferredSimilarPropertyImage}
          items={similarListings.map(buildRelatedPropertyItem)}
          linkRenderer={PropertyDetailLink}
        />
      }
      desktopSidebar={
        <PropertyObjectSidebar
          agentId={listing.agentId}
          agentName={listing.agentName}
          agentPhotoUrl={listing.agentPhotoUrl}
          className="hidden lg:block"
          meterPrice={pricePerMeter}
          objectAddress={objectLeadAddress}
          objectCode={listing.objectCode}
          price={formatPrice(listing.price)}
          propertyId={listing.id}
          sessionItem={sessionItem}
          sourcePage={path}
          suggestedOffer={suggestedOffer}
          title={visibleHeadingTitle}
        />
      }
    />
  )
}

function HouseProjectPreviewPage({
  project,
}: {
  project: NonNullable<ReturnType<typeof getHouseProject>>
}) {
  const path = getPropertyPath(project.slug)
  const breadcrumbs = breadcrumbSchema([
    { name: 'Главная', url: '/' },
    { name: 'Недвижимость', url: '/nedvizhimost' },
    { name: `Проект ${String(project.number).padStart(2, '0')}`, url: path },
  ])
  const numberLabel = String(project.number).padStart(2, '0')
  const detail: HouseProjectPreviewDto = {
    areaLabel: `${project.area} м²`,
    backHref: '/stroitelstvo',
    description:
      'Стоимость, материалы, сроки и комплектация не указаны без подтверждённых данных. Специалист агентства недвижимости сначала уточнит участок, бюджет и ипотечный сценарий.',
    id: project.id,
    numberLabel,
    slug: project.slug,
    title: `Проект строительства дома ${numberLabel}`,
  }

  return (
    <HouseProjectPreviewView
      actions={
        <PropertyPageActions propertyId={project.id} sourcePage={path} title={detail.title} />
      }
      breadcrumbs={
        <Breadcrumbs
          items={[
            { href: '/', label: 'Главная' },
            { href: '/nedvizhimost', label: 'Недвижимость' },
            { href: '/stroitelstvo', label: 'Строительство' },
            { label: `Проект ${numberLabel}` },
          ]}
        />
      }
      linkRenderer={PropertyDetailLink}
      project={detail}
      structuredData={<JsonLd data={breadcrumbs} />}
    />
  )
}

function PropertyDetailLink({
  ariaCurrent,
  ariaLabel,
  children,
  href,
  scroll,
  ...props
}: SiteLinkRendererProps) {
  return (
    <Link aria-current={ariaCurrent} aria-label={ariaLabel} href={href} scroll={scroll} {...props}>
      {children}
    </Link>
  )
}
