import { permanentRedirect } from "next/navigation";
import { routes } from "@/project/routes";

export default async function LegacyArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  permanentRedirect(routes.article((await params).slug));
}
