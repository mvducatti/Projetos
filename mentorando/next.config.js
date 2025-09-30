/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['lh3.googleusercontent.com', 'media.licdn.com'],
  },
  experimental: {
    serverActions: true,
  },
}

module.exports = nextConfig