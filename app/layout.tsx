import type { Metadata } from "next";
import "./globals.css";
import "./light.css";
import "./concert.css";

export const metadata: Metadata = {
  title: "同一现场 · 找到你在场的那一晚",
  description: "发现演出、分享现场，让每一个视角留住那一晚。",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
