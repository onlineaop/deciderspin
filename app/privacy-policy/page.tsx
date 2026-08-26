import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy — DeciderSpin",
  description: "How DeciderSpin collects and uses information.",
  alternates: { canonical: absoluteUrl("/privacy-policy/") },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="w-full max-w-2xl mx-auto px-6 py-16">
      <h1 className="text-4xl md:text-5xl font-extrabold mb-8">
        Privacy &amp; Data Usage
      </h1>

      <div className="space-y-4 text-sm leading-relaxed text-text/90">
        <p>
          <strong>International Compliance:</strong> We strive to respect{" "}
          <strong>GDPR</strong>, <strong>CCPA</strong>, and{" "}
          <strong>POPIA</strong> standards by minimizing data collection to
          the absolute zero required to run the app.
        </p>
        <p>
          <strong>User Input:</strong> We do not see, store, or collect the
          text you type into the wheel. All inputs are processed locally in
          your browser. Once you refresh or close the page, your data is
          gone.
        </p>
        <p>
          <strong>No Personal Data:</strong> We do not require account
          registration or collect names, emails, or phone numbers.
        </p>
        <p>
          <strong>Cookies &amp; Analytics:</strong> We may use basic cookies
          or anonymous analytics (like Google Analytics) to see how many
          people visit the site. This helps us keep the lights on.
        </p>
      </div>
    </div>
  );
}
