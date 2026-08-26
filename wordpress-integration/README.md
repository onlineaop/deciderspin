# WordPress integration (reference copies, not deployed by this repo)

deciderspin.com's static export deploys onto the same shared hosting that
used to run the site's WordPress install. WordPress itself isn't retired at
the infrastructure level — it stays installed and running, but purely as a
small backend for two things Apache/the static files can't do on their own:

- **`deciderspin-contact.php`** — registers `POST /wp-json/deciderspin/v1/contact`,
  which `components/ContactForm.tsx` posts to. A static export has no server
  to run a Next.js Server Action against, so this replaces that.
- **`deciderspin-homepage-passthrough.php`** — the document root has both
  WordPress's `index.php` and the exported `index.html` side by side, and
  the hosting's default `DirectoryIndex` order serves `index.php` first.
  This hooks `template_redirect` to transparently serve `index.html`'s
  bytes for `/` before WordPress/Elementor ever renders anything.

Both files are deployed to `wp-content/novamira-sandbox/` on the server
(auto-loaded on every WordPress request) — not by pushing this repo, since
Novamira (the WP management tool used to set this up) only allows PHP
writes inside that sandbox directory. These are reference copies for
version control; if either needs to change, edit here and re-deploy to the
same sandbox path.

Every other route (`/8ball/`, `/contact/`, `/privacy-policy/`,
`/terms-of-service/`) needs neither trick — those directories have no
competing WordPress `index.php`, so the exported `index.html` there wins
automatically, no passthrough required.
