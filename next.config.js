/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dgram: false,
        'dns/promises': false,
        dns: false,
        'perf_hooks': false
      };
    }
    return config;
  },
  images: {
    domains: [
      'placehold.co',
      'wallpapercat.com',
      'encrypted-tbn0.gstatic.com'
    ],
  },
};
console.log("Next.js Config:", JSON.stringify(nextConfig, null, 2));

module.exports = nextConfig;
