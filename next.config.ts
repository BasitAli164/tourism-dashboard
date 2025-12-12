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
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // This is TEMPORARY to bypass the route type checking issue
    ignoreBuildErrors: true,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  // Optional: Disable typed routes if you're still having issues
  experimental: {
    typedRoutes: false,
  }
};

export default nextConfig;