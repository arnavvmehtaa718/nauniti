import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import ThemeController from "@/components/ThemeController";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OceanIQ — Maritime Chartering Intelligence",
  description:
    "AI-Powered Maritime Chartering Decision Intelligence for SAIL procurement planning.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full">
        {children}
        <Script id="oceaniq-theme-init" strategy="beforeInteractive">
          {`(function(){try{var t=window.localStorage.getItem("oceaniq-theme");if(t==="light"){document.documentElement.classList.add("light");document.documentElement.style.colorScheme="light";}}catch(e){}})();`}
        </Script>
        <ThemeController />
      </body>
    </html>
  );
}
