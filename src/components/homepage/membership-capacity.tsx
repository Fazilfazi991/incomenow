import type { MembershipStats } from "@/lib/membership-capacity";
import { ArrowUpRight, LockKeyhole } from "lucide-react";

export function MembershipCapacity({ stats }: { stats: MembershipStats }) {
  const known = stats.active !== null;
  const circumference = 2 * Math.PI * 113;
  return (
    <div className="vault-capacity" aria-label="IncomeNow membership capacity">
      <div className="vault-capacity-heading"><span><LockKeyhole size={15} aria-hidden="true" /> INCOMENOW ACCESS</span><span className="vault-status">{stats.source === "demo" ? "DESIGN PREVIEW" : stats.allocation === "full" ? "AT CAPACITY" : "LIMITED MEMBERSHIP"}</span></div>
      <div className="vault-capacity-dial">
        <svg viewBox="0 0 280 280" aria-hidden="true">
          <circle cx="140" cy="140" r="137" className="vault-dial-boundary" />
          <circle cx="140" cy="140" r="124" className="vault-dial-ticks" />
          <circle cx="140" cy="140" r="113" className="vault-dial-track" />
          {known && <circle cx="140" cy="140" r="113" className="vault-dial-fill" strokeDasharray={`${(stats.active! / stats.capacity) * circumference} ${circumference}`} transform="rotate(-90 140 140)" />}
        </svg>
        <div className="vault-dial-value"><strong>{known ? stats.active : stats.capacity}</strong><span>{known ? `/ ${stats.capacity} active` : "active members maximum"}</span></div>
      </div>
      <div className="vault-capacity-caption"><span className="vault-square" />{stats.source === "demo" ? "Demo count. Not real member activity." : known ? "Verified active membership count." : "Occupancy count not published."}</div>
      <div className="vault-capacity-foot"><span>One membership. A world of possibilities.</span><a href="#membership-model" aria-label={`Read about the ${stats.capacity}-member model`}><ArrowUpRight size={20} aria-hidden="true" /></a></div>
    </div>
  );
}
