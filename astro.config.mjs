import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import { remarkEmoji } from "./src/utils/remark-emoji.ts";

export default defineConfig({
  site: "https://t3rm1n4l.dev",
  adapter: cloudflare(),
  output: "server",
  markdown: {
    remarkPlugins: [remarkEmoji],
  },
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          api: "modern-compiler",
        },
      },
    },
  },
});
