import "server-only";

import type { ListingCategoryKey } from "@/lib/catalog";
import { getSiteEngine } from "@/site-engine";
import type { EmployeeDto, ReviewDto } from "@starter/site-contracts";
import {
  getDefaultEmployeeTeamSection,
  getEmployeePositionRank,
  getEmployeePublicSummary,
} from "./positions";
import type {
  EmployeeDirectoryResult,
  EmployeeListItem,
  EmployeeProfileResult,
  EmployeeReviewDirectoryResult,
  EmployeeSpecialization,
} from "./types";
import type { EmployeeTeamSection } from "./positions";

const DIRECTORY_PAGE_SIZE = 6;
const REVIEW_PAGE_SIZE = 6;
const REVIEW_DIRECTORY_PAGE_SIZE = 18;
const LISTING_PAGE_SIZE = 12;

export async function getEmployeeDirectory(input: {
  q?: string;
  specialization?: EmployeeSpecialization;
  team?: EmployeeTeamSection;
  page?: number;
}): Promise<EmployeeDirectoryResult> {
  const page = positivePage(input.page);
  const activeSection = input.team ?? "sales";
  const query = input.q?.trim().toLocaleLowerCase("ru-RU") ?? "";
  const sourceEmployees = await (await getSiteEngine()).getEmployees();
  const all = sourceEmployees.map((employee) => toEmployeeListItem(employee));
  const employees = all
    .filter((employee) => employee.teamSection === activeSection)
    .filter((employee) => !query || `${employee.fullName} ${employee.position}`.toLocaleLowerCase("ru-RU").includes(query))
    .filter((employee) => !input.specialization || input.specialization === "all" || employee.specializations.includes(input.specialization))
    .sort((left, right) => getEmployeePositionRank(left.position) - getEmployeePositionRank(right.position));
  return {
    items: employees.slice((page - 1) * DIRECTORY_PAGE_SIZE, page * DIRECTORY_PAGE_SIZE),
    activeSection,
    sectionTotals: {
      sales: all.filter((employee) => employee.teamSection === "sales").length,
      support: all.filter((employee) => employee.teamSection === "support").length,
      office: all.filter((employee) => employee.teamSection === "office").length,
    },
    total: employees.length,
    page,
    pageSize: DIRECTORY_PAGE_SIZE,
  };
}

export async function getEmployeeProfile(input: {
  slug: string;
  dealType?: "sale" | "rent";
  category?: ListingCategoryKey;
  reviewsPage?: number;
  listingsPage?: number;
}): Promise<EmployeeProfileResult | null> {
  const engine = await getSiteEngine();
  const employeeDto = await engine.getEmployee(input.slug);
  if (!employeeDto) return null;

  const reviewsPage = positivePage(input.reviewsPage);
  const listingsPage = positivePage(input.listingsPage);
  const [allReviews, catalog] = await Promise.all([
    engine.getReviews(),
    engine.getCatalog({
      ...(input.dealType ? { dealType: input.dealType } : {}),
      ...(input.category ? { category: input.category } : {}),
      page: listingsPage,
      limit: LISTING_PAGE_SIZE,
    }),
  ]);
  const reviews = allReviews.slice((reviewsPage - 1) * REVIEW_PAGE_SIZE, reviewsPage * REVIEW_PAGE_SIZE);
  const employee = toEmployeeListItem(employeeDto, catalog.items.length, allReviews);

  return {
    employee,
    reviews: reviews.map(toEmployeeReview),
    reviewsTotal: allReviews.length,
    reviewsPage,
    reviewsPageSize: REVIEW_PAGE_SIZE,
    listings: catalog.items,
    listingsTotal: catalog.total,
    listingsPage,
    listingsPageSize: LISTING_PAGE_SIZE,
    categoryCounts: [],
    dealCounts: [],
  };
}

export async function getPublishedEmployeeReviews(input: { page?: number }): Promise<EmployeeReviewDirectoryResult> {
  const page = positivePage(input.page);
  const engine = await getSiteEngine();
  const [reviews, employees] = await Promise.all([engine.getReviews(), engine.getEmployees()]);
  const employee = employees[0];
  const pageItems = reviews.slice((page - 1) * REVIEW_DIRECTORY_PAGE_SIZE, page * REVIEW_DIRECTORY_PAGE_SIZE);

  return {
    items: employee ? pageItems.map((review) => ({
      ...toEmployeeReview(review),
      employee: {
        slug: employee.slug,
        fullName: employee.name,
        position: employee.role,
        photoUrl: employee.photo,
      },
    })) : [],
    total: employee ? reviews.length : 0,
    page,
    pageSize: REVIEW_DIRECTORY_PAGE_SIZE,
  };
}

function toEmployeeListItem(employee: EmployeeDto, objectCount = 0, reviews: ReviewDto[] = []): EmployeeListItem {
  const rating = reviews.length
    ? Number((reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1))
    : null;
  return {
    id: employee.id,
    slug: employee.slug,
    fullName: employee.name,
    position: employee.role,
    teamSection: getDefaultEmployeeTeamSection(employee.role),
    publicSummary: getEmployeePublicSummary(employee.role),
    phone: employee.phone,
    email: employee.email,
    photoUrl: employee.photo,
    bio: employee.bio || getEmployeePublicSummary(employee.role),
    objectCount,
    reviewCount: reviews.length,
    rating,
    specializations: ["all"],
  };
}

function toEmployeeReview(review: ReviewDto) {
  return { id: review.id, publicName: review.author, rating: review.rating, text: review.text, publishedAt: review.publishedAt };
}

function positivePage(value?: number) {
  return Number.isFinite(value) && (value ?? 0) > 0 ? Math.floor(value!) : 1;
}
