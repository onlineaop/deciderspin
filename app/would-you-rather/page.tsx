import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/site";
import WouldYouRather from "@/components/WouldYouRather";

export const metadata: Metadata = {
  title: "Would You Rather — DeciderSpin",
  description:
    "Play Would You Rather online — pick between two silly, family-friendly choices and see what you'd do.",
  alternates: { canonical: absoluteUrl("/would-you-rather/") },
};

export default function WouldYouRatherPage() {
  return <WouldYouRather />;
}
