import Link from "next/link";
import Image from "next/image";

const NAV_LINKS = [
  { label: "Spin the Wheel", href: "/", icon: "🎡" },
  { label: "Magic 8 Ball", href: "/8ball/", icon: "🎱" },
];

function isActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname === href.replace(/\/$/, "");
}

export default function Header({ pathname }: { pathname: string | null }) {
  return (
    <header className="w-full">
      <div className="max-w-5xl mx-auto px-6 py-5 flex flex-wrap items-center justify-between gap-4">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.png"
            alt="deciderspin.com"
            width={800}
            height={200}
            priority
            className="h-9 w-auto"
          />
        </Link>
        <nav className="flex items-center gap-2 text-sm flex-wrap">
          {NAV_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={
                "inline-flex items-center gap-2 px-4 py-2 rounded-full border font-semibold transition-colors " +
                (isActive(pathname, item.href)
                  ? "bg-white/15 border-white/35 opacity-100"
                  : "bg-card border-card-border opacity-85 hover:opacity-100 hover:bg-white/10")
              }
            >
              <span aria-hidden="true">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
