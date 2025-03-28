import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['res.cloudinary.com'],  // Thêm domain Cloudinary vào đây
  },
};

export default nextConfig;
