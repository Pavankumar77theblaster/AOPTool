/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  // Environment variables exposed to browser
  env: {
    NEXT_PUBLIC_API_URL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
    NEXT_PUBLIC_WS_URL: process.env.REACT_APP_WS_URL || 'ws://localhost:8000/ws',
  },

  // Disable telemetry
  telemetry: {
    disabled: true,
  },

  // Output configuration
  output: 'standalone',
}

module.exports = nextConfig
