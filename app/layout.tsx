import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "管理者パネル",
  // 検索エンジンにインデックスさせない
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
