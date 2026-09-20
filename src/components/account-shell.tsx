import Link from "next/link";
import { BadgeCheck, Compass, KeyRound, Settings, UserRound } from "lucide-react";

export function AccountShell({ children, active, name, email }: {
  children: React.ReactNode;
  active: "settings" | "access";
  name: string;
  email: string;
}) {
  return (
    <div className="account-shell">
      <aside className="account-sidebar" aria-label="Account navigation">
        <Link className="brand" href="/">IncomeNow<span>.in</span></Link>
        <nav>
          <Link className={active === "settings" ? "active" : ""} href="/account/settings"><Settings size={18} /> Settings</Link>
          <Link className={active === "access" ? "active" : ""} href="/account/access"><BadgeCheck size={18} /> Membership access</Link>
          <Link href="/account/getting-started"><Compass size={18} /> Discovery preferences</Link>
        </nav>
        <div className="account-identity"><span><UserRound size={17} /></span><div><strong>{name}</strong><small>{email}</small></div></div>
      </aside>
      <header className="account-mobile-header">
        <Link className="brand" href="/">IncomeNow<span>.in</span></Link>
        <Link href="/account/settings" aria-label="Account settings"><KeyRound size={19} /></Link>
      </header>
      <main className="account-main">{children}</main>
    </div>
  );
}
