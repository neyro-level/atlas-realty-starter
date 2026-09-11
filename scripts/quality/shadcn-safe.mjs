import { existsSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const args = process.argv.slice(2);
const root = process.cwd();
const shadcnEntry = path.join(root, "node_modules", "shadcn", "dist", "index.js");

if (process.platform !== "win32" || !/^[0-9]+\./.test(path.basename(root))) {
  process.exit(run(process.execPath, [shadcnEntry, ...args], root));
}

const drive = ["Z", "Y", "X", "W", "V", "U"].find((letter) => !existsSync(`${letter}:\\`));
if (!drive) throw new Error("No free drive letter is available for the Windows shadcn wrapper");

const driveRoot = `${drive}:`;
const mounted = spawnSync("subst.exe", [driveRoot, root], { stdio: "inherit" });
if (mounted.status !== 0) process.exit(mounted.status ?? 1);

try {
  process.exitCode = run(process.execPath, [shadcnEntry, ...args], `${driveRoot}\\`);
} finally {
  spawnSync("subst.exe", [driveRoot, "/D"], { stdio: "inherit" });
}

function run(executable, commandArgs, cwd) {
  const result = spawnSync(executable, commandArgs, { cwd, env: process.env, stdio: "inherit" });
  if (result.error) throw result.error;
  return result.status ?? 1;
}
