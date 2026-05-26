import type { Metadata } from "next";
import { LumaLearnApp } from "@/features/luma-learn/LumaLearnApp";

export const metadata: Metadata = {
  title: "gamified-path-version | UI Templates",
  description:
    "A minimal placeholder-only learning app UI with a gamified path, light progression systems, and original styling.",
};

export default function HomePage() {
  return (
    <div className="-mx-4 -my-6 sm:-mx-6 lg:-mx-8">
      <LumaLearnApp />
    </div>
  );
}
