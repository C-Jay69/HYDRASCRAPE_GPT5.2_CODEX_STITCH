import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  experimental: {
    turbopack: {
      // Explicitly set the root to the current directory to avoid "illegal path" 
      // and workspace root detection issues in WSL/Windows environments.
      root: path.resolve(__dirname),
    },
  },
};

export default nextConfig;