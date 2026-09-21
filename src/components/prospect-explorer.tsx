"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Check, Download, ExternalLink, Mail, Phone, Search, X } from "lucide-react";
import type { PergolaProspect } from "@/lib/pergola-prospects";

type ContactFilter = "all" | "email" | "phone";
type PriorityFilter = "all" | PergolaProspect["researchPriority"];

function optionValues(records: PergolaProspect[], field: "stateRegion" | "city" | "category") {
  return [...new Set(records.map((record) => record[field]).filter((value): value is string => Boolean(value)))].sort((a, b) => a.localeCompare(b));
}

function websiteDomain(website: string | null) {
  if (!website) return "";
  try { return new URL(website).hostname.replace(/^www\./, ""); } catch { return ""; }
}

function ExternalAction({ href, children }: { href: string; children: ReactNode }) {
  return <a href={href} rel="noopener noreferrer" target="_blank">{children}<ExternalLink aria-hidden="true" size={13} /></a>;
}

export function ProspectExplorer({ records, downloadPath }: { records: PergolaProspect[]; downloadPath: string }) {
  const [query, setQuery] = useState("");
  const [stateRegion, setStateRegion] = useState("all");
  const [city, setCity] = useState("all");
  const [category, setCategory] = useState("all");
  const [priority, setPriority] = useState<PriorityFilter>("all");
  const [contact, setContact] = useState<ContactFilter>("all");
  const [copyState, setCopyState] = useState<string | null>(null);

  const states = useMemo(() => optionValues(records, "stateRegion"), [records]);
  const cities = useMemo(() => optionValues(records.filter((record) => stateRegion === "all" || record.stateRegion === stateRegion), "city"), [records, stateRegion]);
  const categories = useMemo(() => optionValues(records, "category"), [records]);
  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return records.filter((record) => {
      const matchesQuery = !normalizedQuery || `${record.companyName} ${websiteDomain(record.website)}`.toLowerCase().includes(normalizedQuery);
      const matchesState = stateRegion === "all" || record.stateRegion === stateRegion;
      const matchesCity = city === "all" || record.city === city;
      const matchesCategory = category === "all" || record.category === category;
      const matchesPriority = priority === "all" || record.researchPriority === priority;
      const matchesContact = contact === "all" || (contact === "email" ? Boolean(record.primaryEmail) : Boolean(record.primaryPhone));
      return matchesQuery && matchesState && matchesCity && matchesCategory && matchesPriority && matchesContact;
    });
  }, [records, query, stateRegion, city, category, priority, contact]);

  const copy = async (record: PergolaProspect, kind: "email" | "phone") => {
    const value = kind === "email" ? record.primaryEmail : record.primaryPhone;
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      const key = `${record.id}:${kind}`;
      setCopyState(key);
      window.setTimeout(() => setCopyState((current) => current === key ? null : current), 2200);
    } catch {
      setCopyState(null);
    }
  };

  const reset = () => {
    setQuery("");
    setStateRegion("all");
    setCity("all");
    setCategory("all");
    setPriority("all");
    setContact("all");
  };

  return (
    <section className="prospect-explorer" aria-labelledby="prospect-results-title">
      <div className="prospect-toolbar">
        <label className="prospect-search">
          <span className="sr-only">Search company or domain</span>
          <Search aria-hidden="true" size={18} />
          <input aria-label="Search company or domain" onChange={(event) => setQuery(event.target.value)} placeholder="Search company or domain" value={query} />
          {query ? <button aria-label="Clear prospect search" onClick={() => setQuery("")} type="button"><X aria-hidden="true" size={15} /></button> : null}
        </label>
        <a className="secondary-button prospect-download" href={downloadPath}><Download aria-hidden="true" size={15} /> Download member CSV</a>
      </div>

      <div className="prospect-filters" aria-label="Potential customer filters">
        <label>State<select aria-label="Filter by state" onChange={(event) => { setStateRegion(event.target.value); setCity("all"); }} value={stateRegion}><option value="all">All states</option>{states.map((value) => <option key={value}>{value}</option>)}</select></label>
        <label>City<select aria-label="Filter by city" onChange={(event) => setCity(event.target.value)} value={city}><option value="all">All cities</option>{cities.map((value) => <option key={value}>{value}</option>)}</select></label>
        <label>Category<select aria-label="Filter by category" onChange={(event) => setCategory(event.target.value)} value={category}><option value="all">All categories</option>{categories.map((value) => <option key={value}>{value}</option>)}</select></label>
        <label>Research priority<select aria-label="Filter by research priority" onChange={(event) => setPriority(event.target.value as PriorityFilter)} value={priority}><option value="all">All priorities</option><option value="HIGH">High</option><option value="MEDIUM">Medium</option></select></label>
        <label>Contact available<select aria-label="Filter by contact availability" onChange={(event) => setContact(event.target.value as ContactFilter)} value={contact}><option value="all">All contacts</option><option value="email">Email</option><option value="phone">Phone</option></select></label>
      </div>

      <div className="prospect-results-heading">
        <div><span>Member research list</span><h2 id="prospect-results-title">{filtered.length} {filtered.length === 1 ? "business" : "businesses"}</h2></div>
        <p>Non-exclusive public-source research. Verify each company and contact route before outreach.</p>
      </div>

      {filtered.length ? (
        <div className="prospect-list">
          <div aria-hidden="true" className="prospect-list-header"><span>Company</span><span>Location</span><span>Fit</span><span>Published contact</span><span>Checked</span><span>Actions</span></div>
          {filtered.map((record) => {
            const copiedEmail = copyState === `${record.id}:email`;
            const copiedPhone = copyState === `${record.id}:phone`;
            return (
              <article className="prospect-row" key={record.id}>
                <div className="prospect-company"><strong>{record.companyName}</strong><span>{websiteDomain(record.website) || "Website unavailable"}</span><em>{record.researchPriority === "HIGH" ? "High research priority" : "Medium research priority"}</em></div>
                <div data-label="Location"><strong>{[record.city, record.stateRegion].filter(Boolean).join(", ") || "Not listed"}</strong><span>{record.country}</span></div>
                <div data-label="Fit"><strong>{record.category}</strong>{record.businessModel && record.businessModel !== "Unknown" ? <span>{record.businessModel}</span> : null}</div>
                <div className="prospect-contact" data-label="Published contact">
                  {record.primaryEmail ? <button aria-label={`Copy email for ${record.companyName}`} onClick={() => copy(record, "email")} type="button">{copiedEmail ? <Check aria-hidden="true" size={13} /> : <Mail aria-hidden="true" size={13} />}<span>{copiedEmail ? "Copied" : record.primaryEmail}</span></button> : <span>Email not listed</span>}
                  {record.primaryPhone ? <button aria-label={`Copy phone for ${record.companyName}`} onClick={() => copy(record, "phone")} type="button">{copiedPhone ? <Check aria-hidden="true" size={13} /> : <Phone aria-hidden="true" size={13} />}<span>{copiedPhone ? "Copied" : record.primaryPhone}</span></button> : <span>Phone not listed</span>}
                </div>
                <div data-label="Last checked"><strong>{record.lastChecked ?? "Not recorded"}</strong><span>{record.hasQuoteForm ? "Quote form found" : "No quote form recorded"}</span></div>
                <div className="prospect-actions" data-label="Actions">
                  {record.website ? <ExternalAction href={record.website}>Website</ExternalAction> : null}
                  {record.hasQuoteForm && record.quoteUrl ? <ExternalAction href={record.quoteUrl}>Quote form</ExternalAction> : null}
                  {record.sourceUrl ? <ExternalAction href={record.sourceUrl}>Source</ExternalAction> : null}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="prospect-empty"><Search aria-hidden="true" size={22} /><h3>No matching businesses</h3><p>Try fewer filters or a different company or domain.</p><button className="secondary-button" onClick={reset} type="button">Clear filters</button></div>
      )}
      <p aria-live="polite" className="sr-only">{copyState ? "Published contact detail copied to the clipboard." : ""}</p>
    </section>
  );
}
