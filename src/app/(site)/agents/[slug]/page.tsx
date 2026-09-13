import { permanentRedirect } from "next/navigation";
import { LEGACY_ROUTE_REDIRECTS } from "@/project/routes";

export const dynamic = "force-dynamic";

export default async function AgentPage({ params }: { params: Promise<{ slug: string }> }) {
  permanentRedirect(LEGACY_ROUTE_REDIRECTS.agent.to((await params).slug));
}
