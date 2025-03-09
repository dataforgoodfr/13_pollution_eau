import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */ serverExternalPackages: ["@duckdb/node-api"],
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
