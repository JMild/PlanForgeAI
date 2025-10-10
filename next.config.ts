/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true, // จะไม่หยุด build ถ้าเจอ ESLint errors/warnings
  },
};
export default nextConfig;
