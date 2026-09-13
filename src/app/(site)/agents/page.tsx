import { permanentRedirect } from "next/navigation";
import { routes } from "@/project/routes";

export const dynamic = "force-static";

export default function AgentsPage() {
  permanentRedirect(routes.employees());
}
