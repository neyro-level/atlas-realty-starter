import { permanentRedirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AgentPage({ params }: { params: Promise<{ slug: string }> }) {
  permanentRedirect(`/sotrudniki/${(await params).slug}`);
}
