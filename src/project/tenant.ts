import { z } from "zod";
import { siteIdentity } from "./site-identity";

const tenantSchema = z.object({
  slug: z.string().min(1),
  brand: z.string().min(1),
  appName: z.string().min(1),
  cityRu: z.string().min(1),
  cityRuLocative: z.string().min(1),
  cityEn: z.string().min(1),
  siteDomain: z.string().min(1),
  feedSlug: z.string().min(1),
  feedTitle: z.string().min(1),
  cityScope: z.array(z.string().min(1)).min(1),
  cityScopeLocalities: z.array(z.string().min(1)).default([]),
});

export type TenantConfig = z.infer<typeof tenantSchema>;

export const tenant = tenantSchema.parse({
  slug: "starter-site",
  brand: siteIdentity.brand,
  appName: siteIdentity.projectName,
  cityRu: siteIdentity.city.nominative,
  cityRuLocative: siteIdentity.city.prepositional,
  cityEn: siteIdentity.city.slug,
  siteDomain: new URL(siteIdentity.domain).host,
  feedSlug: "starter-primary-yrl",
  feedTitle: "Основной XML-фид",
  cityScope: [siteIdentity.city.slug],
  cityScopeLocalities: [],
});
