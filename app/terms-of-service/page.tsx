import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Service — DeciderSpin",
  description: "The terms of use for DeciderSpin.",
  alternates: { canonical: absoluteUrl("/terms-of-service/") },
};

export default function TermsOfServicePage() {
  return (
    <div className="w-full max-w-2xl mx-auto px-6 py-16">
      <h1 className="text-4xl md:text-5xl font-extrabold mb-8">
        Usage Rules
      </h1>

      <ul className="space-y-3 text-sm leading-relaxed text-text/90 list-disc pl-5">
        <li>
          <strong>Age Limit:</strong> This site is intended for users aged 13
          and up.
        </li>
        <li>
          <strong>Prohibited Use:</strong> You may not use this tool for
          illegal gambling, wagering, or to generate harmful/hateful content.
        </li>
        <li>
          <strong>No Warranty:</strong> We provide this tool &quot;as is.&quot;
          While we hope it&apos;s helpful, we don&apos;t guarantee it will be
          online 100% of the time or that the randomness is &quot;mathematically
          perfect&quot; for scientific use.
        </li>
      </ul>
    </div>
  );
}
