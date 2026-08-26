import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/site";
import TeamPicker from "@/components/TeamPicker";

export const metadata: Metadata = {
  title: "Team Picker — DeciderSpin",
  description:
    "Split a list of names into fair random teams. Add everyone, pick a number of teams, and shuffle instantly.",
  alternates: { canonical: absoluteUrl("/team-picker/") },
};

export default function TeamPickerPage() {
  return <TeamPicker />;
}
