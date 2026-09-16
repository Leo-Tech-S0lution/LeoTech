import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { getSiteSettings } from "@/lib/db/queries/settings";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: settings.defaultSeoTitle ?? settings.companyName,
      template: `%s | ${settings.companyName}`,
    },
    description: settings.defaultSeoDescription ?? undefined,
    icons: {
      icon: "/brand/leotech-logo.svg",
      shortcut: "/brand/leotech-logo.svg",
      apple: "/brand/leotech-logo.svg",
    },
    openGraph: {
      type: "website",
      siteName: settings.companyName,
      title: settings.defaultSeoTitle ?? settings.companyName,
      description: settings.defaultSeoDescription ?? undefined,
      images: settings.defaultOgImage ? [settings.defaultOgImage] : undefined,
      url: siteUrl,
    },
    twitter: {
      card: "summary_large_image",
      title: settings.defaultSeoTitle ?? settings.companyName,
      description: settings.defaultSeoDescription ?? undefined,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
