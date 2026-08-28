import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Required for `output: "export"` — file-convention routes need an explicit
// static opt-in or the build fails.
export const dynamic = "force-static";

// Deploying a real robots.txt file to the docroot takes priority over
// WordPress's virtual /robots.txt (same "real file wins over the WP
// fallback" mechanism already used for the homepage passthrough — see
// deciderspin-site-architecture memory) — pointing crawlers at our real
// sitemap.ts output instead of Yoast's stale, half-empty one.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: new URL("/sitemap.xml", SITE_URL).toString(),
  };
}
