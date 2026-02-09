import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import svelte from "@astrojs/svelte";
import icon from "astro-icon";
import { remarkEmoji } from "./src/utils/remark-emoji.ts";

export default defineConfig({
  site: "https://t3rm1n4l.dev",
  adapter: cloudflare(),
  output: "server",
  integrations: [icon(), svelte()],
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
