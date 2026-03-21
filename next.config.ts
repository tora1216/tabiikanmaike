import type { NextConfig } from "next";

const isVercel = !!process.env.VERCEL;
const isGithubPages = !isVercel && process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: isGithubPages ? "/tabiikanmaike" : "",
  assetPrefix: isGithubPages ? "/tabiikanmaike" : "",
};

export default nextConfig;
