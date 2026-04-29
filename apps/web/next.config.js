/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? 'https://virtual-concierge-production.up.railway.app',
    NEXT_PUBLIC_WIDGET_URL: process.env.NEXT_PUBLIC_WIDGET_URL ?? 'https://thorough-liberation-production-b528.up.railway.app',
  },
};

export default nextConfig;
