# Clinic CRM prospect integration

Date: 2026-09-21

Status: implemented locally; protected full-member review pending

## Preserved owner research

The owner research remains unchanged and Git-ignored under `research/clinic-crm-prospects-uae-2026-09-21/`. None of these files is served directly or copied into `public/`.

- Workbook: `clinic-prospects-uae.xlsx` — 24,096 bytes — SHA-256 `CF7899FB48222AD9E030D7CBE7F39BE3B7246ED7E9C3A8C0FA0636C5CE2F364D`.
- CSV: `clinic-prospects-uae.csv` — 83,413 bytes — SHA-256 `D06C1065291091A1FB62A0F6AFFF49F998322D7E27BE062BC2174598CE97679D`.
- Research summary: `research-summary.md` — 4,030 bytes — SHA-256 `3720DEF11C81DDFF56436DD9B2814CA87D53B5E5E49DA9608BBAE618412B2589`.

The workbook contains a 100-row `Prospects` table and a separate aggregate `Summary`. The XLSX and CSV headers and all 100 accepted rows reconcile exactly after Excel date serials are interpreted as `YYYY-MM-DD`.

Source disposition:

- 106 businesses reached detailed review.
- 100 accepted and published to the member-safe projection.
- 3 rejected and not present in the projection.
- 3 duplicate or branch records consolidated before the accepted source was supplied.

## Published member-safe projection

Server-only artifact: `private-resources/clinic/uae-clinic-prospects-v1.json`

- Schema version: 1.
- Dataset version: 2026-09-21.
- Records: 100.
- Current preserved local JSON size: 83,595 bytes.
- Current preserved local JSON SHA-256: `16542CD14B50428C4F57FBBDF6EB616B09D8C8BD420FBFD9AEB05909FB87FA9E`.
- Release state: untracked, narrowly ignored, and verified by the server-only manifest before parsing.

Distribution:

- Research priority: 62 HIGH, 38 MEDIUM.
- Geography: 70 Dubai, 30 Abu Dhabi.
- Clinic type: 33 Dental Clinic; 29 Aesthetic / Dermatology Clinic; 25 Physiotherapy / Chiropractic Clinic; 13 Specialist / Medical Centre.
- Public contact routes: 70 email, 97 phone, 84 contact form, 37 booking, 62 clinic-published WhatsApp.
- WhatsApp source state: 62 available, 23 not publicly listed, 15 unknown. Unknown is not converted to no.
- Every published record has at least one public contact route.

Member-facing record fields:

- Company name, website, country, emirate, city, area, clinic type, concise main services.
- Primary published email and phone.
- Contact-form and booking URLs.
- WhatsApp state and the number only when the clinic explicitly published it.
- Source URL, last-checked date, and research priority.

Excluded from every member record and the generated CSV:

- Domain/deduplication field.
- Business description.
- Priority reason and research notes.
- Email/phone evidence URLs and raw email status.
- LinkedIn, Instagram, discovery/search information, rejection details, and duplicate-review history.

Normalization preserves source facts. Websites use canonical HTTPS source values, email is lowercase, the source date is `2026-09-21`, city/emirate and clinic-type values use the accepted canonical taxonomy, and valid UAE phones use compact `+971` form. Four primary phone values were published only in local format and one clinic-published WhatsApp value was nonstandard; those values are retained without inventing missing digits or area codes and remain subject to the permanent verification warning.

## Protected CSV

Route: `/app/resources/clinic-uae-potential-customers`

Generated filename: `clinic-uae-potential-customers.csv`

- UTF-8 with BOM and CRLF rows.
- Stable 17-column approved header order.
- 100 records plus one header.
- Size: 39,106 bytes.
- SHA-256: `6C66A8490A548F21C252AAA7AF67056321E14B219FB5810810E393AED2EC9223`.
- Headers: `Content-Type: text/csv; charset=utf-8`, fixed attachment filename, `Cache-Control: private, no-store`, and `X-Content-Type-Options: nosniff`.

Authorization uses a fresh verified-account and IDEA #002 access decision, then additionally requires `full-membership` as the decision source:

| Account state | Finder records | CSV |
| --- | --- | --- |
| Signed out | Denied | Denied |
| Registered/free | Denied; safe preview only | 403 |
| Pergola Starter | Denied; safe preview only | 403 |
| Active full member | Allowed | Allowed |
| Expired/revoked full membership | Denied | 403 |
| Membership lookup unavailable | Denied | 503 |

No database migration or static public download was added.

## Member experience

The full-member **Find clinics** activity now provides:

- A compact summary strip for total, geography, priority, email, and phone coverage.
- Search plus country, emirate, city, area, clinic-type, priority, and contact-route filters with a live result count.
- Compact desktop research rows and mobile cards without horizontal table scrolling.
- One expanded detail at a time with source/date evidence, published routes, clipboard confirmation after success, and user-initiated external links.
- WhatsApp actions only for clinic-published WhatsApp numbers.
- A local navigation action to the existing sales templates; no send, contact, lead-status, or outreach-history mutation.
- The existing educational research method with UAE-focused searches and an explicit no-bulk-scraping boundary.

The permanent warning states that these are potential businesses to research, not confirmed buyers; the list is non-exclusive and every clinic/contact route must be re-verified. HIGH/MEDIUM is explicitly described as research prioritization, not sales probability.

## Verification

Automated and browser results are recorded in `docs/clinic-kit-results.md` and `docs/build-status.md`. Focused coverage includes aggregate reconciliation, combined filters, strict record projection, CSV headers, fresh full-member authorization, safe-preview boundaries, clipboard behavior, source actions, responsive presentation, and build-output marker scans.

No clinic was contacted. No research was added. No payment, push, deployment, or hosted Supabase change was performed.
