/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure proper image optimization
  images: {
    unoptimized: false,
  },
  // Increase timeout for API routes (for Vertex AI calls)
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  // Enable standalone output for Docker/Cloud Run
  output: 'standalone',
};

module.exports = nextConfig;

