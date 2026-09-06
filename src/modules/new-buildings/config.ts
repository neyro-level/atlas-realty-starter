import { clientEnv } from "@/project/public-env";

export function getNewBuildingsMediaBaseUrl() {
  const baseUrl = clientEnv.newBuildingsMediaBaseUrl;
  return baseUrl ? baseUrl.replace(/\/$/, "") : null;
}
