import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { EmployeeProfilePageDto } from "@starter/site-contracts";
import { EmployeeProfileView, type SiteLinkRendererProps } from "@ams/realty-ui";
import { CatalogPropertyCard } from "@/components/catalog/CatalogPropertyCard";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import type { EmployeeProfileResult } from "@/modules/employees";
import { resolvePublicEmployeePhone } from "@/modules/employees/phone-policy";
import { getDefaultEmployeeTeamSection } from "@/modules/employees/positions";
import { EmployeeContactDetails } from "@/modules/employees/ui/EmployeeContactDetails";
import { EmployeePortrait } from "@/modules/employees/ui/EmployeePortrait";
import { EmployeeReviewForm } from "@/modules/employees/ui/EmployeeReviewForm";
import { LeadForm } from "@/modules/leads";
import { buildSeoMetadata } from "@/modules/seo/metadata";
import { breadcrumbSchema, employeeProfileSchema } from "@/shared/lib/seo/schema";
import { JsonLd } from "@/shared/ui/JsonLd";
import type { ListingCategoryKey } from "@/lib/catalog";
import { getPublicSiteContacts } from "@/site-engine/site-contacts";
import { getSiteEngine } from "@/site-engine";

export const revalidate = 300;
type Props = { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const profile = await loadEmployeeProfilePageData({ slug });
  if (!profile) return { title: "Специалист не найден", robots: { index: false, follow: false } };
  const base = buildSeoMetadata({ path: `/sotrudniki/${slug}`, title: `${profile.employee.fullName} — ${profile.employee.position}`, description: profile.employee.bio, image: profile.employee.photoUrl ?? undefined });
  return { ...base, robots: { index: false, follow: true } };
}

export default async function EmployeeProfilePage({ params, searchParams }: Props) {
  const { slug } = await params;
  const query = await searchParams;
  const category = parseCategory(single(query.category));
  const reviewsPage = positiveInt(single(query.reviews_page));
  const listingsPage = positiveInt(single(query.objects_page));
  const [profile, contacts] = await Promise.all([
    loadEmployeeProfilePageData({ slug, category, reviewsPage, listingsPage }),
    getPublicSiteContacts(),
  ]);
  if (!profile) notFound();
  const { employee } = profile;
  const publicPhone = resolvePublicEmployeePhone(employee.phone, contacts);
  const path = `/sotrudniki/${employee.slug}`;
  const showsObjects = employee.teamSection === "sales";
  const showsReviews = showsObjects || employee.teamSection === "support";
  const breadcrumbItems = [
    { label: "Главная", href: "/" },
    { label: "Компания" },
    { label: "Сотрудники", href: "/sotrudniki" },
    { label: employee.fullName },
  ];
  const pageDto: EmployeeProfilePageDto = {
    path,
    employee: {
      id: employee.id,
      slug: employee.slug,
      fullName: employee.fullName,
      position: employee.position,
      bio: employee.bio,
      objectCount: employee.objectCount,
      reviewCount: employee.reviewCount,
      rating: employee.rating,
    },
    showsObjects,
    showsReviews,
    reviews: profile.reviews.map((review) => ({
      ...review,
      publishedAt: new Date(review.publishedAt).toISOString(),
      dateLabel: new Date(review.publishedAt).toLocaleDateString("ru-RU"),
    })),
    reviewPageLinks: buildPageLinks(path, profile.reviewsPage, profile.reviewsTotal, profile.reviewsPageSize, "reviews_page", query),
    categoryFilters: [
      { label: `Все · ${employee.objectCount}`, href: profileHref(path, query, { deal_type: undefined, category: undefined, objects_page: undefined }), active: !category },
      ...profile.categoryCounts.map((item) => ({ label: `${categoryLabel(item.value)} · ${item.count}`, href: profileHref(path, query, { deal_type: undefined, category: item.value, objects_page: undefined }), active: category === item.value })),
    ],
    listingPageLinks: buildPageLinks(path, profile.listingsPage, profile.listingsTotal, profile.listingsPageSize, "objects_page", query),
  };

  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Главная", url: "/" }, { name: "Сотрудники", url: "/sotrudniki" }, { name: employee.fullName, url: path }])} />
      <JsonLd data={employeeProfileSchema({ fullName: employee.fullName, position: employee.position, photoUrl: employee.photoUrl ?? undefined, urlPath: path, reviewCount: employee.reviewCount, rating: employee.rating, reviews: profile.reviews })} />
      <EmployeeProfileView
        page={pageDto}
        topBreadcrumbs={<Breadcrumbs items={breadcrumbItems} />}
        bottomBreadcrumbs={<Breadcrumbs items={breadcrumbItems} />}
        portrait={<EmployeePortrait photoUrl={employee.photoUrl} fullName={employee.fullName} priority />}
        contactDetails={<EmployeeContactDetails phone={publicPhone} email={employee.email || contacts.email} employeeSlug={employee.slug} />}
        leadForm={<LeadForm sourcePage={path} source="employee_profile" formType="employee_callback" agentId={employee.id} title="Связаться со специалистом" description="Оставьте номер — специалист перезвонит и уточнит вашу задачу." submitLabel="Перезвоните мне" message={`Заявка со страницы сотрудника: ${employee.fullName}`} premiumCompact className="h-full rounded-lg !border-[var(--palette-e1e1dd)] !bg-white !p-6 md:!p-7" />}
        reviewForm={<EmployeeReviewForm agentId={employee.id} fullName={employee.fullName} />}
        listingCards={profile.listings.map((listing) => <CatalogPropertyCard key={listing.id} listing={listing} />)}
        linkRenderer={EmployeeProfileLink}
      />
    </>
  );
}

function EmployeeProfileLink({ href, children, ariaCurrent, ...props }: SiteLinkRendererProps) {
  return <Link href={href} aria-current={ariaCurrent} {...props}>{children}</Link>;
}

async function loadEmployeeProfilePageData(input: { slug: string; category?: ListingCategoryKey; reviewsPage?: number; listingsPage?: number }): Promise<EmployeeProfileResult | null> {
  const engine = await getSiteEngine();
  const employee = await engine.getEmployee(input.slug);
  if (!employee) return null;
  const reviews = await engine.getReviews();
  const teamSection = getDefaultEmployeeTeamSection(employee.role);
  return {
    employee: {
      id: employee.id,
      slug: employee.slug,
      fullName: employee.name,
      position: employee.role,
      teamSection,
      publicSummary: employee.bio,
      phone: employee.phone,
      email: employee.email,
      photoUrl: employee.photo,
      bio: employee.bio,
      objectCount: 0,
      reviewCount: reviews.length,
      rating: reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : null,
      specializations: ["all"],
    },
    reviews: reviews.map((review) => ({ id: review.id, publicName: review.author, rating: review.rating, text: review.text, publishedAt: review.publishedAt })),
    reviewsTotal: reviews.length,
    reviewsPage: 1,
    reviewsPageSize: 6,
    listings: [],
    listingsTotal: 0,
    listingsPage: 1,
    listingsPageSize: 12,
    categoryCounts: [],
    dealCounts: [],
  };
}

function buildPageLinks(path: string, page: number, total: number, pageSize: number, param: string, query: Record<string, string | string[] | undefined>) {
  const pages = Math.ceil(total / pageSize);
  return Array.from({ length: pages }, (_, index) => {
    const value = index + 1;
    return { label: String(value), href: profileHref(path, query, { [param]: value === 1 ? undefined : String(value) }), current: value === page };
  });
}

function profileHref(path:string, query:Record<string,string|string[]|undefined>, updates:Record<string,string|undefined>){const params=new URLSearchParams(); Object.entries(query).forEach(([key,value])=>{const singleValue=Array.isArray(value)?value[0]:value;if(singleValue)params.set(key,singleValue)}); Object.entries(updates).forEach(([key,value])=>value?params.set(key,value):params.delete(key)); return `${path}${params.size?`?${params}`:""}`;}
function parseCategory(value?:string):ListingCategoryKey|undefined{return ["flat","room","house","land","commercial","construction","garage","other"].includes(value??"")?value as ListingCategoryKey:undefined;}
function categoryLabel(value:string){return ({flat:"Квартиры",room:"Комнаты",house:"Дома",land:"Участки",commercial:"Коммерция",construction:"Строительство",garage:"Гаражи",other:"Прочее"} as Record<string,string>)[value]??value;}
function positiveInt(value?:string){const parsed=Number(value);return Number.isInteger(parsed)&&parsed>0?parsed:1;}
function single(value:string|string[]|undefined){return Array.isArray(value)?value[0]:value;}
