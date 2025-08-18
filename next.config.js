/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["lh3.googleusercontent.com"],
  },
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || "http://localhost:3000",
  },
  // Ensure build process doesn't fail on missing env vars
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client"],
  },
  // Add build-time environment variable validation
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Ensure required environment variables are available during build
      if (!process.env.DATABASE_URL) {
        console.warn("DATABASE_URL not set during build")
      }
      if (!process.env.NEXTAUTH_SECRET) {
        console.warn("NEXTAUTH_SECRET not set during build")
      }
    }
    return config
  },
}

module.exports = nextConfig
