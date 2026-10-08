import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.itch.zone",
        pathname: "/**/original/**",
        search: "",
      },
      {
        protocol: "https",
        hostname: "img.itch.zone",
        pathname: "/**/794x1000/**",
        search: "",
      },
      {
        protocol: "https",
        hostname: "media.fab.com",
        pathname: "/image_previews/gallery_images/**",
        search: "",
      },
    ],
  },
  poweredByHeader: false,
  trailingSlash: true,
  experimental: {
    optimizePackageImports: [
      "@phosphor-icons/react",
      "@phosphor-icons/react/dist/ssr",
    ],
  },
};

export default nextConfig;
