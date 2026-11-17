import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
    instantInsights: {
      // All admin pages are Client Components that fetch data in the browser,
      // so instant-navigation validation can never pass. Only validate
      // segments that explicitly export `instant` (see the instant-navigation
      // guide, "Configuring validation defaults").
      validationLevel: "manual-warning",
    },
  },
  cacheComponents: true,
  partialPrefetching: true,
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
