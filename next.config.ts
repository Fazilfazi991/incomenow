import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  logging: {
    incomingRequests: {
      // Auth callbacks carry short-lived credentials in their query strings.
      // Keep those URLs out of the development request log.
      ignore: [/^\/auth\/(?:callback|confirm|recovery)(?:\?|$)/],
    },
  },
};

export default nextConfig;
