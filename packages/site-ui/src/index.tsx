import type { ReactNode } from "react";
import type { SiteIdentity } from "@starter/site-contracts";

export type { SiteImageRenderer, SiteImageRendererProps, SiteLinkRenderer, SiteLinkRendererProps } from "./lib/adapters";
export { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./components/ui/accordion";
export { Badge, badgeVariants } from "./components/ui/badge";
export {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./components/ui/breadcrumb";
export { Button, buttonVariants } from "./components/ui/button";
export { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./components/ui/card";
export { Checkbox } from "./components/ui/checkbox";
export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "./components/ui/dialog";
export {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from "./components/ui/field";
export { Input } from "./components/ui/input";
export { Label } from "./components/ui/label";
export { Separator } from "./components/ui/separator";
export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetPortal,
  SheetTitle,
  SheetTrigger,
} from "./components/ui/sheet";
export { Textarea } from "./components/ui/textarea";
export { cn } from "./lib/utils";
export { ArticleCardView } from "./views/ArticleCardView";
export { JournalHubView } from "./views/JournalHubView";
export { JournalCategoryView } from "./views/JournalCategoryView";
export { JournalArticleView } from "./views/JournalArticleView";
export { HomeArticlesPreviewView } from "./views/HomeArticlesPreviewView";
export { HomeCarouselScrollHintView } from "./views/HomeCarouselScrollHintView";
export { HomeHeroView, type HomeHeroContentDto } from "./views/HomeHeroView";
export { HomeInterestView } from "./views/HomeInterestView";
export { HomeNewBuildingsView } from "./views/HomeNewBuildingsView";
export { HomePageView } from "./views/HomePageView";
export { HomePreFooterView, type HomePopularSearchGroupViewDto } from "./views/HomePreFooterView";
export { HomeServicesView, type HomeServiceItemViewDto } from "./views/HomeServicesView";
export { HomeWhyChooseView, type HomeDirectorStatementViewDto, type HomeDirectorViewDto } from "./views/HomeWhyChooseView";
export { ArticleDocumentView } from "./views/ArticleDocumentView";
export { ArticleContentsView } from "./views/ArticleContentsView";
export { ArticleGalleryView } from "./views/ArticleGalleryView";
export { ArticleActionsView } from "./views/ArticleActionsView";
export { ArticleEditorialLinksView } from "./views/ArticleEditorialLinksView";
export { CatalogMortgageHelpCardView } from "./views/CatalogMortgageHelpCardView";
export {
  CatalogMobileFilterView,
  MOBILE_TYPE_VIEW_OPTIONS,
  type MobileFilterDraftViewDto,
  type MobileRoomId,
  type MobileTypeId,
} from "./views/CatalogMobileFilterView";
export { CatalogNewBuildingSelectionCardView } from "./views/CatalogNewBuildingSelectionCardView";
export {
  CatalogAdvancedFilterView,
  CatalogEmptyStateView,
  CatalogLoadMoreView,
  CatalogRangePairView,
  CatalogSearchFieldView,
  CatalogSelectView,
  CatalogShowcaseView,
  CatalogSortTabsView,
  CatalogViewSwitchView,
  type CatalogPaginationItemDto,
  type CatalogSortViewDto,
  type CatalogTabViewDto,
  type CatalogViewOptionDto,
} from "./views/CatalogControlsView";
export { CatalogHeroView, type CatalogHeroViewProps } from "./views/CatalogHeroView";
export { CitySwitcherView } from "./views/CitySwitcherView";
export { CookieNoticeView } from "./views/CookieNoticeView";
export { DesktopSiteNavView } from "./views/DesktopSiteNavView";
export { EmployeeCardView } from "./views/EmployeeCardView";
export { EmployeeProfileView } from "./views/EmployeeProfileView";
export { EmployeeReviewsView } from "./views/EmployeeReviewsView";
export { EmployeesDirectoryView } from "./views/EmployeesDirectoryView";
export { EmployeeReviewDialogView } from "./views/EmployeeReviewDialogView";
export { ExpertRequestModalView } from "./views/ExpertRequestModalView";
export { LeadSuccessNoticeView } from "./views/LeadSuccessNoticeView";
export { LegalDocumentModalView } from "./views/LegalDocumentModalView";
export { LegalDocumentView } from "./views/LegalDocumentView";
export { LegalHubView } from "./views/LegalHubView";
export { MobileMenuView } from "./views/MobileMenuView";
export { NewBuildingGalleryView, type NewBuildingGalleryViewProps } from "./views/NewBuildingGalleryView";
export { NewBuildingHeroView } from "./views/NewBuildingHeroView";
export { NewBuildingRelatedView } from "./views/NewBuildingRelatedView";
export { NewBuildingAboutView, NewBuildingLocationView, NewBuildingPurchaseTermsView, NewBuildingSelectionView } from "./views/NewBuildingDetailSectionsView";
export { NewBuildingDecisionSidebarView } from "./views/NewBuildingDecisionSidebarView";
export { NewBuildingDetailPageView } from "./views/NewBuildingDetailPageView";
export { HouseProjectPreviewView } from "./views/HouseProjectPreviewView";
export { PhoneRevealView } from "./views/PhoneRevealView";
export { PropertyChatView } from "./views/PropertyChatView";
export { PropertyMobileTopBarView } from "./views/PropertyMobileTopBarView";
export { PropertyPageActionsView } from "./views/PropertyPageActionsView";
export { PropertySidebarView, type PropertySidebarResultDto, type PropertySidebarViewProps } from "./views/PropertySidebarView";
export { PropertyViewingRequestView } from "./views/PropertyViewingRequestView";
export {
  PropertyCardView,
  buildPropertyCardListTitle,
  buildPropertyCardTitle,
  cleanPropertyCardDisplayAddress,
  type CatalogView,
  type PropertyCardCollectionActionProps,
  type PropertyCardViewProps,
} from "./views/PropertyCardView";
export {
  PropertyBuildingView,
  PropertyDescriptionView,
  PropertyDetailsView,
  PropertyDetailSummaryView,
} from "./views/PropertyDetailSectionsView";
export { PropertyGalleryView, type PropertyGalleryViewProps } from "./views/PropertyGalleryView";
export { PropertyDetailPageView } from "./views/PropertyDetailPageView";
export { PropertyRelatedView } from "./views/PropertyRelatedView";
export { RequestModalView } from "./views/RequestModalView";
export { ReviewsPageView } from "./views/ReviewsPageView";
export { ContactsPageView } from "./views/ContactsPageView";
export { CorporateLandingView } from "./views/CorporateLandingView";
export { CorporateRelatedArticlesView } from "./views/CorporateRelatedArticlesView";
export { CorporateRelatedServicesView } from "./views/CorporateRelatedServicesView";
export { MortgageCalculatorView } from "./views/MortgageCalculatorView";
export { MortgageProgramsView } from "./views/MortgageProgramsView";
export { MortgageBrokerSupportView } from "./views/MortgageBrokerSupportView";
export { AboutCompanyDirectorView, type AboutCompanyDirectorViewProps } from "./views/AboutCompanyDirectorView";
export { AboutCompanyTeamView, type AboutCompanyTeamPhoto } from "./views/AboutCompanyTeamView";
export { AboutCompanyFinalCtaView, MortgageConsultationView } from "./views/CorporateFormSectionViews";
export { SalePricingPrinciplesView } from "./views/SalePricingPrinciplesView";
export { SalePromotionView } from "./views/SalePromotionView";
export { SaleReportingView } from "./views/SaleReportingView";
export { SaleFinalCtaView } from "./views/SaleFinalCtaView";
export { SalePreparationView } from "./views/SalePreparationView";
export { SaleNegotiationView } from "./views/SaleNegotiationView";
export { CareersComparisonView, type CareersComparisonContent } from "./views/CareersComparisonView";
export { CareersWorkSystemView, type CareersWorkSystemContent, type CareersWorkIcon } from "./views/CareersWorkSystemView";
export { CareersTrainingView, type CareersTrainingContent } from "./views/CareersTrainingView";
export { CareersFinalCtaView, type CareersFinalCtaContent } from "./views/CareersFinalCtaView";
export { LawyerPageView, type LawyerPageViewProps } from "./views/LawyerPageView";
export { HtmlSitemapView } from "./views/HtmlSitemapView";
export { HtmlSitemapListingView } from "./views/HtmlSitemapListingView";
export { CompareTableView } from "./views/CompareTableView";
export { SessionCollectionPageView } from "./views/SessionCollectionPageView";
export { SharedSelectionView } from "./views/SharedSelectionView";
export { LeadgenPromoLandingView, type LeadgenPromoLandingAdapters } from "./views/LeadgenPromoLandingView";
export { ResidentialComplexCardView, type ResidentialComplexCardViewProps } from "./views/ResidentialComplexCardView";
export { SiteFooterView } from "./views/SiteFooterView";
export { SiteHeaderView } from "./views/SiteHeaderView";
export type {
  SiteCityOptionViewDto,
  SiteHeaderNavItemDto,
  SiteMobileMenuActionDto,
  SiteNavLinkDto,
} from "./views/site-header.types";

export function PublicPageShell({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <main className={className}>{children}</main>;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <header>
      {eyebrow ? <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--primary)]">{eyebrow}</p> : null}
      <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--text-primary)]">{title}</h2>
      {description ? <p className="mt-3 max-w-2xl text-[var(--text-secondary)]">{description}</p> : null}
    </header>
  );
}

export function FixtureModeBadge() {
  return (
    <span className="inline-flex rounded-full border border-[var(--border)] px-3 py-1 text-xs font-semibold text-[var(--text-secondary)]">
      Демонстрационные данные
    </span>
  );
}

export function SiteIdentitySummary({ identity }: { identity: SiteIdentity }) {
  return (
    <div>
      <strong>{identity.brand}</strong>
      <p>{identity.tagline}</p>
      <small>{identity.city.prepositional}</small>
    </div>
  );
}

export function EmptyCollection({
  title = "Материалы скоро появятся",
  description = "Подключите движок или дополните fixture-набор.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <section role="status" className="rounded-lg border border-[var(--border)] bg-white p-6">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-[var(--text-secondary)]">{description}</p>
    </section>
  );
}
