import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
      {
        protocol: "https",
        hostname: "yfgspvencnexiiwbjbjj.supabase.co",
      },
      {
        protocol: "https",
        hostname: "ui-avatars.com",
      },
    ],
  },
};

export default nextConfig;
