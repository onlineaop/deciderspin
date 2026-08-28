import type { Metadata } from "next";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
export const SITE_NAME = "DeciderSpin";

export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}

// Every route's page.tsx should build its metadata through this helper
// instead of a bare `{ title, description, alternates }` object. Next.js
// only shallow-merges metadata between a layout and its page — a page that
// sets `title`/`description` but never touches `openGraph`/`twitter`
// silently inherits the ROOT LAYOUT's openGraph/twitter values unchanged,
// so every page ends up sharing the homepage's social-share title and
// description (this was a real, confirmed-live SEO gap — see
// deciderspin-site-architecture memory). Centralizing it here means a new
// route can't accidentally skip page-specific OG/Twitter tags again.
export function buildMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const url = absoluteUrl(path);
  // Fixed, always-the-same share image (generated once at build time by
  // app/opengraph-image.tsx, copied postbuild to a correctly-extensioned
  // path by scripts/copy-og-image.mjs — see that file for why). Referenced
  // explicitly here, on every page, rather than relying on Next's
  // file-convention auto-wiring: setting `openGraph`/`twitter` at all in a
  // page's metadata replaces the parent layout's object outright (Next only
  // shallow-merges metadata), which silently drops that auto-wired image on
  // every route except the literal root otherwise.
  const image = {
    url: absoluteUrl("/og-image.png"),
    width: 1200,
    height: 630,
    alt: `${SITE_NAME} — Spin the Wheel & Magic 8 Ball`,
  };
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      locale: "en_US",
      type: "website",
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image.url],
    },
  };
}
