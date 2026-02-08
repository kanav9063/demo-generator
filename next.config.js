/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: [
      "remotion",
      "@remotion/renderer",
      "@remotion/bundler",
      "@remotion/cli",
      "@remotion/transitions",
      "@remotion/media-parser",
    ],
  },
  webpack: (config, { isServer }) => {
    config.resolve.fallback = { ...config.resolve.fallback, fs: false };
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        "@remotion/renderer": false,
        "@remotion/bundler": false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
