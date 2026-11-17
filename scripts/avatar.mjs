import * as T from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { GLTFExporter } from "three/addons/exporters/GLTFExporter.js";
import { writeFile } from "node:fs/promises";
globalThis.FileReader = class {
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then((b) => {
      this.result = b;
      this.onloadend?.();
    });
  }
  readAsDataURL(blob) {
    blob.arrayBuffer().then((b) => {
      this.result =
        "data:application/octet-stream;base64," +
        Buffer.from(b).toString("base64");
      this.onloadend?.();
    });
  }
};
const bones = [
  "Root",
  "Hips",
  "Spine",
  "Head",
  "ArmL",
  "ArmR",
  "LegL",
  "LegR",
].map((n) => {
  const b = new T.Bone();
  b.name = n;
  return b;
});
bones[0].add(bones[1]);
bones[1].position.y = 0.8;
bones[1].add(bones[2], bones[6], bones[7]);
bones[2].position.y = 0.45;
bones[2].add(bones[3], bones[4], bones[5]);
bones[3].position.y = 0.48;
bones[4].position.set(-0.32, 0.1, 0);
bones[5].position.set(0.32, 0.1, 0);
bones[6].position.x = -0.14;
bones[7].position.x = 0.14;
const parts = [];
const mats = [
  new T.MeshStandardMaterial({
    name: "Dress",
    color: "#79334c",
    roughness: 0.8,
  }),
  new T.MeshStandardMaterial({ name: "Skin", color: "#e5b99a" }),
  new T.MeshStandardMaterial({ name: "Hair", color: "#493324" }),
  new T.MeshStandardMaterial({ name: "Shoes", color: "#40332e" }),
];
let materials = [];
function part(geo, x, y, z, bone, mat) {
  geo.translate(x, y, z);
  const count = geo.attributes.position.count;
  geo.setAttribute(
    "skinIndex",
    new T.Uint16BufferAttribute(
      Array.from({ length: count }, () => [bone, 0, 0, 0]).flat(),
      4,
    ),
  );
  geo.setAttribute(
    "skinWeight",
    new T.Float32BufferAttribute(
      Array.from({ length: count }, () => [1, 0, 0, 0]).flat(),
      4,
    ),
  );
  parts.push(geo);
  materials.push(mat);
}
part(new T.CylinderGeometry(0.19, 0.35, 0.85, 12), 0, 1.18, 0, 2, 0);
part(new T.SphereGeometry(0.235, 12, 10), 0, 1.77, 0, 3, 1);
part(new T.SphereGeometry(0.25, 12, 10), 0, 1.85, -0.07, 3, 2);
for (const [x, b] of [
  [-0.34, 4],
  [0.34, 5],
])
  part(new T.BoxGeometry(0.12, 0.59, 0.13), x, 1.07, 0, b, 1);
for (const [x, b] of [
  [-0.14, 6],
  [0.14, 7],
]) {
  part(new T.BoxGeometry(0.14, 0.65, 0.14), x, 0.4, 0, b, 1);
  part(new T.BoxGeometry(0.17, 0.12, 0.3), x, 0.08, 0.06, b, 3);
}
const geo = mergeGeometries(parts, true);
geo.groups.forEach((g, i) => (g.materialIndex = materials[i]));
const mesh = new T.SkinnedMesh(geo, mats);
mesh.name = "Alina";
mesh.add(bones[0]);
mesh.bind(new T.Skeleton(bones));
const scene = new T.Group();
scene.add(mesh);
scene.updateMatrixWorld(true);
function track(bone, angles, times = [0, 0.3, 0.6, 0.9, 1.2]) {
  return new T.QuaternionKeyframeTrack(
    bone + ".quaternion",
    times,
    angles.flatMap(([x, y, z]) =>
      new T.Quaternion().setFromEuler(new T.Euler(x, y, z)).toArray(),
    ),
  );
}
const clips = [
  new T.AnimationClip("idle", 2, [
    track(
      "Spine",
      [
        [0, 0, -0.02],
        [0, 0, 0.02],
        [0, 0, -0.02],
      ],
      [0, 1, 2],
    ),
  ]),
  new T.AnimationClip("walk", 1.2, [
    track("LegL", [
      [0.45, 0, 0],
      [-0.45, 0, 0],
      [0.45, 0, 0],
      [-0.45, 0, 0],
      [0.45, 0, 0],
    ]),
    track("LegR", [
      [-0.45, 0, 0],
      [0.45, 0, 0],
      [-0.45, 0, 0],
      [0.45, 0, 0],
      [-0.45, 0, 0],
    ]),
    track("ArmL", [
      [-0.2, 0, 0],
      [0.2, 0, 0],
      [-0.2, 0, 0],
      [0.2, 0, 0],
      [-0.2, 0, 0],
    ]),
  ]),
  ...["joy", "surprise", "talk", "sit", "interact"].map(
    (name, i) =>
      new T.AnimationClip(name, 1.2, [
        track(
          i === 3 ? "LegL" : "ArmR",
          [
            [0, 0, 0],
            [i === 3 ? -1.4 : 0, 0, i === 3 ? 0 : -0.5 - i * 0.15],
            [0, 0, 0],
          ],
          [0, 0.6, 1.2],
        ),
      ]),
  ),
];
const result = await new GLTFExporter().parseAsync(scene, {
  binary: true,
  animations: clips,
});
await writeFile("public/models/alina.glb", Buffer.from(result));
console.log("Original rigged GLB exported:", result.byteLength, "bytes");
for (const [name, color, hair, scale] of [
  ["victoria", "#c1a36c", "#6c4434", 1.04],
  ["isabella", "#354b40", "#392d23", 1.01],
  ["sofia", "#bd91ab", "#a57448", 0.96],
  ["margaret", "#7b8f9f", "#55443b", 1.02],
]) {
  mats[0].color.set(color);
  mats[2].color.set(hair);
  scene.scale.setScalar(scale);
  const out = await new GLTFExporter().parseAsync(scene, {
    binary: true,
    animations: clips,
  });
  await writeFile("public/models/" + name + ".glb", Buffer.from(out));
}
