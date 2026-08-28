// The next/og `opengraph-image.tsx` route convention exports its static
// export output as a bare file named `opengraph-image` with NO extension
// (out/opengraph-image). Served as-is from plain Apache with no matching
// MIME rule, that risks the wrong Content-Type header (or none), which
// social-share crawlers (Facebook/Twitter/Slack) are unreliable about
// following. So: keep opengraph-image.tsx for its normal auto-wiring on the
// root route, but also copy its bytes to a stable, correctly-extensioned
// out/og-image.png that every page's metadata (see lib/site.ts
// buildMetadata) links to explicitly and identically.
import { copyFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const src = join(process.cwd(), "out", "opengraph-image");
const dest = join(process.cwd(), "out", "og-image.png");

if (!existsSync(src)) {
  console.error(`postbuild: expected ${src} to exist, skipping copy`);
  process.exit(1);
}

copyFileSync(src, dest);
console.log(`postbuild: copied ${src} -> ${dest}`);
