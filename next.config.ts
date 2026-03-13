import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  // create folders with index.html instead of .html files; this works better
  // with GitHub Pages' directory-based routing.
  trailingSlash: true,
};

export default nextConfig;
