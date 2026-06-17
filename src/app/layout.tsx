import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], weight: ["400", "600", "700"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://creativatestudio.my"),
  title: "Creativate Studio | Innovating Digital Growth for SMEs",
  description: "Bespoke web design, custom software development, digital marketing, and technical support & maintenance services for Malaysian businesses.",
  keywords: [
    "Web Design Malaysia",
    "Custom Software Development",
    "Custom CRM Development",
    "Website Maintenance Services Malaysia",
    "System Support & Maintenance",
    "Digital Marketing Agency Kuala Lumpur",
    "Creativate Studio"
  ],
  alternates: {
    canonical: "https://creativatestudio.my",
  },
  openGraph: {
    title: "Creativate Studio | Innovating Digital Growth for SMEs",
    description: "Bespoke web design, custom software development, digital marketing, and technical support & maintenance services for Malaysian businesses.",
    url: "https://creativatestudio.my",
    siteName: "Creativate Studio",
    locale: "en_MY",
    type: "website",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Creativate Studio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Creativate Studio | Innovating Digital Growth for SMEs",
    description: "Bespoke web design, custom software development, digital marketing, and technical support & maintenance services for Malaysian businesses.",
    images: ["/logo.png"],
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
