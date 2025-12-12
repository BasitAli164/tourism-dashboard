import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() { // this is because to landing at the first time in signin page
    return [
      {
        source: "/", // Redirect from the homepage
        destination: "/signin", // Redirect to /dashboard
        permanent: false, // Use false for temporary redirect (307)
      },
    ];
  },
};

export default nextConfig;
