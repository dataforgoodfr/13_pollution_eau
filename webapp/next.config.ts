import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // We currently have some eslint errors in webapp/app/layout.tsx
    // to generate a preview of the website, ignore them temporarily
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
