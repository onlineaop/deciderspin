import { buildMetadata } from "@/lib/site";
import TeamPicker from "@/components/TeamPicker";

export const metadata = buildMetadata({
  title: "Team Picker — DeciderSpin",
  description:
    "Split a list of names into fair random teams. Add everyone, pick a number of teams, and shuffle instantly.",
  path: "/team-picker/",
});

export default function TeamPickerPage() {
  return <TeamPicker />;
}
