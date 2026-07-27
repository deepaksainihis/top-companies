import type { NextConfig } from "next";

const ADMIN_ORIGIN = process.env.ADMIN_APP_ORIGIN ?? "http://localhost:3002";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "4000", pathname: "/uploads/**" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "flagcdn.com" },
    ],
  },
  // Next.js "Multi Zones": apps/admin (its own Next.js app, basePath=/admin)
  // is reverse-proxied here so the whole product is reachable on this one
  // public port - the browser only ever sees http://localhost:3000/admin/*.
  async rewrites() {
    return [
      { source: "/admin", destination: `${ADMIN_ORIGIN}/admin` },
      { source: "/admin/:path*", destination: `${ADMIN_ORIGIN}/admin/:path*` },
    ];
  },
};

export default nextConfig;
