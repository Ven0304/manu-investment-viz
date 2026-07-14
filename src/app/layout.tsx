import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MANU Investment Dossier",
  description: "MANU 中文投资研究报告：从投资结论追溯财务、估值、风险与数据质量证据。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
