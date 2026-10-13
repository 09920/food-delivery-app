import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  env: {
    DATABASE_URL: process.env.DATABASE_URL || (process.env.VERCEL ? "file:/tmp/dev.db" : "file:./prisma/dev.db"),
  },
  outputFileTracingIncludes: {
    "/*": ["./prisma/dev.db"],
  },
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
