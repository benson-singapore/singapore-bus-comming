import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "公交到站提醒",
  description: "实时监控公交到站信息",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
