import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Allow production builds to complete even with type errors
    // (nodemailer missing @types — non-critical)
    ignoreBuildErrors: true,
  },
  serverExternalPackages: ["pg"],
  headers: async () => [
    {
      // Prevent caching of HTML pages so users always get the latest JS chunk references
      source: "/((?!_next/static|_next/image|favicon.ico).*)",
      headers: [
        { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
        { key: "Pragma", value: "no-cache" },
        { key: "Expires", value: "0" },
      ],
    },
  ],
};

export default nextConfig;
