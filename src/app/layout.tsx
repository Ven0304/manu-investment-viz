import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MANU Research Workspace",
  description: "可追踪的 MANU 中文投资研究工作区",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
