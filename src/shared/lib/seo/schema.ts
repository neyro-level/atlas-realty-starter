import type { ListingCard } from "@/lib/catalog";
import type { ArticleEditorialMeta } from "@/entities/article/editorial";
import type { ArticleSummary } from "@/entities/article/model";
import { contactsConfig, getPropertyPath, siteConfig } from "@/project/site-config";
import { tenant } from "@/project/tenant";
import { absoluteUrl } from "@/project/seo-config";
import { siteIdentity } from "@/project/site-identity";
import type { PublicSiteContacts } from "@/shared/types/public-site-contacts";

export function organizationSchema(contacts?: PublicSiteContacts) {
  const phone = contacts?.phone || contactsConfig.phone;
  const email = contacts?.email || siteIdentity.contacts.email;
  const streetAddress = contacts?.officeAddress || siteIdentity.contacts.address;
  const identifier = [
    siteIdentity.legal.inn
      ? { "@type": "PropertyValue", name: "ИНН", value: siteIdentity.legal.inn }
      : null,
    siteIdentity.legal.registrationNumber
      ? { "@type": "PropertyValue", name: "ОГРНИП", value: siteIdentity.legal.registrationNumber }
      : null,
  ].filter((value) => value !== null);

  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: siteConfig.clientFullName,
    legalName: siteIdentity.legal.name || undefined,
    url: absoluteUrl("/"),
    telephone: phone || undefined,
    email: email || undefined,
    areaServed: siteConfig.city,
    ...(streetAddress
      ? {
          address: {
            "@type": "PostalAddress",
            streetAddress,
            addressLocality: tenant.cityRu,
            addressCountry: "RU",
          },
        }
      : {}),
    identifier,
  };
}
export function websiteSchema(contacts?: PublicSiteContacts) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.clientFullName,
    url: absoluteUrl("/"),
    inLanguage: "ru-RU",
    publisher: organizationSchema(contacts),
  };
}

export function propertySchema(listing: ListingCard) {
  const offer = {
    "@type": "Offer",
    ...(listing.price !== null ? { price: listing.price } : {}),
    priceCurrency: "RUB",
    ...(listing.status === "active" && listing.isPublished ? { availability: "https://schema.org/InStock" } : {}),
    url: absoluteUrl(getPropertyPath(listing.slug)),
  };

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: listing.title,
    image: listing.images.length ? listing.images : listing.image ? [listing.image] : undefined,
    description: listing.description ?? listing.title,
    sku: listing.objectCode ?? listing.id,
    offers: offer,
    address: {
      "@type": "PostalAddress",
      streetAddress: listing.address,
      addressLocality: listing.city ?? siteConfig.city,
      addressCountry: "RU",
    },
  };
}

export function breadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.url),
    })),
  };
}

export function catalogItemListSchema(input: {
  name: string;
  path: string;
  items: Array<{ name: string; path: string; image?: string | null }>;
  startPosition?: number;
}) {
  const startPosition = input.startPosition ?? 1;
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: input.name,
    url: absoluteUrl(input.path),
    numberOfItems: input.items.length,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    itemListElement: input.items.map((item, index) => ({
      "@type": "ListItem",
      position: startPosition + index,
      url: absoluteUrl(item.path),
      item: {
        "@type": "Thing",
        name: item.name,
        url: absoluteUrl(item.path),
        image: item.image ? schemaMediaUrl(item.image) : undefined,
      },
    })),
  };
}

function schemaMediaUrl(value: string) {
  return /^https?:\/\//i.test(value) ? value : absoluteUrl(value);
}

export function articleSchema(article: ArticleSummary, editorialMeta?: ArticleEditorialMeta | null) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.seoDescription ?? article.excerpt ?? article.title,
    image: article.coverImage ? [article.coverImage] : undefined,
    datePublished: article.publishedAt ?? undefined,
    dateModified: article.updatedAt,
    author: {
      "@type": "Organization",
      name: siteConfig.clientFullName,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.clientFullName,
      telephone: contactsConfig.phone,
    },
    articleSection: editorialMeta?.topicLabel,
    keywords: editorialMeta?.keywords,
    mainEntityOfPage: absoluteUrl(`/journal/${article.slug}`),
  };
}

export function faqPageSchema(items: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function employeeProfileSchema(input: {
  fullName: string;
  position: string;
  photoUrl?: string | null;
  urlPath: string;
  reviewCount: number;
  rating: number | null;
  reviews: Array<{
    publicName: string;
    rating: number;
    text: string;
    publishedAt: string;
  }>;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: input.fullName,
    jobTitle: input.position,
    image: input.photoUrl ?? undefined,
    worksFor: {
      "@type": "RealEstateAgent",
      name: siteConfig.clientFullName,
      url: absoluteUrl("/"),
    },
    url: absoluteUrl(input.urlPath),
    aggregateRating:
      input.rating && input.reviewCount > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: input.rating,
            reviewCount: input.reviewCount,
            bestRating: 5,
            worstRating: 1,
          }
        : undefined,
    review: input.reviews.map((review) => ({
      "@type": "Review",
      author: {
        "@type": "Person",
        name: review.publicName,
      },
      reviewRating: {
        "@type": "Rating",
        ratingValue: review.rating,
        bestRating: 5,
        worstRating: 1,
      },
      reviewBody: review.text,
      datePublished: review.publishedAt,
    })),
  };
}
