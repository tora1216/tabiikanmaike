import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { TripProvider } from "@/components/trip-context";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "旅いかんまいけ",
  description: "旅行プランを日別に管理できるアプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${geist.variable} antialiased`}>
        <TripProvider>{children}</TripProvider>
      </body>
    </html>
  );
}
