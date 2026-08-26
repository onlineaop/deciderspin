import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/site";
import CoinFlip from "@/components/CoinFlip";

export const metadata: Metadata = {
  title: "Coin Flip — DeciderSpin",
  description:
    "Flip a coin online. Heads or tails — tap to flip and let DeciderSpin decide instantly.",
  alternates: { canonical: absoluteUrl("/coin-flip/") },
};

export default function CoinFlipPage() {
  return <CoinFlip />;
}
