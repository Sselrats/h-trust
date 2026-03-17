import type { Metadata } from "next";
import { Manrope, Noto_Sans_KR } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"],
  variable: "--font-noto-kr",
});

export const metadata: Metadata = {
  title: "H-TRUST Demo",
  description: "금융 AI 의사결정 파이프라인 데모",
  icons: {
    icon: "/h-trust_manifest.png",
    apple: "/h-trust_manifest.png",
    shortcut: "/h-trust_manifest.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${manrope.variable} ${notoSansKr.variable} font-[var(--font-noto-kr)] text-navy-900 antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
