/**
 * Astro configuration for my-buddy.
 * Flat-file business management dashboard with Tailwind CSS v4 and wiki-link support.
 */
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import { remarkWikiLinks } from "./src/plugins/wiki-links/remark-plugin.ts";

export default defineConfig({
  markdown: {
    remarkPlugins: [remarkWikiLinks],
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
