import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for Docker standalone deployment
  output: "standalone",
};

export default nextConfig;
