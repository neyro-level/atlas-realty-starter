import { permanentRedirect } from "next/navigation";
import { routes } from "@/project/routes";

export default function LegacyArticlesPage() {
  permanentRedirect(routes.journal());
}
