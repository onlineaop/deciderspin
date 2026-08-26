import Link from "next/link";

const FOOTER_LINKS = [
  { label: "Home", href: "/" },
  { label: "Contact", href: "/contact/" },
  { label: "Terms of Service", href: "/terms-of-service/" },
  { label: "Privacy Policy", href: "/privacy-policy/" },
];

export default function Footer() {
  return (
    <footer className="w-full mt-auto">
      <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col items-center gap-4 text-sm text-text-muted">
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          {FOOTER_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hover:text-text transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <p className="text-xs">
          © {new Date().getFullYear()} deciderspin.com. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
