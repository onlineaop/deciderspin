"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";

export default function SiteChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex flex-col">
      <Header pathname={pathname} />
      <main className="flex-1 flex flex-col">{children}</main>
      <Footer />
    </div>
  );
}
