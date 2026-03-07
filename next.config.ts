import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  // GitHub Pages serves the site from a subpath (username.github.io/repo),
  // so we need to set basePath and assetPrefix so that links and static
  // assets resolve correctly.
  basePath: "/tabiikanmaike",
  assetPrefix: "/tabiikanmaike/",
  // create folders with index.html instead of .html files; this works better
  // with GitHub Pages' directory-based routing.
  trailingSlash: true,
};

export default nextConfig;
