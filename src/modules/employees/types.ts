import type { ListingCard } from "@/lib/catalog";
import type { EmployeeTeamSection } from "./positions";

export type EmployeeSpecialization = "all" | "residential" | "commercial";

export type EmployeeListItem = {
  id: string;
  slug: string;
  fullName: string;
  position: string;
  teamSection: EmployeeTeamSection;
  publicSummary: string;
  phone: string | null;
  email: string | null;
  photoUrl: string | null;
  bio: string;
  objectCount: number;
  reviewCount: number;
  rating: number | null;
  specializations: EmployeeSpecialization[];
};

export type EmployeeReviewItem = {
  id: string;
  publicName: string;
  rating: number;
  text: string;
  publishedAt: string;
};

export type EmployeeReviewDirectoryItem = EmployeeReviewItem & {
  employee: {
    slug: string;
    fullName: string;
    position: string;
    photoUrl: string | null;
  };
};

export type EmployeeReviewDirectoryResult = {
  items: EmployeeReviewDirectoryItem[];
  total: number;
  page: number;
  pageSize: number;
};

export type EmployeeDirectoryResult = {
  items: EmployeeListItem[];
  activeSection: EmployeeTeamSection;
  sectionTotals: Record<EmployeeTeamSection, number>;
  total: number;
  page: number;
  pageSize: number;
};

export type EmployeeProfileResult = {
  employee: EmployeeListItem;
  reviews: EmployeeReviewItem[];
  reviewsTotal: number;
  reviewsPage: number;
  reviewsPageSize: number;
  listings: ListingCard[];
  listingsTotal: number;
  listingsPage: number;
  listingsPageSize: number;
  categoryCounts: Array<{ value: string; count: number }>;
  dealCounts: Array<{ value: "sale" | "rent"; count: number }>;
};
