import type { Metadata } from "next";
import "./globals.css";
import { TopBar } from "@/components/nav/TopBar";
import { BottomNav } from "@/components/nav/BottomNav";
import { AuthSync } from "@/components/auth/AuthSync";

export const metadata: Metadata = {
  title: "KiddyFit 🐻",
  description: "Theo dõi cân nặng và chiều cao của bạn!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="font-body antialiased bg-background text-foreground min-h-screen pb-20">
        <AuthSync />
        <TopBar />
        <main className="px-4 py-4 max-w-lg mx-auto">{children}</main>
        <BottomNav />
      </body>
    </html>
  );
}
