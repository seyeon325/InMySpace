import type { Metadata } from "next";
import localFont from "next/font/local";
import { Footer } from "@/components/Footer";
import { NavBar } from "@/components/NavBar";
import { RoomNav } from "@/components/RoomNav";
import "./globals.css";

const pretendard = localFont({
  src: "../fonts/PretendardVariable.woff2",
  variable: "--font-pretendard",
  weight: "45 920",
  display: "swap",
});

const galmuri = localFont({
  src: "../fonts/Galmuri11.woff2",
  variable: "--font-galmuri",
  display: "swap",
});

const galmuriBold = localFont({
  src: "../fonts/Galmuri11-Bold.woff2",
  variable: "--font-galmuri-bold",
  display: "swap",
});

export const metadata: Metadata = {
  title: "InMySpace · 인마이스페이스",
  description: "우주를 유영하듯, 나의 리듬을 찾아가는 공간. 수면 · 마음 · 루틴을 한 곳에서 관리해요.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      data-theme="light"
      suppressHydrationWarning
      className={`${pretendard.variable} ${galmuri.variable} ${galmuriBold.variable} antialiased`}
    >
      <body className="flex min-h-dvh flex-col">
        <NavBar />
        <RoomNav />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
