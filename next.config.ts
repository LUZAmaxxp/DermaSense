import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow SSE streams beyond Vercel Hobby 10s default for stream route
  serverExternalPackages: ["mqtt", "mongoose"],
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
  },
};

export default nextConfig;
