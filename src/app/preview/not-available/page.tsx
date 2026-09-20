import Link from "next/link";
import { ArrowLeft, Construction } from "lucide-react";

const labels: Record<string, string> = {
  projects: "My Projects",
  updates: "Latest Updates",
  support: "Help & Support",
  account: "Account settings",
};

export default async function NotAvailablePage({ searchParams }: { searchParams: Promise<{ feature?: string }> }) {
  const { feature = "feature" } = await searchParams;
  const label = labels[feature] ?? "This feature";
  return (
    <div className="standalone-state in-shell">
      <Construction aria-hidden="true" size={32} />
      <h1>{label} is not available in this build yet</h1>
      <p>Phase 1 is limited to exploring ideas, reviewing the three sample details, and managing a device-local shortlist.</p>
      <Link className="primary-button" href="/preview/explore"><ArrowLeft size={16} /> Return to Explore ideas</Link>
    </div>
  );
}

