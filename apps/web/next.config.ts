import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
