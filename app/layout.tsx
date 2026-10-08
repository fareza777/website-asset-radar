import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Sidebar } from "@/components/sidebar";
import { Footer } from "@/components/footer";
import { LibraryProvider } from "@/components/library-provider";
import { MotionProvider } from "@/components/motion-provider";
import { assets, collections, directoryAssets } from "@/lib/catalog";
import { siteDescription, siteUrl } from "@/lib/site";
import "./globals.css";
import "./discovery.css";
import "./polish.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "AssetRadar | Free game assets. Your next world starts here.",
    template: "%s | AssetRadar",
  },
  description: siteDescription,
  applicationName: "AssetRadar",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "AssetRadar",
    locale: "en_US",
    title: "AssetRadar. Your next world starts here.",
    description: siteDescription,
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: "AssetRadar, a curated library of free game assets",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AssetRadar. Your next world starts here.",
    description: siteDescription,
    images: ["/og.jpg"],
  },
  robots: { index: true, follow: true },
  icons: { icon: "/icon.svg", apple: "/apple-icon.png" },
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#111315",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geist.variable} ${mono.variable}`}
    >
      <body>
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <LibraryProvider ids={directoryAssets.map((asset) => asset.id)}>
          <MotionProvider>
            <Sidebar
              freeCount={assets.length}
              collectionCount={collections.length}
            />
            <div className="main-shell">
              <main id="main-content" className="main-content">
                {children}
              </main>
              <Footer />
            </div>
          </MotionProvider>
        </LibraryProvider>
      </body>
    </html>
  );
}
