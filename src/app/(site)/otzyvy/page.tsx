import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ReviewsPageView } from "@starter/site-ui";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { CatalogHeroBlock } from "@/components/marketing/CatalogHeroBlock";
import { getEmployeeDirectory, getPublishedEmployeeReviews, type EmployeeReviewDirectoryResult } from "@/modules/employees";
import { getCorporatePage } from "@/project/corporate-pages";
import { getSiteUrl, siteConfig } from "@/project/site-config";
import { defaultSocialPreview, defaultSocialPreviewPath } from "@/project/social-preview";
import { IS_DEVELOPMENT } from "@/shared/lib/is-development";
import { getSiteEngine, getSiteEngineMode } from "@/site-engine";
import { EmployeeReviewsSection } from "./_components/EmployeeReviewsSection";
import { ReviewsConsultationSection } from "./_components/ReviewsConsultationSection";
import { buildLocalReviewPreview } from "./_components/local-review-preview";

const reviewsPage = getCorporatePage("otzyvy");

export const revalidate = 300;

type Props = {
  searchParams: Promise<{ reviews_page?: string | string[] }>;
};

if (!reviewsPage) {
  throw new Error("Reviews corporate page config is missing");
}

const reviewsPath = "/otzyvy";
const reviewsUrl = `${getSiteUrl().replace(/\/$/, "")}${reviewsPath}`;

export const metadata: Metadata = {
  title: { absolute: reviewsPage.title },
  description: reviewsPage.description,
  alternates: { canonical: reviewsPath },
  openGraph: {
    title: reviewsPage.title,
    description: reviewsPage.description,
    url: reviewsUrl,
    siteName: siteConfig.clientFullName,
    type: "website",
    images: [defaultSocialPreview],
  },
  twitter: {
    card: "summary_large_image",
    title: reviewsPage.title,
    description: reviewsPage.description,
    images: [defaultSocialPreviewPath],
  },
};

export default async function ReviewsPage({ searchParams }: Props) {
  const reviewsPageNumber = parseReviewsPage((await searchParams).reviews_page);
  let employeeReviews = await loadReviewsPageData(reviewsPageNumber);
  let isPreview = false;

  const pageCount = Math.ceil(employeeReviews.total / employeeReviews.pageSize);
  if (reviewsPageNumber > Math.max(1, pageCount)) notFound();

  if (IS_DEVELOPMENT && reviewsPageNumber === 1 && !employeeReviews.items.length) {
    const employees = await getEmployeeDirectory({ team: "sales", page: 1 });
    employeeReviews = buildLocalReviewPreview(employees.items);
    isPreview = employeeReviews.items.length > 0;
  }

  const hero = (
      <section className="bg-white">
        <div className="mx-auto max-w-site-frame px-5 pb-3 pt-6 lg:py-8">
          <Breadcrumbs
            items={[
              { label: "Главная", href: "/" },
              { label: "Компания" },
              { label: "Отзывы" },
            ]}
            className="mb-4"
          />
          <CatalogHeroBlock
            title="Отзывы клиентов о работе агентства «АТЛАС»"
            imageSrc="/images/agency-reviews-hero.webp"
            description={reviewsPage.heroDescription}
            descriptionVisibility="always"
            actionVisibility="always"
            action={(
              <button
                type="button"
                data-request-modal
                data-request-modal-title="Консультация по недвижимости"
                data-request-modal-subtitle="Ответим на ваши вопросы и подскажем следующий шаг по покупке, продаже, ипотеке или документам."
                data-request-modal-show-subtitle="true"
                data-request-modal-source="corporate:reviews:hero"
                data-request-modal-form-type="corporate_reviews"
                className="inline-flex min-h-12 w-full max-w-full shrink-0 items-center justify-center rounded-lg bg-[var(--accent)] px-4 text-sm font-semibold whitespace-nowrap text-white transition hover:bg-[var(--accent-hover)] sm:w-auto sm:min-w-[252px] sm:px-6"
              >
                Получить консультацию
              </button>
            )}
          />
        </div>
      </section>

  );

  return (
    <ReviewsPageView
      hero={hero}
      reviews={<EmployeeReviewsSection reviews={employeeReviews} isPreview={isPreview} />}
      consultation={<ReviewsConsultationSection />}
    />
  );
}

function parseReviewsPage(value: string | string[] | undefined) {
  const parsed = Number(Array.isArray(value) ? value[0] : value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

async function loadReviewsPageData(page: number): Promise<EmployeeReviewDirectoryResult> {
  if (getSiteEngineMode() !== "fixture") return getPublishedEmployeeReviews({ page });
  const engine = await getSiteEngine();
  const [reviews, employees] = await Promise.all([engine.getReviews(), engine.getEmployees()]);
  const employee = employees[0];
  if (!employee) return { items: [], total: 0, page, pageSize: 18 };
  return {
    items: page === 1 ? reviews.map((review) => ({
      id: review.id,
      publicName: review.author,
      rating: review.rating,
      text: review.text,
      publishedAt: review.publishedAt,
      employee: { slug: employee.slug, fullName: employee.name, position: employee.role, photoUrl: employee.photo },
    })) : [],
    total: reviews.length,
    page,
    pageSize: 18,
  };
}
