import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Pin the file-tracing root to this package so a stray lockfile in a parent
  // directory (e.g. the user's home dir) can't change build output.
  outputFileTracingRoot: path.join(process.cwd()),
};

export default nextConfig;
