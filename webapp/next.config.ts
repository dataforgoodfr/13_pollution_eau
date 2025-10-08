import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@duckdb/node-api"],
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  output: "standalone",
  headers: async () => {
    return [
      {
        source: "/pmtiles/:path*.pmtiles",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=120, s-maxage=60",
          },
          {
            key: "Accept-Ranges",
            value: "bytes",
          },
        ],
      },
      // {
      //   source: "/_next/static/:path*",
      //   headers: [
      //     {
      //       key: "Cache-Control",
      //       value: "public, max-age=31536000, immutable",
      //     },
      //   ],
      // },
      {
        source: "/embed",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=120, s-maxage=60",
          },
        ],
      },
    ];
  },
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
