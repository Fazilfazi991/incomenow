# Protected resource hardening

## Release boundary

The release branch stores only private-resource metadata, validation schemas, fixed resource identifiers, and server-side loading logic. It does not track source ZIPs, member prospect datasets, or the premium Pergola, Clinic, and Accounting readiness content.

The local review environment is provisioned with these ignored artifacts:

| Logical resource | Fixed local filename | Bytes | SHA-256 |
| --- | --- | ---: | --- |
| Pergola source | `universalpergola-main.zip` | 754,291 | `5E4DC492F2BD05869AE7FB77A4C83F66908F96FB6CD6329C4BDA1B36970345B5` |
| Pergola prospects | `potential-customers.json` | 50,723 | `46D0022AF7D9BC20790C5BABD733F287B210BC1867B9E5F8B6FD95261940610A` |
| Pergola member guide | `setup-guide-v1.json` | 9,847 | `E6B857D51BF9C2E888ED16CDE6711C9EE432E9051CA728A819CFAE7827A541DF` |
| Clinic source | `clinic-operations-crm-distribution.zip` | 1,687,530 | `58600C10281677E528625F0E3B17EBB981352BFFB30366A0E5903E4DED836CDE` |
| Clinic prospects | `uae-clinic-prospects-v1.json` | 83,595 | `16542CD14B50428C4F57FBBDF6EB616B09D8C8BD420FBFD9AEB05909FB87FA9E` |
| Clinic member guide | `setup-guide-v1.json` | 18,082 | `3D54A08379290C526243DFA3C509A2C95F6B363B0460B3CFD9C4513BDB99210A` |
| Accounting member guide | `setup-guide-v1.json` | 12,928 | `7E3890D6C8F7CDC897FB723DB5487F090538A2EB3181BCEC21E2B520BABF9470` |

The tracked manifest in `src/lib/private-resource-manifest.server.ts` contains this metadata only. Narrow root-relative ignore rules prevent accidental staging. Local provisioning copies the owner-approved bytes into the fixed ignored locations; files must never be reconstructed from Git.

## Runtime loading and failure behavior

Member routes make a fresh IncomeNow access decision first. Only an authorized server request may read a fixed artifact path. The server verifies the exact byte size and SHA-256 before parsing or returning it. No request parameter controls a filesystem path, and private modules are marked server-only.

Missing or invalid artifacts fail closed with private/no-store responses. Public and member catalogue projections use file metadata only to label a resource unavailable; they do not read protected bytes. A clean clone therefore builds and serves public pages without these artifacts, while protected resources remain unavailable until separately provisioned.

## Dataset reconciliation

- Pergola: 77 member-safe records. Internal research and outreach fields remain excluded from the JSON projection and generated CSV.
- Clinic: 100 records; 62 HIGH and 38 MEDIUM; 70 Dubai and 30 Abu Dhabi; 70 with email, 97 with phone, 84 with a contact form, 37 with booking, and 62 with clinic-published WhatsApp.
- Registered/free and Pergola Starter accounts cannot receive the Clinic record payload. Pergola data remains limited to current IDEA #001 Starter or full-member access.

## Production provisioning design

Production provisioning is still pending. The likely Supabase design is a private Storage bucket with non-public object paths keyed by stable logical resource IDs. Objects must have no public URL. An IncomeNow server route must perform fresh membership/idea authorization before server-side retrieval or narrowly short-lived signed delivery, and must verify the manifest metadata. Object names and paths are never authorization. Source ZIPs, prospect exports, and guide artifacts must remain private.

This task did not link or migrate Supabase project `imwiqfmafuamcgqswcfy`, create a bucket, upload an object, change Auth, change a user, or deploy.

## History cleanup

Remote inspection after `git fetch --all --prune` found neither affected commit on a remote branch and no protected-path history on `origin/main`. The local release branch is rebuilt so the two datasets and the prior premium readiness modules are absent from every commit intended for origin. Existing remote refs are unchanged. Unreachable local objects may remain until normal repository maintenance; no destructive garbage collection is required.
