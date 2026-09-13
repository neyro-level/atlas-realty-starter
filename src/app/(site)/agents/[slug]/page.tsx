import { permanentRedirect } from "next/navigation";
import { routes } from "@/project/routes";

export const dynamic = "force-dynamic";

export default async function AgentPage({ params }: { params: Promise<{ slug: string }> }) {
  permanentRedirect(routes.employee((await params).slug));
}
