import { readdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
async function walk(dir) {
  const result = [];
  for (const f of await readdir(dir, { withFileTypes: true })) {
    const path = dir + "/" + f.name;
    if (f.isDirectory()) result.push(...(await walk(path)));
    else if (f.name !== "sw.js") result.push(path);
  }
  return result;
}
const files = await walk("dist");
const urls = files.map((p) => "/" + p.slice(5));
urls.push("/");
const hash = createHash("sha256");
for (const p of files) hash.update(await readFile(p));
const template = await readFile("public/sw.js", "utf8");
await writeFile(
  "dist/sw.js",
  template
    .replace(
      /["']wisteria-v1["']/,
      JSON.stringify("wisteria-" + hash.digest("hex").slice(0, 12)),
    )
    .replace(
      /\[\s*["']\/["'][\s\S]*?\]/,
      JSON.stringify(urls),
    ),
);
console.log("Offline cache:", urls.length, "resources");
