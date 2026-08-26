import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/site";
import Wheel from "@/components/Wheel";

export const metadata: Metadata = {
  title: "Spin the Wheel — DeciderSpin",
  description:
    "Can't decide? Use Decider Spin, the ultimate free random choice generator. Customize your wheel for food, games, or chores and let fate decide instantly!",
  alternates: { canonical: absoluteUrl("/") },
};

export default function HomePage() {
  return <Wheel />;
}
