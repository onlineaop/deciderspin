import { buildMetadata } from "@/lib/site";
import TeamPicker from "@/components/TeamPicker";

export const metadata = buildMetadata({
  title: "Team Picker — DeciderSpin",
  description:
    "Split a list of names into fair random teams. Add everyone and shuffle instantly — handy for splitting into teams for Jet Lag: The Game or any group game night.",
  path: "/team-picker/",
});

export default function TeamPickerPage() {
  return <TeamPicker />;
}
