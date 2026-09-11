import { readFile } from "node:fs/promises";

const expected = {
  url: "https://ui.ams24.ru/r/{name}.json",
  authorization: "Bearer ${AMS_UI_REGISTRY_TOKEN}",
};

for (const file of ["components.json", "packages/site-ui/components.json"]) {
  const config = JSON.parse(await readFile(file, "utf8"));
  const registry = config.registries?.["@ams"];
  if (registry?.url !== expected.url) throw new Error(`${file} has an invalid @ams Registry URL`);
  if (registry?.headers?.Authorization !== expected.authorization) {
    throw new Error(`${file} must read the @ams credential from AMS_UI_REGISTRY_TOKEN`);
  }
}

const packageJson = JSON.parse(await readFile("packages/site-ui/package.json", "utf8"));
if (packageJson.private !== true) throw new Error("The Atlas UI workspace mirror must remain private");

console.log("AMS Registry namespace PASS");
