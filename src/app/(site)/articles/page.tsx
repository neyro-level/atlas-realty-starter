import { permanentRedirect } from "next/navigation";
import { LEGACY_ROUTE_REDIRECTS } from "@/project/routes";

export default function LegacyArticlesPage() {
  permanentRedirect(LEGACY_ROUTE_REDIRECTS.articles.to());
}
