import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Deployed standalone on its own subdomain (admin.topdevelopmentcompany.com)
  // rather than path-proxied under the public site, so no basePath is needed.
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "4000", pathname: "/uploads/**" },
      { protocol: "https", hostname: "api.topdevelopmentcompany.com", pathname: "/uploads/**" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "flagcdn.com" },
    ],
  },
};

export default nextConfig;
