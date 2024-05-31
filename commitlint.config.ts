// biome-ignore lint/style/noDefaultExport: Required
export default {
  extends: ["@commitlint/config-conventional"],
  ignores: [(commit: string) => commit.startsWith("[ci]")],
};
