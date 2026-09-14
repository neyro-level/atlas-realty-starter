import type { ReactNode } from "react";

export function PropertyDetailPageView({
  structuredData,
  mobileTopBar,
  breadcrumbs,
  gallery,
  summary,
  description,
  details,
  building,
  viewing,
  related,
  desktopSidebar,
  mobileConversion,
}: {
  structuredData?: ReactNode;
  mobileTopBar: ReactNode;
  breadcrumbs: ReactNode;
  gallery: ReactNode;
  summary: ReactNode;
  description?: ReactNode;
  details: ReactNode;
  building: ReactNode;
  viewing: ReactNode;
  related?: ReactNode;
  desktopSidebar: ReactNode;
  mobileConversion: ReactNode;
}) {
  return (
    <main className="min-h-screen overflow-clip bg-[var(--surface-card-soft)] text-[var(--text-primary)]">
      {structuredData}
      {mobileTopBar}
      <div className="mx-auto max-w-site-frame px-2.5 pb-14 pt-3 sm:px-3 lg:px-10 lg:pb-20 lg:pt-10 xl:px-12">
        {breadcrumbs}
        <section className="grid w-full items-start gap-6 lg:grid-cols-[minmax(0,calc(100%-324px))_300px]">
          <div className="grid min-w-0 gap-4">
            <div>{gallery}</div>
            {summary}
            <div className="order-4 lg:order-none">{description}</div>
            <div className="order-3 lg:order-none">{details}</div>
            <div className="hidden lg:block">{building}</div>
            <div className="hidden lg:block">{viewing}</div>
            <div className="order-5 lg:order-none">{related}</div>
          </div>
          {desktopSidebar}
        </section>
      </div>
      {mobileConversion}
    </main>
  );
}
