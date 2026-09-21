"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Check, Clipboard, FileText, Mail, MessageSquareText, Phone, Presentation } from "lucide-react";
import { legacyKitHashMap, type KitActivityMeta, type KitSectionSlug } from "@/lib/kit-sections";

export function KitViewFocus({ viewKey, children }: { viewKey: string; children: React.ReactNode }) {
  const viewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const title = viewRef.current?.querySelector<HTMLElement>("[data-kit-view-title]");
    title?.focus({ preventScroll: true });
  }, [viewKey]);

  return <div className="kit-view-enter" ref={viewRef}>{children}</div>;
}

export function LegacyKitHashRedirect({ enabled = false }: { enabled?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const slug = enabled ? legacyKitHashMap[window.location.hash.slice(1)] : undefined;
    if (slug) router.replace(`${pathname}?section=${slug}`);
  }, [enabled, pathname, router]);

  return null;
}

export function KitSectionSelector({ activeSection, activities }: { activeSection: KitSectionSlug; activities: readonly KitActivityMeta[] }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <label className="kit-section-select">
      <span>Activity</span>
      <select
        aria-label="Choose a kit activity"
        value={activeSection}
        onChange={(event) => router.push(`${pathname}?section=${event.target.value}`)}
      >
        {activities.map((activity, index) => <option value={activity.slug} key={activity.slug}>{index + 1}. {activity.title}</option>)}
      </select>
    </label>
  );
}

export type SalesTemplate = {
  title: string;
  detail: string;
  kind: "email" | "call" | "follow-up" | "demo" | "proposal";
  subject?: string;
  template: string;
};

const templateIcons = {
  email: Mail,
  call: Phone,
  "follow-up": MessageSquareText,
  demo: Presentation,
  proposal: FileText,
};

export function CopyTextButton({ text, label = "Copy prompt" }: { text: string; label?: string }) {
  const [state, setState] = useState<"idle" | "copied" | "error">("idle");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setState("copied");
      window.setTimeout(() => setState("idle"), 2200);
    } catch {
      setState("error");
    }
  };

  return (
    <>
      <button className={state === "copied" ? "copy-text-button confirmed" : "copy-text-button"} onClick={copy} type="button">
        {state === "copied" ? <Check aria-hidden="true" size={14} /> : <Clipboard aria-hidden="true" size={14} />}
        {state === "copied" ? "Copied" : state === "error" ? "Copy failed" : label}
      </button>
      <span aria-live="polite" className="sr-only">{state === "copied" ? `${label} copied to the clipboard.` : state === "error" ? "Copy failed. Select the text and copy it manually." : ""}</span>
    </>
  );
}

export function SalesTemplateWorkbench({ templates }: { templates: SalesTemplate[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [drafts, setDrafts] = useState(() => templates.map((template) => template.template));
  const [subjects, setSubjects] = useState(() => templates.map((template) => template.subject ?? ""));
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");
  const active = templates[activeIndex];
  const Icon = templateIcons[active.kind];

  const copyTemplate = async () => {
    const subject = subjects[activeIndex].trim();
    const content = `${subject ? `Subject: ${subject}\n\n` : ""}${drafts[activeIndex]}`;
    try {
      await navigator.clipboard.writeText(content);
      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 2200);
    } catch {
      setCopyState("error");
    }
  };

  return (
    <div className="sales-workbench">
      <div className="sales-template-tabs" role="tablist" aria-label="Conversation templates">
        {templates.map((template, index) => {
          const TabIcon = templateIcons[template.kind];
          return (
            <button
              aria-selected={activeIndex === index}
              className={activeIndex === index ? "active" : ""}
              key={template.kind}
              onClick={() => { setActiveIndex(index); setCopyState("idle"); }}
              role="tab"
              type="button"
            >
              <TabIcon aria-hidden="true" size={17} />
              {template.title}
            </button>
          );
        })}
      </div>
      <section className="sales-editor" role="tabpanel">
        <div className="sales-editor-heading">
          <span><Icon aria-hidden="true" size={19} /></span>
          <div><h3>{active.title}</h3><p>{active.detail}</p></div>
        </div>
        {active.subject !== undefined ? (
          <label className="sales-field">
            <span>Subject</span>
            <input value={subjects[activeIndex]} onChange={(event) => setSubjects((current) => current.map((value, index) => index === activeIndex ? event.target.value : value))} />
          </label>
        ) : null}
        <label className="sales-field">
          <span>Editable template</span>
          <textarea value={drafts[activeIndex]} onChange={(event) => setDrafts((current) => current.map((value, index) => index === activeIndex ? event.target.value : value))} />
        </label>
        <div className="sales-editor-actions">
          <p>Replace every [placeholder] before using this copy. Edits stay in this view and reset when you leave or refresh; copying does not send a message.</p>
          <button className={copyState === "copied" ? "primary-button confirmed" : "primary-button"} onClick={copyTemplate} type="button">
            {copyState === "copied" ? <Check aria-hidden="true" size={16} /> : <Clipboard aria-hidden="true" size={16} />}
            {copyState === "copied" ? "Copied to clipboard" : copyState === "error" ? "Copy failed — try again" : "Copy template"}
          </button>
        </div>
        <p aria-live="polite" className="sr-only">{copyState === "copied" ? `${active.title} copied to the clipboard. No message was sent.` : copyState === "error" ? "The template could not be copied. Select the text and copy it manually." : ""}</p>
      </section>
    </div>
  );
}
