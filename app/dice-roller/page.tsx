import { buildMetadata } from "@/lib/site";
import DiceRoller from "@/components/DiceRoller";

export const metadata = buildMetadata({
  title: "Dice Roller — DeciderSpin",
  description:
    "Roll up to four dice online. Tap to throw and let DeciderSpin decide — great for board games, road trips, or Jet Lag: The Game challenges.",
  path: "/dice-roller/",
});

export default function DiceRollerPage() {
  return <DiceRoller />;
}
