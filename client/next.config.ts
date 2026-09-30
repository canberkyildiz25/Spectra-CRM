import path from 'node:path';
import type { NextConfig } from 'next';

/* The client imports types and the axios instance from ../shared, which sits
   outside this folder. Turbopack does not resolve files above its root, so the
   root is the monorepo, not the client. Stated rather than left to lockfile
   detection so a stray lockfile inside client/ cannot quietly move it. */
const root = path.join(__dirname, '..');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: { root },
  outputFileTracingRoot: root,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  },
};

export default nextConfig;
