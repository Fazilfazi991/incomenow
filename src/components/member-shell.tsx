"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Bookmark, CircleHelp, Compass, FolderKanban, Settings, UserRound } from "lucide-react";
import { useOptionalMemberBookmarks } from "./member-bookmark-provider";

type MemberShellProps = {
  children: React.ReactNode;
  mode: "preview" | "member";
  savedCount?: number;
  identity?: { name: string; email: string };
};

export function MemberShell({ children, mode, savedCount = 0, identity }: MemberShellProps) {
  const pathname = usePathname();
  const memberBookmarks = useOptionalMemberBookmarks();
  const isPreview = mode === "preview";
  const visibleSavedCount = isPreview ? savedCount : memberBookmarks?.count ?? savedCount;
  const primaryItems = [
    { label: "Explore Ideas", href: isPreview ? "/preview/explore" : "/app/explore", icon: Compass, key: "explore" },
    { label: "Saved Ideas", href: isPreview ? "/preview/saved" : "/app/saved", icon: Bookmark, key: "saved" },
    { label: "My Projects", href: isPreview ? "/preview/not-available?feature=projects" : "/app/projects", icon: FolderKanban, key: "projects" },
    { label: "Latest Updates", href: isPreview ? "/preview/not-available?feature=updates" : "/account/access?notice=updates", icon: Bell, key: "updates" },
  ] as const;

  const isActive = (key: string) => {
    if (key === "explore") return pathname.endsWith("/explore") || pathname.includes("/ideas/");
    return pathname.includes(`/${key}`);
  };

  const accountHref = isPreview ? "/preview/not-available?feature=account" : "/account/access";
  const supportHref = isPreview ? "/preview/not-available?feature=support" : "/account/access?notice=support";
  const homeHref = isPreview ? "/preview/explore" : "/app/explore";
  const displayName = identity?.name || "IncomeNow member";

  return (
    <div className="app-shell">
      <aside className="desktop-sidebar" aria-label="Member navigation">
        <div>
          <Link className="brand" href={homeHref} aria-label="IncomeNow home">IncomeNow<span>.in</span></Link>
          <div className="preview-pill">{isPreview ? "Local preview — sample data" : "Membership access verified"}</div>
        </div>

        <nav className="side-nav" aria-label="Main navigation">
          {primaryItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link className={isActive(item.key) ? "side-link active" : "side-link"} href={item.href} key={item.key}>
                <Icon aria-hidden="true" size={19} />
                <span>{item.label}</span>
                {item.key === "saved" && visibleSavedCount ? <span className="nav-count">{visibleSavedCount}</span> : null}
              </Link>
            );
          })}
        </nav>

        <div className="side-section">
          <p>Support & account</p>
          <Link className="side-link" href={supportHref}><CircleHelp aria-hidden="true" size={19} /><span>Help & Support</span></Link>
          <Link className="side-link" href={accountHref}><Settings aria-hidden="true" size={19} /><span>Account</span></Link>
        </div>

        <div className="member-chip" title={identity?.email}>
          <span className="avatar"><UserRound aria-hidden="true" size={17} /></span>
          <span><strong>{isPreview ? "Alex Mercer" : displayName}</strong><small>{isPreview ? "Preview member" : "Member"}</small></span>
        </div>
      </aside>

      <header className="mobile-header">
        <Link className="brand" href={homeHref}>IncomeNow<span>.in</span></Link>
        <Link className="mobile-header-actions" href={accountHref} aria-label="Open account access">
          <span className="member-label">{isPreview ? "Preview" : "Member"}</span>
          <span className="avatar"><UserRound aria-hidden="true" size={16} /></span>
        </Link>
      </header>

      <main className="app-main">{children}</main>

      <nav className="mobile-nav" aria-label="Mobile navigation">
        {primaryItems.map((item) => {
          const Icon = item.icon;
          const label = item.key === "explore" ? "Explore" : item.key === "saved" ? "Saved" : item.key === "projects" ? "Projects" : "Updates";
          return (
            <Link className={isActive(item.key) ? "mobile-link active" : "mobile-link"} href={item.href} key={item.key}>
              <span className="mobile-icon-wrap"><Icon aria-hidden="true" size={18} />{item.key === "saved" && visibleSavedCount ? <span className="mobile-count">{visibleSavedCount}</span> : null}</span>
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
