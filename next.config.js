/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['compromise', 'sentiment', 'syllable'],
  },
};

module.exports = nextConfig;
