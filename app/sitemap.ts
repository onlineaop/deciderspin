import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Required for `output: "export"` — file-convention routes need an explicit
// static opt-in or the build fails.
export const dynamic = "force-static";

// The site's real sitemap. Google was previously only finding this site
// through WordPress's Yoast-generated sitemap_index.xml -> page-sitemap.xml,
// which still listed just the 5 pre-migration WP pages (/, /8ball/,
// /privacy-policy/, /terms-of-service/, /contact/) and had zero entries for
// Rock Paper Scissors, Coin Flip, Dice Roller, Random Number, or Team
// Picker — half the site's real routes were invisible to sitemap-driven
// crawling. This generates a static sitemap.xml at build time (static-export
// compatible) covering every live route, and app/robots.ts points crawlers
// at it instead of WordPress's stale one.
const ROUTES = [
  "/",
  "/8ball/",
  "/rock-paper-scissors/",
  "/coin-flip/",
  "/dice-roller/",
  "/random-number/",
  "/team-picker/",
  "/contact/",
  "/privacy-policy/",
  "/terms-of-service/",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((path) => ({
    url: new URL(path, SITE_URL).toString(),
    changeFrequency: "monthly",
    priority: path === "/" ? 1 : 0.8,
  }));
}
