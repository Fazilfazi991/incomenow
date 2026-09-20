import Link from "next/link";
import { Check, ShieldCheck } from "lucide-react";

type AuthShellProps = {
  children: React.ReactNode;
  title: string;
  description: string;
  context: "register" | "login" | "verify" | "recovery";
};

const contextCopy = {
  register: {
    heading: "Practical ideas. A clearer starting point.",
    copy: "Create a secure account before reviewing membership access. Registration never activates paid access on its own.",
    points: ["Curated opportunity blueprints", "Structured implementation resources", "Authentication kept separate from membership"],
  },
  login: {
    heading: "Return to your blueprint library.",
    copy: "Use the sign-in method already connected to your account, then IncomeNow will check the separate membership record.",
    points: ["Verified account identity", "Server-checked membership access", "Protected idea implementation content"],
  },
  verify: {
    heading: "Secure the account before access.",
    copy: "Email verification confirms account ownership. Membership is evaluated independently after the account is verified.",
    points: ["One-time confirmation link", "Purpose-specific verification handler", "No membership granted during signup"],
  },
  recovery: {
    heading: "Recover access without shortcuts.",
    copy: "Password changes require a verified, one-time recovery context. Account existence is never disclosed by the request screen.",
    points: ["Short-lived recovery context", "Twelve-character password minimum", "Sessions cleared after password change"],
  },
};

export function AuthShell({ children, title, description, context }: AuthShellProps) {
  const content = contextCopy[context];
  const showPreviewLink = process.env.NODE_ENV !== "production";

  return (
    <div className="auth-page">
      <header className="auth-header">
        <Link className="auth-brand" href="/login">IncomeNow<span>.in</span></Link>
        <div className="auth-header-state"><ShieldCheck size={15} /> Account and membership are separate</div>
        {showPreviewLink ? <Link className="auth-header-link" href="/preview/explore">Local preview</Link> : <span />}
      </header>

      <main className="auth-main">
        <aside className="auth-context" aria-label="IncomeNow account context">
          <h2>{content.heading}</h2>
          <p>{content.copy}</p>
          <ul>
            {content.points.map((point) => <li key={point}><Check size={17} aria-hidden="true" />{point}</li>)}
          </ul>
          <div className="auth-context-sample">
            <span>Access sequence</span>
            <ol><li>Account</li><li>Verification</li><li>Membership check</li></ol>
          </div>
        </aside>

        <section className="auth-workspace" aria-labelledby="auth-page-title">
          <div className="auth-mobile-mark"><ShieldCheck size={24} /></div>
          <div className="auth-card">
            <div className="auth-card-heading">
              <h1 id="auth-page-title">{title}</h1>
              <p>{description}</p>
              <p className="auth-mobile-separation"><ShieldCheck size={15} /> Account identity comes first. Membership access is checked separately.</p>
            </div>
            {children}
          </div>
        </section>
      </main>

      <footer className="auth-footer">
        <span>Terms</span><span>Privacy</span><span>Support</span>
        <span>© IncomeNow.in</span>
      </footer>
    </div>
  );
}

export function GoogleMark() {
  return (
    <svg aria-hidden="true" className="google-mark" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M21.35 12.18c0-.73-.07-1.43-.19-2.1H12v3.97h5.24a4.48 4.48 0 0 1-1.94 2.94v2.58h3.14c1.84-1.69 2.91-4.18 2.91-7.39Z" />
      <path fill="#34A853" d="M12 21.68c2.62 0 4.82-.87 6.43-2.36l-3.14-2.58c-.87.58-1.98.93-3.29.93-2.53 0-4.67-1.71-5.44-4.01H3.31v2.66A9.71 9.71 0 0 0 12 21.68Z" />
      <path fill="#FBBC05" d="M6.56 13.66A5.84 5.84 0 0 1 6.25 12c0-.58.1-1.14.31-1.66V7.68H3.31A9.68 9.68 0 0 0 2.28 12c0 1.56.37 3.03 1.03 4.32l3.25-2.66Z" />
      <path fill="#EA4335" d="M12 6.33c1.42 0 2.7.49 3.71 1.45l2.78-2.78A9.32 9.32 0 0 0 12 2.32a9.71 9.71 0 0 0-8.69 5.36l3.25 2.66c.77-2.3 2.91-4.01 5.44-4.01Z" />
    </svg>
  );
}
