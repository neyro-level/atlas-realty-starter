import type { Metadata } from "next";
import "@fontsource/manrope/400.css";
import "@fontsource/manrope/500.css";
import "@fontsource/manrope/600.css";
import "@fontsource/manrope/700.css";
import "@fontsource/manrope/800.css";
import { RouteScrollReset } from "@/components/layout/RouteScrollReset";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { AnalyticsProvider, CookiePreferences } from "@/modules/analytics";
import { LeadSuccessNotice } from "@/modules/leads/LeadSuccessNotice";
import { getSiteUrl, isIndexable, siteConfig } from "@/project/site-config";
import { clientEnv } from "@/project/public-env";
import { defaultSocialPreview, defaultSocialPreviewPath } from "@/project/social-preview";
import { organizationSchema, websiteSchema } from "@/shared/lib/seo/schema";
import { JsonLd } from "@/shared/ui/JsonLd";
import { getSiteEngine } from "@/site-engine";
import "./globals.css";

// Public pages read their shell and catalog data from the runtime SiteEngine.
// Keep that boundary request-time so CI builds never need production Payload secrets.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: siteConfig.defaultTitle,
    template: `%s | ${siteConfig.clientName}`,
  },
  description: siteConfig.defaultDescription,
  robots: isIndexable() ? { index: true, follow: true } : { index: false, follow: false },
  openGraph: {
    title: siteConfig.defaultTitle,
    description: siteConfig.defaultDescription,
    url: "/",
    siteName: siteConfig.clientFullName,
    type: "website",
    locale: "ru_RU",
    images: [defaultSocialPreview],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.defaultTitle,
    description: siteConfig.defaultDescription,
    images: [defaultSocialPreviewPath],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { contacts, requestAvatars: requestModalAvatars } = await (await getSiteEngine()).getShell();
  return (
    <html lang="ru" className="h-full antialiased">
      <body className="flex min-h-full flex-col overflow-x-hidden bg-[var(--background)] text-[var(--text-primary)]">
        <JsonLd data={organizationSchema(contacts)} />
        <JsonLd data={websiteSchema(contacts)} />
        <RouteScrollReset />
        <SiteChrome contacts={contacts} requestModalAvatars={requestModalAvatars}>{children}</SiteChrome>
        <AnalyticsProvider counterId={clientEnv.yandexMetrikaId ?? undefined} />
        <CookiePreferences />
        <LeadSuccessNotice />
      </body>
    </html>
  );
}
