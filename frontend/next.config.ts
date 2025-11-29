import type { NextConfig } from "next";
const { i18n } = require('./next-i18next.config')
const nextConfig: NextConfig = {
  images: {
    domains: ["example.com", "another-domain.com", "cdn.pixabay.com", "lh3.googleusercontent.com"],
    remotePatterns: [
      { protocol: "https", hostname: "a0.muscache.com", pathname: "/**" },
      { protocol: "http", hostname: "localhost", pathname: "/**" },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
