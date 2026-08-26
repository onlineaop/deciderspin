import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/site";
import RockPaperScissors from "@/components/RockPaperScissors";

export const metadata: Metadata = {
  title: "Rock Paper Scissors — DeciderSpin",
  description:
    "Play Rock Paper Scissors against DeciderSpin. Best two of three? Just pick one and let fate decide.",
  alternates: { canonical: absoluteUrl("/rock-paper-scissors/") },
};

export default function RockPaperScissorsPage() {
  return <RockPaperScissors />;
}
