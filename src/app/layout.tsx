import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], weight: ["400", "600", "700"] });

export const metadata: Metadata = {
  title: "Creativate Studio | Innovating Digital Growth for SMEs",
  description: "Bespoke web design, custom software development, and digital marketing strategies for Malaysian businesses. 8+ years of expertise in digital transformation.",
  keywords: ["Web Design Malaysia", "Custom Software Development", "ERP Solutions Malaysia", "Digital Marketing agency", "Creativate Studio"],
  openGraph: {
    title: "Creativate Studio | Innovating Digital Growth for SMEs",
    description: "Innovating Digital Growth for Malaysian SMEs.",
    url: "https://creativatestudio.my",
    siteName: "Creativate Studio",
    locale: "en_MY",
    type: "website",
  },
  icons: {
    icon: "/favicon.png",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
