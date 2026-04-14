import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // !! 警告：這會允許有型別錯誤的專案部署成功 !!
    ignoreBuildErrors: true,
  },
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
