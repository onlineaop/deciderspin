import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/site";
import RandomNumber from "@/components/RandomNumber";

export const metadata: Metadata = {
  title: "Random Number Generator — DeciderSpin",
  description:
    "Generate a random number in any range. Set a min and max and let DeciderSpin pick instantly.",
  alternates: { canonical: absoluteUrl("/random-number/") },
};

export default function RandomNumberPage() {
  return <RandomNumber />;
}
