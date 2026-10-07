export type RacePreset = "today" | "yesterday" | "7d" | "30d" | "month" | "all" | "custom";
export type RaceBucket = "hour" | "day";
export type RankingMetric = "net_revenue_cents" | "unique_visitors" | "registrations" | "starter_sales" | "membership_sales" | "visitor_to_starter" | "visitor_to_membership" | "revenue_per_visitor";

export type RaceTeam = {
  source_id: string;
  source_key: string;
  display_name: string;
  team_member_name: string;
  domain: string | null;
  active: boolean;
  unique_visitors: number;
  sessions: number;
  pageviews: number;
  registrations: number;
  starter_sales: number;
  membership_sales: number;
  gross_revenue_cents: number;
  refund_cents: number;
  net_revenue_cents: number;
};

export type RaceSeriesPoint = {
  bucket: string;
  source_id: string | null;
  visitors: number;
  registrations: number;
  starter_sales: number;
  membership_sales: number;
  revenue_cents: number;
};

export type RaceData = {
  generated_at: string;
  start_at: string;
  end_at: string;
  bucket: RaceBucket;
  teams: RaceTeam[];
  unattributed: Omit<RaceTeam, "source_id" | "team_member_name" | "domain" | "active">;
  series: RaceSeriesPoint[];
  activity: Array<{ occurred_at: string; source_id: string | null; label: string }>;
};

export type RaceWindow = { startAt: string | null; endAt: string; bucket: RaceBucket };

const DUBAI_OFFSET_MS = 4 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

function dubaiDayStart(now: Date) {
  const shifted = new Date(now.getTime() + DUBAI_OFFSET_MS);
  return Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate()) - DUBAI_OFFSET_MS;
}

export function resolveRaceWindow(preset: RacePreset, now = new Date(), customStart?: string, customEnd?: string): RaceWindow {
  const endAt = now.toISOString();
  const today = dubaiDayStart(now);
  if (preset === "all") return { startAt: null, endAt, bucket: "day" };
  if (preset === "today") return { startAt: new Date(today).toISOString(), endAt, bucket: "hour" };
  if (preset === "yesterday") return { startAt: new Date(today - DAY_MS).toISOString(), endAt: new Date(today).toISOString(), bucket: "hour" };
  if (preset === "7d") return { startAt: new Date(today - 6 * DAY_MS).toISOString(), endAt, bucket: "day" };
  if (preset === "30d") return { startAt: new Date(today - 29 * DAY_MS).toISOString(), endAt, bucket: "day" };
  if (preset === "month") {
    const shifted = new Date(now.getTime() + DUBAI_OFFSET_MS);
    const start = Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), 1) - DUBAI_OFFSET_MS;
    return { startAt: new Date(start).toISOString(), endAt, bucket: "day" };
  }
  if (!customStart || !customEnd || !/^\d{4}-\d{2}-\d{2}$/.test(customStart) || !/^\d{4}-\d{2}-\d{2}$/.test(customEnd)) {
    throw new Error("A valid custom range is required.");
  }
  const start = Date.parse(`${customStart}T00:00:00+04:00`);
  const end = Date.parse(`${customEnd}T00:00:00+04:00`) + DAY_MS;
  if (!Number.isFinite(start) || !Number.isFinite(end) || start >= end) throw new Error("The custom range is invalid.");
  const boundedEnd = Math.min(end, now.getTime());
  if (start >= boundedEnd) throw new Error("The custom range cannot start in the future.");
  return { startAt: new Date(start).toISOString(), endAt: new Date(boundedEnd).toISOString(), bucket: end - start <= DAY_MS ? "hour" : "day" };
}

export function safeRate(numerator: number, denominator: number) {
  return denominator > 0 ? numerator / denominator : 0;
}

export function rankingValue(team: RaceTeam, metric: RankingMetric) {
  if (metric === "visitor_to_starter") return safeRate(team.starter_sales, team.unique_visitors);
  if (metric === "visitor_to_membership") return safeRate(team.membership_sales, team.unique_visitors);
  if (metric === "revenue_per_visitor") return team.unique_visitors ? team.net_revenue_cents / team.unique_visitors : 0;
  return team[metric];
}

export function rankRaceTeams(teams: RaceTeam[], metric: RankingMetric) {
  return [...teams].sort((a, b) => rankingValue(b, metric) - rankingValue(a, metric) || a.display_name.localeCompare(b.display_name));
}
