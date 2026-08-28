import { buildMetadata } from "@/lib/site";
import CoinFlip from "@/components/CoinFlip";

export const metadata = buildMetadata({
  title: "Coin Flip — DeciderSpin",
  description:
    "Flip a coin online. Heads or tails — tap to flip and let DeciderSpin decide instantly.",
  path: "/coin-flip/",
});

export default function CoinFlipPage() {
  return <CoinFlip />;
}
