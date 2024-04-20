import fs from "node:fs";

const ja = Bun.spawn([
  "bunx",
  "typedoc",
  "--options",
  "./__scripts__/typedoc.ja.json",
]);

const main = Bun.spawn([
  "bunx",
  "typedoc",
  "--options",
  "./__scripts__/typedoc.json",
]);

await Promise.all([ja.exited, main.exited]);

if (ja.exitCode !== 0 || main.exitCode !== 0) {
  throw new Error("TypeDoc failed");
}

const docsDir = "./docs";
const jaDir = "./.temp";
const indexPath = `${docsDir}/index.html`;
const jaIndexPath = `${jaDir}/index.html`;
const jaIndexDest = `${docsDir}/index.ja.html`;

if (!fs.existsSync(indexPath)) {
  throw new Error(`"${docsDir}/index.html" does not exist`);
}

if (!fs.existsSync(jaIndexPath)) {
  throw new Error(`"${jaDir}/index.html" does not exist`);
}

const indexHtml = fs.readFileSync(indexPath).toString();
const replacedIndexHtml = indexHtml
  .replaceAll(`<a href="README.ja.md">`, `<a href="index.ja.html">`)
  .replaceAll("https://macropygia.github.io/elysia-openid-client", ".");
fs.writeFileSync(indexPath, replacedIndexHtml);

const jaIndexHtml = fs.readFileSync(jaIndexPath).toString();
const replacedJaIndexHtml = jaIndexHtml
  .replaceAll(`<a href="README.md">`, `<a href="index.html">`)
  .replaceAll(
    `<a href="modules.html" class="current">`,
    `<a href="index.ja.html" class="current">`,
  )
  .replaceAll("https://macropygia.github.io/elysia-openid-client", ".");

fs.writeFileSync(jaIndexDest, replacedJaIndexHtml);

fs.rmdirSync(jaDir, { recursive: true });

console.log("[docs] Succeeded");
