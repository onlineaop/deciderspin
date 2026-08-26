import type { Metadata } from "next";
import Script from "next/script";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import SiteChrome from "@/components/SiteChrome";
import "./globals.css";

// Sitewide default for statically-generated pages. Next.js's own default
// (no revalidate = effectively infinite, 1-year Cache-Control) assumes a
// host that purges its cache on every deploy — Hostinger's doesn't. Without
// this, a stale cached response can outlive any number of redeploys until
// someone manually clears it in hPanel. 60s means every route self-heals
// within a minute of any deploy, with zero manual steps, permanently.
export const revalidate = 60;

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

const DEFAULT_TITLE = "DeciderSpin — Spin the Wheel & Magic 8 Ball";
const DEFAULT_DESCRIPTION =
  "Can't decide? Use Decider Spin, the ultimate free random choice generator. Customize your wheel for food, games, or chores and let fate decide instantly!";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: DEFAULT_TITLE,
  description: DEFAULT_DESCRIPTION,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  openGraph: {
    siteName: SITE_NAME,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    url: SITE_URL,
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">
        {GA_MEASUREMENT_ID && (
          <>
            <Script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}');
              `}
            </Script>
          </>
        )}
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
