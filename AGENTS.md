# IncomeNow project instructions

- IncomeNow is an idea-and-implementation membership, not a conventional course platform.
- Preserve the approved Stitch visual system and responsive patterns in `stitch/`.
- Build reusable components from structured, validated idea content; do not hardcode one page per idea.
- Keep prototype fixtures and device-local preview state separate from future production behavior.
- Google sign-in and email/password are implemented through Supabase SSR; provider credentials and hosted configuration must remain environment-managed and require explicit approval before mutation.
- Paid entitlement and account authentication are separate concerns.
- Protected content must perform a fresh server-side membership check at the data boundary; never infer authorization from profile metadata or client state.
- The future admin is operational (analytics, users, subscriptions), not a content editor or CMS.
- Keep paid resources, credentials, and private customer data out of public assets and client bundles.
- Run the relevant type, lint, test, build, and responsive checks before reporting completion.
- Do not push, publish, deploy, or connect external services without explicit approval.


<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
