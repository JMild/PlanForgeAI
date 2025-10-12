/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true, // จะไม่หยุด build ถ้าเจอ ESLint errors/warnings
  },
};
export default nextConfig;
