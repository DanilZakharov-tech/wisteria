import { readFile, access } from "node:fs/promises";
import assert from "node:assert/strict";
const b = await readFile("public/models/alina.glb");
assert.equal(b.toString("utf8", 0, 4), "glTF");
const len = b.readUInt32LE(12);
const gltf = JSON.parse(b.toString("utf8", 20, 20 + len));
assert.equal(gltf.skins[0].joints.length, 8);
for (const name of [
  "idle",
  "walk",
  "joy",
  "surprise",
  "talk",
  "sit",
  "interact",
])
  assert(gltf.animations.some((a) => a.name === name));
const manifest = JSON.parse(
  await readFile("dist/manifest.webmanifest", "utf8"),
);
for (const i of manifest.icons) await access("dist" + i.src);
const sw = await readFile("dist/sw.js", "utf8");
assert(sw.includes("/models/alina.glb"));
assert(sw.includes("/assets/index-"));
console.log(
  "GLB: 8 joints, 7 animation clips; PWA icons and production precache validated",
);
