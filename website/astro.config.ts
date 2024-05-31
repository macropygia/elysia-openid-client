import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";
import starlightTypeDoc, { typeDocSidebarGroup } from "starlight-typedoc";

// biome-ignore lint/style/noDefaultExport: Requires
export default defineConfig({
  site: "https://macropygia.github.io/elysia-openid-client/",
  base: "/elysia-openid-client/",
  integrations: [
    starlight({
      title: "Elysia OpenID Client",
      defaultLocale: "root",
      locales: {
        root: {
          label: "English",
          lang: "en",
        },
        ja: {
          label: "日本語",
        },
      },
      social: {
        github: "https://github.com/macropygia/elysia-openid-client",
      },
      customCss: ["./src/styles/custom.css"],
      plugins: [
        starlightTypeDoc({
          entryPoints: ["../src/*.ts", "../src/*/index.ts"],
          tsconfig: "../tsconfig.json",
          typeDoc: {
            exclude: [
              "**/*.test.ts",
              "**/*.config.ts",
              "**/*.d.ts",
              "**/.*/**",
              "**/__*__/**",
            ],
          },
          sidebar: {
            label: "TypeDoc",
          },
        }),
      ],
      sidebar: [
        {
          label: "Start Here",
          items: [
            {
              label: "Introduction",
              link: "/",
            },
            {
              label: "Getting Started",
              link: "/getting-started/",
            },
          ],
        },
        {
          label: "Guides",
          items: [
            {
              label: "Configuration",
              link: "/guides/configuration/",
            },
            {
              label: "Endpoints",
              link: "/guides/endpoints/",
            },
            {
              label: "Hooks",
              link: "/guides/hooks/",
            },
            {
              label: "Data Adapter",
              link: "/guides/data-adapter/",
            },
            {
              label: "Logger",
              link: "/guides/logger/",
            },
          ],
        },
        {
          label: "Examples",
          autogenerate: { directory: "examples" },
        },
        typeDocSidebarGroup,
      ],
    }),
  ],
});
