import type { NextConfig } from "next";

const isVercel = !!process.env.VERCEL;
const isGithubPages = !isVercel && process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  basePath: isGithubPages ? "/tabiikanmaike" : "",
  assetPrefix: isGithubPages ? "/tabiikanmaike" : "",
};

export default nextConfig;
