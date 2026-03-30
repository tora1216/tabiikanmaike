import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { TripProvider } from "@/components/trip-context";
import { AuthProvider } from "@/components/auth-context";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#6366F1",
};

const BASE =
  process.env.VERCEL ? "" : process.env.NODE_ENV === "production" ? "/tabiikanmaike" : "";

export const metadata: Metadata = {
  title: "旅のしおり",
  description: "旅行プランを日別に管理できるアプリ",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "旅のしおり",
  },
  icons: {
    icon: `${BASE}/icon.png`,
    apple: `${BASE}/icon.png`,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `try{if(localStorage.getItem('theme')==='dark')document.documentElement.classList.add('dark')}catch(e){}` }} />
      </head>
      <body className={`${geist.variable} antialiased`}>
        <AuthProvider><TripProvider>{children}</TripProvider></AuthProvider>
      </body>
    </html>
  );
}
