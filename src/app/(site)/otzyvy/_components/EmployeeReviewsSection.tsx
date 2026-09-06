import Image, { type ImageProps } from "next/image";
import Link from "next/link";
import type { EmployeeReviewsPageDto } from "@starter/site-contracts";
import { EmployeeReviewsView, type SiteImageRendererProps, type SiteLinkRendererProps } from "@starter/site-ui";
import type { EmployeeReviewDirectoryResult } from "@/modules/employees";
import { EMPLOYEE_PORTRAIT_PLACEHOLDER } from "@/modules/employees/photo-policy";

const dateFormatter = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", year: "numeric" });

export function EmployeeReviewsSection({ reviews, isPreview = false }: { reviews: EmployeeReviewDirectoryResult; isPreview?: boolean }) {
  const pageCount = Math.ceil(reviews.total / reviews.pageSize);
  const page: EmployeeReviewsPageDto = {
    items: reviews.items.map((review) => ({
      ...review,
      publishedAt: new Date(review.publishedAt).toISOString(),
      dateLabel: dateFormatter.format(new Date(review.publishedAt)),
    })),
    total: reviews.total,
    page: reviews.page,
    pageCount,
    preview: isPreview,
    previousHref: reviews.page > 1 ? pageHref(reviews.page - 1) : null,
    nextHref: reviews.page < pageCount ? pageHref(reviews.page + 1) : null,
  };

  return <EmployeeReviewsView page={page} placeholderImage={EMPLOYEE_PORTRAIT_PLACEHOLDER} linkRenderer={ReviewsLink} imageRenderer={ReviewsImage} />;
}

function ReviewsLink({ href, children, ariaCurrent, ariaLabel, ...props }: SiteLinkRendererProps) {
  return <Link href={href} aria-current={ariaCurrent} aria-label={ariaLabel} {...props}>{children}</Link>;
}

function ReviewsImage({ alt, ...props }: SiteImageRendererProps) {
  return <Image alt={alt} {...props as Omit<ImageProps, "alt">} />;
}

function pageHref(page: number) {
  return page === 1 ? "/otzyvy#employee-reviews" : `/otzyvy?reviews_page=${page}#employee-reviews`;
}
