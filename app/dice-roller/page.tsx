import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/site";
import DiceRoller from "@/components/DiceRoller";

export const metadata: Metadata = {
  title: "Dice Roller — DeciderSpin",
  description:
    "Roll up to four dice online. Tap to throw and let DeciderSpin decide the numbers.",
  alternates: { canonical: absoluteUrl("/dice-roller/") },
};

export default function DiceRollerPage() {
  return <DiceRoller />;
}
