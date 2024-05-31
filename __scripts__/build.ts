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
  fs.unlinkSync("../src/index.d.ts");
  fs.unlinkSync("../src/index.js");
} catch {
  console.log("[Bun.build] Skip to delete some files.");
}

Bun.build({
  root: "./src",
  entrypoints: ["./index.ts"],
  target: "bun",
  format: "esm",
  outdir: "./src",
  external,
  minify: true,
});

console.log("[Bun.build] Create `./src/index.js`");
