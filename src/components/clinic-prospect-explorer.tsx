"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  CalendarDays,
  Check,
  ChevronDown,
  Clipboard,
  Download,
  ExternalLink,
  FileText,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Search,
  X,
} from "lucide-react";
import {
  emptyClinicProspectFilters,
  filterClinicProspects,
  type ClinicContactFilter,
  type ClinicProspect,
  type ClinicProspectFilters,
} from "@/lib/clinic-prospects";

function optionValues(records: readonly ClinicProspect[], field: "country" | "emirate" | "city" | "area" | "clinicType") {
  return [...new Set(records.map((record) => record[field]).filter((value): value is string => Boolean(value)))].sort((a, b) => a.localeCompare(b));
}

function websiteDomain(website: string | null) {
  if (!website) return "Website unavailable";
  try { return new URL(website).hostname.replace(/^www\./, ""); } catch { return "Website unavailable"; }
}

function whatsappLabel(status: ClinicProspect["whatsappStatus"]) {
  if (status === "available") return "Available";
  if (status === "not-publicly-listed") return "Not publicly listed";
  return "Unknown";
}

function whatsappHref(number: string) {
  return `https://wa.me/${number.replace(/\D/g, "")}`;
}

function ExternalAction({ href, children }: { href: string; children: ReactNode }) {
  return <a href={href} rel="noopener noreferrer" target="_blank">{children}<ExternalLink aria-hidden="true" size={13} /></a>;
}

function ContactIndicator({ available, children }: { available: boolean; children: ReactNode }) {
  return <span className={available ? "available" : "unavailable"}>{available ? <Check aria-hidden="true" size={11} /> : null}{children}</span>;
}

export function ClinicProspectExplorer({
  records,
  downloadPath,
  salesTemplatesPath,
}: {
  records: ClinicProspect[];
  downloadPath: string;
  salesTemplatesPath: string;
}) {
  const [filters, setFilters] = useState<ClinicProspectFilters>(emptyClinicProspectFilters);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copyState, setCopyState] = useState<string | null>(null);

  const countries = useMemo(() => optionValues(records, "country"), [records]);
  const emirates = useMemo(() => optionValues(records, "emirate"), [records]);
  const cities = useMemo(() => optionValues(records.filter((record) => filters.emirate === "all" || record.emirate === filters.emirate), "city"), [records, filters.emirate]);
  const areas = useMemo(() => optionValues(records.filter((record) => (filters.emirate === "all" || record.emirate === filters.emirate) && (filters.city === "all" || record.city === filters.city)), "area"), [records, filters.emirate, filters.city]);
  const clinicTypes = useMemo(() => optionValues(records, "clinicType"), [records]);
  const filtered = useMemo(() => filterClinicProspects(records, filters), [records, filters]);
  const summary = useMemo(() => ({
    dubai: records.filter((record) => record.city === "Dubai").length,
    abuDhabi: records.filter((record) => record.city === "Abu Dhabi").length,
    high: records.filter((record) => record.researchPriority === "HIGH").length,
    medium: records.filter((record) => record.researchPriority === "MEDIUM").length,
    email: records.filter((record) => record.primaryEmail).length,
    phone: records.filter((record) => record.primaryPhone).length,
    contactForm: records.filter((record) => record.contactFormUrl).length,
    booking: records.filter((record) => record.bookingUrl).length,
    whatsapp: records.filter((record) => record.whatsappStatus === "available").length,
  }), [records]);

  const setFilter = <Key extends keyof ClinicProspectFilters>(key: Key, value: ClinicProspectFilters[Key]) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const reset = () => {
    setFilters(emptyClinicProspectFilters);
    setExpandedId(null);
  };

  const copy = async (record: ClinicProspect, kind: "email" | "phone" | "whatsapp") => {
    const value = kind === "email" ? record.primaryEmail : kind === "phone" ? record.primaryPhone : record.whatsappNumber;
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

  return (
    <section className="clinic-prospect-explorer" aria-labelledby="clinic-prospect-results-title">
      <div className="clinic-prospect-summary" aria-label="Clinic research summary">
        <article className="primary"><strong>{records.length}</strong><span>clinics</span></article>
        <article><strong>{summary.dubai}</strong><span>Dubai</span><small>{summary.abuDhabi} Abu Dhabi</small></article>
        <article><strong>{summary.high}</strong><span>High priority</span><small>{summary.medium} Medium</small></article>
        <article><strong>{summary.email}</strong><span>with email</span><small>{summary.phone} with phone</small></article>
      </div>

      <details className="clinic-prospect-coverage">
        <summary>More contact-route coverage <ChevronDown aria-hidden="true" size={15} /></summary>
        <div><span>{summary.contactForm} contact forms</span><span>{summary.booking} booking routes</span><span>{summary.whatsapp} clinic-published WhatsApp routes</span></div>
      </details>

      <div className="clinic-prospect-toolbar">
        <label className="clinic-prospect-search">
          <span className="sr-only">Search clinic, domain, area, or service</span>
          <Search aria-hidden="true" size={18} />
          <input aria-label="Search clinic, domain, area, or service" onChange={(event) => setFilter("query", event.target.value)} placeholder="Search clinic, domain, area, or service" value={filters.query} />
          {filters.query ? <button aria-label="Clear clinic search" onClick={() => setFilter("query", "")} type="button"><X aria-hidden="true" size={15} /></button> : null}
        </label>
        <a className="secondary-button clinic-prospect-download" href={downloadPath}><Download aria-hidden="true" size={15} /> Download member CSV</a>
      </div>

      <div className="clinic-prospect-filters" aria-label="Clinic prospect filters">
        <label>Country<select aria-label="Filter by country" onChange={(event) => setFilter("country", event.target.value)} value={filters.country}><option value="all">All countries</option>{countries.map((value) => <option key={value}>{value}</option>)}</select></label>
        <label>Emirate<select aria-label="Filter by emirate" onChange={(event) => { setFilters((current) => ({ ...current, emirate: event.target.value, city: "all", area: "all" })); }} value={filters.emirate}><option value="all">All emirates</option>{emirates.map((value) => <option key={value}>{value}</option>)}</select></label>
        <label>City<select aria-label="Filter by city" onChange={(event) => { setFilters((current) => ({ ...current, city: event.target.value, area: "all" })); }} value={filters.city}><option value="all">All cities</option>{cities.map((value) => <option key={value}>{value}</option>)}</select></label>
        <label>Area<select aria-label="Filter by area" onChange={(event) => setFilter("area", event.target.value)} value={filters.area}><option value="all">All areas</option>{areas.map((value) => <option key={value}>{value}</option>)}</select></label>
        <label>Clinic type<select aria-label="Filter by clinic type" onChange={(event) => setFilter("clinicType", event.target.value)} value={filters.clinicType}><option value="all">All clinic types</option>{clinicTypes.map((value) => <option key={value}>{value}</option>)}</select></label>
        <label>Research priority<select aria-label="Filter by research priority" onChange={(event) => setFilter("researchPriority", event.target.value as ClinicProspectFilters["researchPriority"])} value={filters.researchPriority}><option value="all">All priorities</option><option value="HIGH">High</option><option value="MEDIUM">Medium</option></select></label>
        <label>Contact availability<select aria-label="Filter by contact availability" onChange={(event) => setFilter("contact", event.target.value as ClinicContactFilter)} value={filters.contact}><option value="all">All contact routes</option><option value="email">Email</option><option value="phone">Phone</option><option value="contact-form">Contact form</option><option value="booking">Booking</option><option value="whatsapp">WhatsApp</option></select></label>
      </div>

      <div className="clinic-prospect-results-heading">
        <div><span>Protected member research</span><h2 id="clinic-prospect-results-title">{filtered.length} {filtered.length === 1 ? "clinic" : "clinics"}</h2></div>
        <p><strong>Research priority is not a sales-probability score.</strong> It combines business fit, source quality, and availability of public contact routes.</p>
      </div>

      {filtered.length ? (
        <div className="clinic-prospect-list">
          <div aria-hidden="true" className="clinic-prospect-list-header"><span>Clinic</span><span>Location</span><span>Type</span><span>Contact</span><span>Priority</span><span>Actions</span></div>
          {filtered.map((record) => {
            const expanded = expandedId === record.id;
            const detailId = `${record.id}-details`;
            const copied = (kind: "email" | "phone" | "whatsapp") => copyState === `${record.id}:${kind}`;
            return (
              <article className={`clinic-prospect-record${expanded ? " expanded" : ""}`} key={record.id}>
                <div className="clinic-prospect-row">
                  <div className="clinic-prospect-company"><strong>{record.companyName}</strong><span>{websiteDomain(record.website)}</span></div>
                  <div data-label="Location"><strong>{record.area ?? record.city}</strong><span>{record.area ? `${record.city}, ${record.emirate}` : record.emirate}</span></div>
                  <div data-label="Type"><strong>{record.clinicType}</strong></div>
                  <div className="clinic-contact-indicators" data-label="Contact routes">
                    <ContactIndicator available={Boolean(record.primaryEmail)}>Email</ContactIndicator>
                    <ContactIndicator available={Boolean(record.primaryPhone)}>Phone</ContactIndicator>
                    <ContactIndicator available={Boolean(record.contactFormUrl)}>Form</ContactIndicator>
                    <ContactIndicator available={Boolean(record.bookingUrl)}>Booking</ContactIndicator>
                    <ContactIndicator available={record.whatsappStatus === "available"}>WhatsApp</ContactIndicator>
                  </div>
                  <div data-label="Research priority"><span className="clinic-priority" data-priority={record.researchPriority}>{record.researchPriority === "HIGH" ? "High" : "Medium"}</span></div>
                  <div className="clinic-prospect-row-action" data-label="Actions"><button aria-controls={detailId} aria-expanded={expanded} onClick={() => setExpandedId(expanded ? null : record.id)} type="button">{expanded ? "Close details" : "View details"}<ChevronDown aria-hidden="true" size={14} /></button></div>
                </div>

                {expanded ? <div className="clinic-prospect-details" id={detailId}>
                  <div className="clinic-detail-heading"><div><span>Published business details</span><h3>{record.companyName}</h3><p><MapPin aria-hidden="true" size={14} />{[record.area, record.city, record.emirate, record.country].filter(Boolean).join(" · ")}</p></div><span className="clinic-priority" data-priority={record.researchPriority}>{record.researchPriority} research priority</span></div>
                  <div className="clinic-detail-grid">
                    <section><span>Clinic profile</span><h4>{record.clinicType}</h4>{record.mainServices ? <p>{record.mainServices}</p> : <p>Main services not listed.</p>}</section>
                    <section><span>Public contact routes</span>
                      <dl>
                        <div><dt>Email</dt><dd>{record.primaryEmail ?? "Not publicly listed"}</dd></div>
                        <div><dt>Phone</dt><dd>{record.primaryPhone ?? "Not publicly listed"}</dd></div>
                        <div><dt>WhatsApp</dt><dd>{whatsappLabel(record.whatsappStatus)}{record.whatsappNumber ? ` · ${record.whatsappNumber}` : ""}</dd></div>
                      </dl>
                    </section>
                    <section><span>Research evidence</span><p><CalendarDays aria-hidden="true" size={14} />Last checked {record.lastChecked}</p><p><FileText aria-hidden="true" size={14} />Verify the source and contact route before outreach.</p></section>
                  </div>
                  <div className="clinic-detail-actions">
                    {record.website ? <ExternalAction href={record.website}>Visit website</ExternalAction> : null}
                    {record.primaryEmail ? <button onClick={() => copy(record, "email")} type="button">{copied("email") ? <Check aria-hidden="true" size={13} /> : <Mail aria-hidden="true" size={13} />}{copied("email") ? "Email copied" : "Copy email"}</button> : null}
                    {record.primaryPhone ? <button onClick={() => copy(record, "phone")} type="button">{copied("phone") ? <Check aria-hidden="true" size={13} /> : <Phone aria-hidden="true" size={13} />}{copied("phone") ? "Phone copied" : "Copy phone"}</button> : null}
                    {record.whatsappStatus === "available" && record.whatsappNumber ? <><button onClick={() => copy(record, "whatsapp")} type="button">{copied("whatsapp") ? <Check aria-hidden="true" size={13} /> : <Clipboard aria-hidden="true" size={13} />}{copied("whatsapp") ? "WhatsApp copied" : "Copy WhatsApp"}</button><ExternalAction href={whatsappHref(record.whatsappNumber)}><MessageCircle aria-hidden="true" size={13} />Open WhatsApp</ExternalAction></> : null}
                    {record.contactFormUrl ? <ExternalAction href={record.contactFormUrl}>Open contact form</ExternalAction> : null}
                    {record.bookingUrl ? <ExternalAction href={record.bookingUrl}>Open booking page</ExternalAction> : null}
                    <ExternalAction href={record.sourceUrl}>View source</ExternalAction>
                    <Link href={salesTemplatesPath}>Open sales templates</Link>
                  </div>
                </div> : null}
              </article>
            );
          })}
        </div>
      ) : (
        <div className="clinic-prospect-empty"><Search aria-hidden="true" size={22} /><h3>No matching clinics</h3><p>Try fewer filters or a different clinic, area, or service.</p><button className="secondary-button" onClick={reset} type="button">Clear filters</button></div>
      )}
      <p aria-live="polite" className="sr-only">{copyState ? "Published contact detail copied to the clipboard." : ""}</p>
    </section>
  );
}
