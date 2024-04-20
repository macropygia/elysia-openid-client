import fs from "node:fs";
import packageJson from "../package.json";

const { dependencies, peerDependencies } = packageJson;
const external = [
  ...new Set([
    ...Object.keys(dependencies || {}),
    ...Object.keys(peerDependencies || {}),
  ]),
];

try {
  fs.unlinkSync("../index.d.ts");
  fs.unlinkSync("../index.js");
} catch {
  console.log("[Bun.build] Skip to delete some files.");
}

Bun.build({
  root: "../",
  entrypoints: ["./index.ts"],
  target: "bun",
  format: "esm",
  outdir: "../",
  external,
  minify: true,
});

console.log("[Bun.build] Create `../index.js`");
