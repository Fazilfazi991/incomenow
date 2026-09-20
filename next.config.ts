import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingIncludes: {
    "/app/resources/pergola-source": ["./private-resources/pergola/universalpergola-main.zip"],
  },
  logging: {
    incomingRequests: {
      // Auth callbacks carry short-lived credentials in their query strings.
      // Keep those URLs out of the development request log.
      ignore: [/^\/auth\/(?:callback|confirm|recovery)(?:\?|$)/],
    },
  },
};

export default nextConfig;
