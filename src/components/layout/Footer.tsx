import { Heading9, Caption } from "@/components/ui/typography";

export default function Footer() {
  return (
    <footer className="border-t border-primary bg-surface-level-1 px-6 py-8">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
        <Heading9 className="text-primary">TrialMatch</Heading9>
        <Caption className="text-tertiary">
          AUBG Hackathon 2026 — Clinical Trial Site Matching MVP
        </Caption>
      </div>
    </footer>
  );
}
