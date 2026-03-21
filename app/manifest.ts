import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  const base =
    process.env.VERCEL ? "" : process.env.NODE_ENV === "production" ? "/tabiikanmaike" : "";

  return {
    name: "旅のしおり",
    short_name: "旅のしおり",
    description: "旅行プランを日別に管理できるアプリ",
    start_url: `${base}/`,
    display: "standalone",
    background_color: "#F0F5FA",
    theme_color: "#6366F1",
    icons: [
      {
        src: `${base}/icon.svg`,
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
