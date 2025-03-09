import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@duckdb/node-api"],
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  output: "standalone",
  rewrites: async () => {
    return [
      {
        source: "/s3/:path*",
        destination: "https://s3.fr-par.scw.cloud/pollution-eau-s3/:path*",
      },
    ];
  },
};

export default nextConfig;
