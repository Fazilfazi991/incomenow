"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Activity, CalendarDays, RefreshCw, ShieldCheck, Trophy, Users } from "lucide-react";
import {
  rankRaceTeams,
  resolveRaceWindow,
  safeRate,
  type RaceData,
  type RacePreset,
  type RaceSeriesPoint,
  type RaceTeam,
  type RankingMetric,
} from "@/lib/acquisition-race";

const dateOptions: Array<{ value: RacePreset; label: string }> = [
  { value: "today", label: "Today" }, { value: "yesterday", label: "Yesterday" },
  { value: "7d", label: "7 Days" }, { value: "30d", label: "30 Days" },
  { value: "month", label: "This Month" }, { value: "all", label: "All Time" },
];

const rankingOptions: Array<{ value: RankingMetric; label: string }> = [
  { value: "net_revenue_cents", label: "Net Revenue" },
  { value: "unique_visitors", label: "Unique Visitors" },
  { value: "registrations", label: "Registrations" },
  { value: "starter_sales", label: "$1 Sales" },
  { value: "membership_sales", label: "$29 Sales" },
  { value: "visitor_to_starter", label: "Visitor → $1" },
  { value: "visitor_to_membership", label: "Visitor → $29" },
  { value: "revenue_per_visitor", label: "Revenue / Visitor" },
];

type ChartMetric = "visitors" | "registrations" | "starter_sales" | "membership_sales" | "revenue_cents";
const chartOptions: Array<{ value: ChartMetric; label: string }> = [
  { value: "visitors", label: "Visitors" }, { value: "registrations", label: "Registrations" },
  { value: "starter_sales", label: "$1 Sales" }, { value: "membership_sales", label: "$29 Sales" },
  { value: "revenue_cents", label: "Revenue" },
];
const teamLineClasses = ["race-line-a", "race-line-b", "race-line-c", "race-line-d"];

function money(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: cents % 100 ? 2 : 0 }).format(cents / 100);
}

function percent(value: number) {
  return new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 1 }).format(value);
}

function integer(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function rankingDisplay(team: RaceTeam, metric: RankingMetric) {
  if (metric === "net_revenue_cents") return money(team.net_revenue_cents);
  if (metric === "visitor_to_starter") return percent(safeRate(team.starter_sales, team.unique_visitors));
  if (metric === "visitor_to_membership") return percent(safeRate(team.membership_sales, team.unique_visitors));
  if (metric === "revenue_per_visitor") return money(team.unique_visitors ? team.net_revenue_cents / team.unique_visitors : 0);
  return integer(team[metric]);
}

function LeaderCard({ team, rank, metric }: { team: RaceTeam; rank: number; metric: RankingMetric }) {
  return (
    <article className={`race-leader-card rank-${rank + 1}`}>
      <div className="race-rank"><span>{rank + 1}</span><div><strong>{team.display_name}</strong><small>{team.team_member_name}</small></div></div>
      <div className="race-winning-metric"><span>{rankingOptions.find((item) => item.value === metric)?.label}</span><strong>{rankingDisplay(team, metric)}</strong></div>
      <dl>
        <div><dt>Visitors</dt><dd>{integer(team.unique_visitors)}</dd></div>
        <div><dt>$1 sales</dt><dd>{integer(team.starter_sales)}</dd></div>
        <div><dt>$29 sales</dt><dd>{integer(team.membership_sales)}</dd></div>
      </dl>
      <p className="race-source-state"><i className={team.domain ? "ready" : "pending"} />{team.domain ?? "Domain pending"}</p>
    </article>
  );
}

function RaceChart({ teams, points, metric }: { teams: RaceTeam[]; points: RaceSeriesPoint[]; metric: ChartMetric }) {
  const buckets = [...new Set(points.map((point) => point.bucket))].sort();
  if (!buckets.length) return <div className="race-empty-chart"><Activity aria-hidden="true" /><strong>No trend data yet</strong><span>New anonymous events will appear here after tracking begins.</span></div>;
  const width = 760;
  const height = 250;
  const padding = { top: 20, right: 18, bottom: 38, left: 46 };
  const values = points.map((point) => point[metric]);
  const max = Math.max(1, ...values);
  const min = Math.min(0, ...values);
  const range = Math.max(1, max - min);
  const x = (index: number) => padding.left + (buckets.length === 1 ? (width - padding.left - padding.right) / 2 : index * (width - padding.left - padding.right) / (buckets.length - 1));
  const y = (value: number) => padding.top + (height - padding.top - padding.bottom) * (1 - (value - min) / range);
  const pointFor = (sourceId: string, bucket: string) => points.find((point) => point.source_id === sourceId && point.bucket === bucket)?.[metric] ?? 0;
  const formatAxis = (value: number) => metric === "revenue_cents" ? money(value) : integer(value);
  const label = (bucket: string) => new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", ...(buckets.length <= 24 ? { hour: "numeric" as const } : {}) }).format(new Date(bucket));
  const labelIndexes = [...new Set([0, Math.floor((buckets.length - 1) / 2), buckets.length - 1])];

  return (
    <div className="race-chart-wrap">
      <svg className="race-chart" role="img" aria-label={`${chartOptions.find((item) => item.value === metric)?.label} by team over time`} viewBox={`0 0 ${width} ${height}`}>
        {[0, .25, .5, .75, 1].map((ratio) => {
          const axisValue = min + range * ratio;
          const gridY = y(axisValue);
          return <g key={ratio}><line x1={padding.left} x2={width - padding.right} y1={gridY} y2={gridY} /><text x={padding.left - 9} y={gridY + 4} textAnchor="end">{formatAxis(Math.round(axisValue))}</text></g>;
        })}
        {teams.map((team, teamIndex) => {
          const path = buckets.map((bucket, index) => `${index ? "L" : "M"}${x(index)},${y(pointFor(team.source_id, bucket))}`).join(" ");
          return <path className={teamLineClasses[teamIndex % teamLineClasses.length]} d={path} fill="none" key={team.source_id} />;
        })}
        {labelIndexes.map((index) => <text className="race-axis-label" key={index} x={x(index)} y={height - 10} textAnchor={index === 0 ? "start" : index === buckets.length - 1 ? "end" : "middle"}>{label(buckets[index])}</text>)}
      </svg>
    </div>
  );
}

export function RaceDashboard({ initialData, autoRefresh = true }: { initialData: RaceData; autoRefresh?: boolean }) {
  const [data, setData] = useState(initialData);
  const [preset, setPreset] = useState<RacePreset>("today");
  const [ranking, setRanking] = useState<RankingMetric>("net_revenue_cents");
  const [chartMetric, setChartMetric] = useState<ChartMetric>("revenue_cents");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (nextPreset = preset, start = customStart, end = customEnd) => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({ range: nextPreset });
    if (nextPreset === "custom") { params.set("start", start); params.set("end", end); }
    try {
      const response = await fetch(`/api/admin/race?${params}`, { cache: "no-store" });
      if (!response.ok) throw new Error("Race data could not be refreshed.");
      setData(await response.json() as RaceData);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Race data could not be refreshed.");
    } finally {
      setLoading(false);
    }
  }, [customEnd, customStart, preset]);

  useEffect(() => {
    if (!autoRefresh) return;
    const timer = window.setInterval(() => void load(), 45_000);
    return () => window.clearInterval(timer);
  }, [autoRefresh, load]);

  const ranked = useMemo(() => rankRaceTeams(data.teams, ranking), [data.teams, ranking]);
  const sourceNames = useMemo(() => new Map(data.teams.map((team) => [team.source_id, team.display_name])), [data.teams]);
  const totalVisitors = data.teams.reduce((sum, team) => sum + team.unique_visitors, 0) + data.unattributed.unique_visitors;
  const generated = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: "Asia/Dubai", timeZoneName: "short" }).format(new Date(data.generated_at));

  function choosePreset(value: RacePreset) {
    setPreset(value);
    void load(value);
  }

  function submitCustom(event: React.FormEvent) {
    event.preventDefault();
    try { resolveRaceWindow("custom", new Date(), customStart, customEnd); }
    catch { setError("Choose a valid custom date range."); return; }
    setPreset("custom");
    void load("custom", customStart, customEnd);
  }

  return (
    <main className="race-page">
      <nav className="race-nav" aria-label="Admin navigation"><Link className="brand" href="/">IncomeNow<span>.in</span></Link><div><span>Admin</span><Link href="/app/explore">Member library</Link><Link href="/account/settings">Account</Link></div></nav>
      <header className="race-header">
        <div><span className="race-eyebrow"><Trophy aria-hidden="true" size={14} /> Internal acquisition scoreboard</span><h1>IncomeNow Team Race</h1><p>First-touch traffic, registrations, confirmed payments, and refunds from the IncomeNow database.</p></div>
        <div className="race-freshness"><span><i /> Updated {generated}</span><button type="button" onClick={() => void load()} disabled={loading}><RefreshCw aria-hidden="true" size={15} className={loading ? "spin" : ""} /> Refresh</button></div>
      </header>

      <section className="race-controls" aria-label="Race filters">
        <div className="race-date-tabs">{dateOptions.map((option) => <button type="button" className={preset === option.value ? "active" : ""} onClick={() => choosePreset(option.value)} key={option.value}>{option.label}</button>)}</div>
        <form className="race-custom-range" onSubmit={submitCustom}><CalendarDays aria-hidden="true" size={16} /><label><span className="sr-only">Custom start date</span><input type="date" value={customStart} onChange={(event) => setCustomStart(event.target.value)} /></label><span>to</span><label><span className="sr-only">Custom end date</span><input type="date" value={customEnd} onChange={(event) => setCustomEnd(event.target.value)} /></label><button type="submit">Apply</button></form>
      </section>
      {error ? <p className="race-error" role="alert">{error}</p> : null}

      <section className="race-leaderboard" aria-labelledby="leaderboard-title">
        <div className="race-section-heading"><div><span>Live standing</span><h2 id="leaderboard-title">Leaderboard</h2></div><label>Rank by<select value={ranking} onChange={(event) => setRanking(event.target.value as RankingMetric)}>{rankingOptions.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}</select></label></div>
        <div className="race-leader-grid">{ranked.map((team, index) => <LeaderCard team={team} rank={index} metric={ranking} key={team.source_id} />)}</div>
      </section>

      <section className="race-reconcile" aria-label="Traffic reconciliation">
        <div><Users aria-hidden="true" /><span>Total unique visitors<strong>{integer(totalVisitors)}</strong></span></div>
        <dl>{data.teams.map((team) => <div key={team.source_id}><dt>{team.display_name}</dt><dd>{integer(team.unique_visitors)}</dd></div>)}<div className="unattributed"><dt>Direct / Other</dt><dd>{integer(data.unattributed.unique_visitors)}</dd></div></dl>
      </section>

      <section className="race-panel" aria-labelledby="comparison-title">
        <div className="race-section-heading"><div><span>Funnel evidence</span><h2 id="comparison-title">Team comparison</h2></div><small>Event-window totals · US dollars</small></div>
        <div className="race-table-scroll"><table><thead><tr><th>Team</th><th>Unique visitors</th><th>Registrations</th><th>$1 sales</th><th>$29 sales</th><th>Gross revenue</th><th>Refunds</th><th>Net revenue</th><th>Visitor → $1</th><th>$1 → $29</th></tr></thead><tbody>{data.teams.map((team) => <tr key={team.source_id}><th><strong>{team.display_name}</strong><span>{team.team_member_name}</span></th><td>{integer(team.unique_visitors)}</td><td>{integer(team.registrations)}</td><td>{integer(team.starter_sales)}</td><td>{integer(team.membership_sales)}</td><td>{money(team.gross_revenue_cents)}</td><td>{money(team.refund_cents)}</td><td className="revenue">{money(team.net_revenue_cents)}</td><td>{percent(safeRate(team.starter_sales, team.unique_visitors))}</td><td>{percent(safeRate(team.membership_sales, team.starter_sales))}</td></tr>)}</tbody></table></div>
        <div className="race-efficiency-grid">{data.teams.map((team) => <article key={team.source_id}><h3>{team.display_name} efficiency</h3><dl><div><dt>Visitor → registration</dt><dd>{percent(safeRate(team.registrations, team.unique_visitors))}</dd></div><div><dt>Visitor → $1</dt><dd>{percent(safeRate(team.starter_sales, team.unique_visitors))}</dd></div><div><dt>Registration → $1</dt><dd>{percent(safeRate(team.starter_sales, team.registrations))}</dd></div><div><dt>$1 → $29</dt><dd>{percent(safeRate(team.membership_sales, team.starter_sales))}</dd></div><div><dt>Visitor → $29</dt><dd>{percent(safeRate(team.membership_sales, team.unique_visitors))}</dd></div><div><dt>Revenue / visitor</dt><dd>{money(team.unique_visitors ? team.net_revenue_cents / team.unique_visitors : 0)}</dd></div><div><dt>Revenue / registered</dt><dd>{money(team.registrations ? team.net_revenue_cents / team.registrations : 0)}</dd></div></dl></article>)}</div>
      </section>

      <div className="race-lower-grid">
        <section className="race-panel race-trend" aria-labelledby="trend-title"><div className="race-section-heading"><div><span>{data.bucket === "hour" ? "Hourly pace" : "Daily pace"}</span><h2 id="trend-title">Competition trend</h2></div><label><span className="sr-only">Chart metric</span><select value={chartMetric} onChange={(event) => setChartMetric(event.target.value as ChartMetric)}>{chartOptions.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}</select></label></div><div className="race-chart-legend">{data.teams.map((team, index) => <span key={team.source_id}><i className={teamLineClasses[index % teamLineClasses.length]} />{team.display_name}</span>)}</div><RaceChart teams={data.teams} points={data.series} metric={chartMetric} /></section>
        <aside className="race-panel race-activity" aria-labelledby="activity-title"><div className="race-section-heading"><div><span>Anonymous events</span><h2 id="activity-title">Recent activity</h2></div><ShieldCheck aria-hidden="true" size={18} /></div>{data.activity.length ? <ol>{data.activity.map((item, index) => <li key={`${item.occurred_at}-${index}`}><time>{new Intl.DateTimeFormat("en-US", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Dubai" }).format(new Date(item.occurred_at))}</time><span><strong>{item.source_id ? sourceNames.get(item.source_id) ?? "Unknown source" : "Direct / Other"}</strong>{item.label}</span></li>)}</ol> : <div className="race-empty-activity"><Activity aria-hidden="true" /><p>No activity in this range.</p></div>}</aside>
      </div>
    </main>
  );
}
