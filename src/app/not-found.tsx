import Link from "next/link";

export default function NotFound() {
  return (
    <main className="standalone-state">
      <div className="preview-pill">IncomeNow</div>
      <h1>This page is not available</h1>
      <p>The address may be incorrect, or this preview route may be disabled.</p>
      <Link className="primary-button" href="/preview/explore">Go to Explore ideas</Link>
    </main>
  );
}

