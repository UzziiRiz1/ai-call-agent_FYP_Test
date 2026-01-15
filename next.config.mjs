/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: [
    "unrestrictively-premedieval-shauna.ngrok-free.dev",
  ],
}

export default nextConfig