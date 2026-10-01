// Figma MCP가 내보낸 이미지 URL(7일간 유효)에서 public/figma/ 로 이미지를 내려받는다.
// 사용법: npm run assets
import { mkdir, writeFile, access } from "node:fs/promises";
import { readFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const manifest = JSON.parse(readFileSync(path.join(root, "scripts/figma-assets.json"), "utf8"));
const outDir = path.join(root, "public/figma");
await mkdir(outDir, { recursive: true });

let ok = 0;
let skipped = 0;
const failed = [];

for (const [file, url] of Object.entries(manifest)) {
  const target = path.join(outDir, file);
  try {
    await access(target);
    skipped++;
    continue;
  } catch {}
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    await writeFile(target, Buffer.from(await res.arrayBuffer()));
    ok++;
  } catch (err) {
    failed.push(`${file}: ${err.message}`);
  }
}

console.log(`downloaded ${ok}, already present ${skipped}, failed ${failed.length}`);
if (failed.length) {
  console.log(failed.join("\n"));
  process.exitCode = 1;
}
