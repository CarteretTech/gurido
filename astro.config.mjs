import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  // Set the CravenSEO domain here
  site: "https://cravenseo.com/",
  integrations: [
    tailwind(),
    sitemap()
  ],
  // Performance optimizations
  compressHTML: true,
  build: {
    inlineStylesheets: 'auto', // Inline small stylesheets for performance
  }
});