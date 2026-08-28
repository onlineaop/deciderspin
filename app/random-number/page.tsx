import { buildMetadata } from "@/lib/site";
import RandomNumber from "@/components/RandomNumber";

export const metadata = buildMetadata({
  title: "Random Number Generator — DeciderSpin",
  description:
    "Generate a random number in any range. Set a min and max and let DeciderSpin pick instantly.",
  path: "/random-number/",
});

export default function RandomNumberPage() {
  return <RandomNumber />;
}
