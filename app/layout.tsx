import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { getSiteSettings } from "@/lib/db/queries/settings";
import { getSiteUrl } from "@/lib/seo/site";
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
  const siteUrl = getSiteUrl();
  const defaultTitle =
    settings.defaultSeoTitle ?? `${settings.companyName} | Software, AI, IoT, Robotics & Technology Training`;
  const googleVerification = process.env.GOOGLE_SITE_VERIFICATION?.trim();

  return {
    metadataBase: new URL(siteUrl),
    applicationName: settings.companyName,
    title: {
      default: defaultTitle,
      template: `%s | ${settings.companyName}`,
    },
    description: settings.defaultSeoDescription ?? undefined,
    robots: { index: true, follow: true, "max-image-preview": "large" },
    verification: googleVerification ? { google: googleVerification } : undefined,
    icons: {
      icon: [
        { url: "/brand/icon-48.png", sizes: "48x48", type: "image/png" },
        { url: "/brand/icon-192.png", sizes: "192x192", type: "image/png" },
        { url: "/brand/leotech-logo.svg", type: "image/svg+xml" },
      ],
      shortcut: "/brand/icon-48.png",
      apple: [{ url: "/brand/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    },
    openGraph: {
      type: "website",
      siteName: settings.companyName,
      locale: "en_US",
      title: defaultTitle,
      description: settings.defaultSeoDescription ?? undefined,
      images: settings.defaultOgImage ? [settings.defaultOgImage] : undefined,
      url: "/",
    },
    twitter: {
      card: "summary_large_image",
      title: defaultTitle,
      description: settings.defaultSeoDescription ?? undefined,
      images: settings.defaultOgImage ? [settings.defaultOgImage] : undefined,
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
