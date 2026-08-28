import { buildMetadata } from "@/lib/site";
import RockPaperScissors from "@/components/RockPaperScissors";

export const metadata = buildMetadata({
  title: "Rock Paper Scissors — DeciderSpin",
  description:
    "Play Rock Paper Scissors against the computer, or pass the device and play with a friend. Best two of three? Just pick one and let fate decide.",
  path: "/rock-paper-scissors/",
});

export default function RockPaperScissorsPage() {
  return <RockPaperScissors />;
}
