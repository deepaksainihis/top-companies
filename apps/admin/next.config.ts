import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Served behind apps/web's rewrite proxy at /admin/* (Next.js "Multi
  // Zones" pattern) so the whole product runs on one public port. basePath
  // makes every Link/router.push/asset path automatically /admin-prefixed -
  // no route code changes needed.
  basePath: "/admin",
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "4000", pathname: "/uploads/**" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "flagcdn.com" },
    ],
  },
};

export default nextConfig;
