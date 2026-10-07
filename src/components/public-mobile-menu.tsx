"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useRef, useState } from "react";

export function PublicMobileMenu({ root, children, opportunityLabel = "Example ideas" }: { root: string; children: React.ReactNode; opportunityLabel?: string }) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const [open, setOpen] = useState(false);

  const close = () => {
    if (detailsRef.current) detailsRef.current.open = false;
    setOpen(false);
  };

  return (
    <details ref={detailsRef} className="public-mobile-menu" onToggle={(event) => setOpen(event.currentTarget.open)}>
      <summary aria-label={open ? "Close navigation" : "Open navigation"}>
        {open ? <X aria-hidden="true" size={22} /> : <Menu aria-hidden="true" size={22} />}
      </summary>
      <div>
        <nav aria-label="Mobile navigation">
          <Link href={`${root}#how-it-works`} onClick={close}>How it works</Link>
          <Link href={`${root}#example-ideas`} onClick={close}>{opportunityLabel}</Link>
          <Link href="/membership" onClick={close}>Membership</Link>
          <Link href={`${root}#faq`} onClick={close}>FAQ</Link>
        </nav>
        {children}
      </div>
    </details>
  );
}
