import { permanentRedirect } from "next/navigation";
import { LEGACY_ROUTE_REDIRECTS } from "@/project/routes";

export default async function LegacyArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  permanentRedirect(LEGACY_ROUTE_REDIRECTS.article.to((await params).slug));
}
