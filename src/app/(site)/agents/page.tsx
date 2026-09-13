import { permanentRedirect } from "next/navigation";
import { LEGACY_ROUTE_REDIRECTS } from "@/project/routes";

export const dynamic = "force-static";

export default function AgentsPage() {
  permanentRedirect(LEGACY_ROUTE_REDIRECTS.agents.to());
}
