const withPWA = require('@ducanh2912/next-pwa').default;

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-f41beccd0d7d4160947b60e1d23f53c0.r2.dev',
      },
    ],
  },
};

module.exports = withPWA({
  dest: 'public',
  disable: false,
  register: true,
  reloadOnOnline: true,
  customWorkerSrc: 'worker',
  workboxOptions: {
    disableDevLogs: true,
  },
})(nextConfig);
