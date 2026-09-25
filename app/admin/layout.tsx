import type { Metadata } from "next";

// The admin area must never appear in search results (auth is still enforced server-side).
export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
