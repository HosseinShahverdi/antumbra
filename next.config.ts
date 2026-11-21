import type { NextConfig } from "next";

/**
 * ANTUMBRA is a single-route, fully static concept site.
 * `output: "export"` emits a plain `out/` folder that any static host can serve
 * (Vercel, Netlify, Cloudflare Pages, GitHub Pages, S3…).
 * Images are pre-optimised by `npm run images` (sharp → responsive WebP),
 * so Next's runtime optimiser is not needed.
 */
const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
