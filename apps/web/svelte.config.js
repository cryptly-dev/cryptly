import adapterCloudflare from "@sveltejs/adapter-cloudflare";
import adapterVercel from "@sveltejs/adapter-vercel";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

const config = {
  preprocess: vitePreprocess(),
  kit: {
    // Production (cryptly.dev) is built by Vercel via frontend/vercel.json; Vercel sets VERCEL=1.
    adapter: process.env.VERCEL ? adapterVercel() : adapterCloudflare(),
    env: {
      publicPrefix: "PUBLIC_",
    },
  },
};

export default config;
