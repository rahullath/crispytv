/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ["raw.githubusercontent.com", "placehold.co", "wallpapercat.com", "art-gallery.api.hbo.com", "images.plexapp.com"],
  },
};
console.log("Next.js Config:", JSON.stringify(nextConfig, null, 2));

module.exports = nextConfig;
