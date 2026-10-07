import { describe, expect, it } from "vitest";
import { rankRaceTeams, resolveRaceWindow, safeRate, type RaceTeam } from "./acquisition-race";

const base: RaceTeam = {
  source_id: "a", source_key: "team_a", display_name: "Team A", team_member_name: "A", domain: null, active: true,
  unique_visitors: 100, sessions: 100, pageviews: 150, registrations: 10, starter_sales: 5, membership_sales: 1,
  gross_revenue_cents: 3400, refund_cents: 0, net_revenue_cents: 3400,
};

describe("race ranges", () => {
  const now = new Date("2026-09-23T10:30:00.000Z");

  it("uses Dubai calendar boundaries for today and yesterday", () => {
    expect(resolveRaceWindow("today", now)).toEqual({ startAt: "2026-09-22T20:00:00.000Z", endAt: now.toISOString(), bucket: "hour" });
    expect(resolveRaceWindow("yesterday", now)).toEqual({ startAt: "2026-09-21T20:00:00.000Z", endAt: "2026-09-22T20:00:00.000Z", bucket: "hour" });
  });

  it("makes custom end dates inclusive by using a half-open database range", () => {
    expect(resolveRaceWindow("custom", now, "2026-09-20", "2026-09-21")).toEqual({
      startAt: "2026-09-19T20:00:00.000Z", endAt: "2026-09-21T20:00:00.000Z", bucket: "day",
    });
  });

  it("rejects reversed custom ranges", () => {
    expect(() => resolveRaceWindow("custom", now, "2026-09-22", "2026-09-20")).toThrow();
    expect(() => resolveRaceWindow("custom", now, "2026-09-24", "2026-09-25")).toThrow();
  });
});

describe("race ranking", () => {
  it("ranks dynamically by the selected metric", () => {
    const teamB = { ...base, source_id: "b", source_key: "team_b", display_name: "Team B", net_revenue_cents: 2000, unique_visitors: 300 };
    expect(rankRaceTeams([base, teamB], "net_revenue_cents").map((team) => team.source_key)).toEqual(["team_a", "team_b"]);
    expect(rankRaceTeams([base, teamB], "unique_visitors").map((team) => team.source_key)).toEqual(["team_b", "team_a"]);
  });

  it("calculates conversion without NaN or infinity", () => {
    expect(safeRate(5, 100)).toBe(.05);
    expect(safeRate(5, 0)).toBe(0);
  });
});
