import type { Metadata, Viewport } from "next";
import "./globals.css";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: { default: "QuoteFlow — AI quotes for trades", template: "%s · QuoteFlow" },
  description:
    "Customers send photos to your link. AI drafts the quote in seconds. You approve from your phone and they book with one tap.",
  manifest: "/manifest.json",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }, { url: "/icons/icon-192.png", sizes: "192x192" }],
    apple: "/icons/icon-180.png",
  },
  appleWebApp: { capable: true, title: "QuoteFlow", statusBarStyle: "default" },
  openGraph: {
    title: "QuoteFlow — AI quotes for trades",
    description: "Stop losing jobs to slow quotes. Photos in, quote out, booked by text.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#2563eb",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
