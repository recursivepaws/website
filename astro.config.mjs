// Loading environment variables from .env files
// https://docs.astro.build/en/guides/configuring-astro/#environment-variables
import { loadEnv } from "vite";

const { PUBLIC_SANITY_PROJECT_ID, PUBLIC_SANITY_DATASET } = loadEnv(
  import.meta.env.MODE,
  process.cwd(),
  "",
);

import react from "@astrojs/react";
import vercel from "@astrojs/vercel";
import sanity from "@sanity/astro";
import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  output: "server",
  srcDir: "./src/astro",
  integrations: [
    sanity({
      projectId: PUBLIC_SANITY_PROJECT_ID,
      dataset: PUBLIC_SANITY_DATASET,
      useCdn: false,
      apiVersion: "2025-10-20", // Set to date of setup to use the latest API version
      studioBasePath: "/admin",
      stega: {
        studioUrl: "/admin",
      },
    }),
    react({
      experimentalReactChildren: true,
    }), // Required for Sanity Studio
  ],

  adapter: vercel({
    runtime: "nodejs20.x",
  }),

  vite: {
    plugins: [tailwindcss()],
    // Native .node binary, must not be bundled
    ssr: { external: ["@myriaddreamin/typst-ts-node-compiler"] },
  },
});


