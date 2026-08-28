import { buildMetadata } from "@/lib/site";
import EightBall from "@/components/EightBall";

export const metadata = buildMetadata({
  title: "Magic 8 Ball — DeciderSpin",
  description:
    "Ask the Magic 8 Ball a yes-or-no question and let fate decide. Tap or shake for an instant classic answer.",
  path: "/8ball/",
});

export default function EightBallPage() {
  return <EightBall />;
}
