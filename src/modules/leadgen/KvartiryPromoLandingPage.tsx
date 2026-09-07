import Image, { type ImageProps } from "next/image";
import { LeadgenPromoLandingView, type LeadgenPromoLandingAdapters, type SiteImageRendererProps } from "@ams/realty-ui";
import { LeadgenApartmentShowcase } from "./LeadgenApartmentShowcase";
import { LeadgenConstructionProjectShowcase } from "./LeadgenConstructionProjectShowcase";
import { LeadgenCurrentDateBadge } from "./LeadgenCurrentDateBadge";
import { LeadgenInlinePhoneForm } from "./LeadgenInlinePhoneForm";
import { LeadgenPrivacyModal } from "./LeadgenPrivacyModal";
import { LeadgenPromoHeader } from "./LeadgenPromoHeader";
import { LeadgenQuizModal } from "./LeadgenQuizModal";
import { LeadgenRequestButton } from "./LeadgenRequestButton";
import { LeadgenSimpleRequestModal } from "./LeadgenSimpleRequestModal";
import { kvartiryPromoContent, type LeadgenPromoContent } from "./kvartiry-promo-content";
import { siteConfig } from "@/project/site-config";
import { siteProfile } from "@/project/site-profile";

const adapters: LeadgenPromoLandingAdapters = {
  PromoHeader: LeadgenPromoHeader,
  RequestButton: LeadgenRequestButton,
  CurrentDateBadge: LeadgenCurrentDateBadge,
  ConstructionProjectShowcase: LeadgenConstructionProjectShowcase,
  InlinePhoneForm: LeadgenInlinePhoneForm,
  ApartmentShowcase: LeadgenApartmentShowcase,
  QuizModal: LeadgenQuizModal,
  SimpleRequestModal: LeadgenSimpleRequestModal,
  PrivacyModal: LeadgenPrivacyModal,
};

function PromoImage({ alt, ...props }: SiteImageRendererProps) {
  return <Image alt={alt} {...(props as Omit<ImageProps, "alt">)} />;
}

export function KvartiryPromoLandingPage({ content = kvartiryPromoContent, compact = false }: { content?: LeadgenPromoContent; compact?: boolean }) {
  return <LeadgenPromoLandingView content={content} compact={compact} adapters={adapters} imageRenderer={PromoImage} copyright={siteConfig.copyright} registry={siteConfig.registry} city={siteProfile.city} />;
}
