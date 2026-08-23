import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'store.storeimages.cdn-apple.com' },
      { protocol: 'https', hostname: 'i.dell.com' },
      { protocol: 'https', hostname: 'www.lg.com' },
      { protocol: 'https', hostname: 'lsco.scene7.com' },
      { protocol: 'https', hostname: 'static.nike.com' },
      { protocol: 'https', hostname: 'dyson-h.assetsadobe2.com' },
      { protocol: 'https', hostname: 's7d2.scene7.com' },
      { protocol: 'https', hostname: 'images.penguinrandomhouse.com' },
      { protocol: 'https', hostname: 'www.lego.com' },
    ],
  },
};

export default nextConfig;
