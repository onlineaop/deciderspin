import { buildMetadata } from "@/lib/site";
import Wheel from "@/components/Wheel";

export const metadata = buildMetadata({
  title: "Spin the Wheel — DeciderSpin",
  description:
    "Can't decide? Use Decider Spin, the ultimate free random choice generator. Customize your wheel for food, games, or chores and let fate decide instantly!",
  path: "/",
});

export default function HomePage() {
  return <Wheel />;
}
