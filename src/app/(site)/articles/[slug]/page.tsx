import { permanentRedirect } from "next/navigation";

export default async function LegacyArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  permanentRedirect(`/journal/${(await params).slug}`);
}
