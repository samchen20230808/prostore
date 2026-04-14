import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "3u8hv3crox.ufs.sh",
        port: "",
      },
    ],
  },
};

export default nextConfig;
