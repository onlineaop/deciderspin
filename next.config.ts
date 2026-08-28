import type { NextConfig } from "next";

// Static export: deciderspin.com deploys as plain HTML/CSS/JS files onto
// existing shared hosting (via the same file-write path used for the
// original prototype), not a Hostinger Node.js App — the account's 5-app
// Node.js limit is already fully used by other projects. No server means
// no Server Actions (the contact form posts to a small PHP script instead,
// see server/contact-submit.php) and no next/image on-demand optimization.
const nextConfig: NextConfig = {
  output: "export",
  // Emits <route>/index.html instead of <route>.html, so plain Apache
  // serves /8ball/ etc. natively via directory-index with no rewrite
  // rules needed — matches how the rest of the site's URLs already work.
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Deploys go live via a manual file-by-file transfer to shared hosting
  // (no CI, no full-directory sync), so a fresh random build ID on every
  // `next build` — Next's default — silently changes the embedded RSC
  // payload on every single page even when that page's own code didn't
  // change, which in turn changes every page's byte content and requires
  // re-deploying pages that have nothing to do with the actual edit. Pin
  // it to a fixed value so only routes whose own code actually changed
  // produce different output.
  generateBuildId: () => "2x7sHzE6PL55ZyIvAhWpF",
};

export default nextConfig;
