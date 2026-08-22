import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.88.91', '192.168.1.3', '192.168.1.15', 'localhost:3000'],
  images: {
    qualities: [75, 90],
  },
};

export default withNextIntl(nextConfig);