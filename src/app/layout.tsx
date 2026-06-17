import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], weight: ["400", "600", "700"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://creativatestudio.my"),
  title: "Creativate Studio | AI Chatbots, Web Development & CRM for SMEs",
  description: "Malaysian digital agency specializing in bespoke web design, custom CRM & ERP software, mobile apps, AI chatbots & automation, and tech support for SMEs.",
  keywords: [
    "AI Chatbots Malaysia",
    "AI Automation Agency Kuala Lumpur",
    "Web Design Malaysia",
    "Custom Software Development",
    "Custom CRM Development",
    "Mobile App Development Malaysia",
    "Website Maintenance Services Malaysia",
    "System Support & Maintenance",
    "Digital Marketing Agency Kuala Lumpur",
    "Creativate Studio"
  ],
  alternates: {
    canonical: "https://creativatestudio.my",
  },
  openGraph: {
    title: "Creativate Studio | AI Chatbots, Web Development & CRM for SMEs",
    description: "Malaysian digital agency specializing in bespoke web design, custom CRM & ERP software, mobile apps, AI chatbots & automation, and tech support for SMEs.",
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
    title: "Creativate Studio | AI Chatbots, Web Development & CRM for SMEs",
    description: "Malaysian digital agency specializing in bespoke web design, custom CRM & ERP software, mobile apps, AI chatbots & automation, and tech support for SMEs.",
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
