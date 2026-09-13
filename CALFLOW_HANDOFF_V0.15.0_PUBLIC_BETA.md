# CalFlow — v0.15.0 Public Beta Candidate handoff

Prepared 2026-09-13 for a fresh ChatGPT/Codex project. This is a standalone description of the current repository, its verified baseline, and the next work. Previous conversation history is not required.

## 1. Current baseline

- **State:** v0.15.0 Public Beta Candidate, as recorded in `CHANGELOG.md`; not yet a Raycast Store release. This label does not imply a Git tag or an npm package version.
- **Repository:** [JonahTweed/CalFlow](https://github.com/JonahTweed/CalFlow).
- **Source of truth:** GitHub `main`.
- **Main baseline SHA at preparation:** `1e0b67473a1af39514a76f7c5857d95c1c40e42e`, checked against both the local checkout and remote `main`.
- **Validation:** `npm test` PASS and `npx tsc --noEmit` PASS, rerun during handoff preparation.
- **Working tree:** clean before creating this document; this handoff is the only intended change in its commit.
- **Local checkout:** `~/Developer/CalFlow` on the maintainer's Mac.
- **Public name:** CalFlow. The manifest name remains `calendar-shortcuts-google`, and internal storage/cache identifiers retain `calendar-shortcuts` for compatibility with existing installations.

The SHA above identifies the baseline this document describes. The commit adding this document advances `main` without application changes; its SHA cannot be embedded in its own contents. In a fresh checkout, use `git rev-parse HEAD` to obtain the latest actual SHA and inspect any subsequent changes before assuming this snapshot is still current.

## 2. Product overview

CalFlow is a macOS Google Calendar extension for Raycast. It reads and writes Google Calendar directly; Apple Calendar is not involved.

| Command or surface | Purpose |
| --- | --- |
| Schedule | Browse upcoming events, Next Up, calendar filters, and permission-aware event actions. |
| Calendar Menu Bar | Persistent current/upcoming events, Smart Status, meeting links, Open Event, and Open Calendar. |
| Add Personal Event / Add Work Event / Add Shared Event | Natural-language Quick Add routed to configured calendar roles. |
| Event Actions | Edit where supported, move/copy/delete with permission checks, join meetings, and open locations or Google Calendar. |
| Enabled Calendars | Manage independent Schedule and Menu Bar calendar selections. |
| Calendar Settings | Control calendar sets, filtering, menu-bar event count, date format, and row layout. |
| Set up Calendars | Three-step roles, visibility, and optional routing-keyword setup. |
| Check Google Calendar Connection | Verify the current Google connection. |
| Disconnect Google Calendar | Remove local OAuth tokens while retaining configuration. |

Development commands include Refresh Diagnostics, Test Quick Add Parsing, and Replay Calendar Setup. Replay is development-only, not a normal user reset.

Google sign-in uses Raycast's native Google OAuth integration. CalFlow operates on the currently connected account, with durable settings scoped to that account. Multiple-account support means switching/reconnecting accounts preserves their separate configuration; it does not mean simultaneous aggregation of several OAuth accounts.

## 3. Current verified behavior and evidence

**Evidence distinction:** The maintainer explicitly runtime-confirmed setup saves and removals, keyword persistence, and browser event/calendar opening under both the main and Lime/secondary accounts. Other behavior below is established by the current implementation and the passing regression suite where covered. Do not describe source-contract checks as a complete live Google/Raycast integration test, or assume every permissions/reminder combination was runtime-tested during this handoff.

- Native Google OAuth is working in the tested connected-account flows.
- Account-scoped roles, routing keywords, setup completion, and calendar selections survive reconnecting to the same account. Schedule and Menu Bar use independent selection keys.
- The setup wizard keeps one draft through roles, visibility, and keywords. Selecting calendars and adding a routing keyword persists after finishing and reopening setup. Removing previously selected calendars and repeating setup also persists; removed choices are not resurrected.
- JSON LocalStorage writes are serialized. Save reads back roles, keywords, Schedule selections, and Menu Bar selections, compares them with the draft, then marks setup complete and reports success only after verification. A mismatch reports an error and leaves the previous completion flag unchanged; this is not a rollback transaction.
- Timed and true all-day events can be edited in their existing type. All-day end dates retain Google's exclusive-end semantics. Multi-day all-day events spanning today are treated as active today rather than incorrectly excluded or labelled only with their original start date.
- Successful supported event mutations refresh the relevant Schedule view and request a background Menu Bar refresh. Display-only changes use cached events where possible.
- Long menu-bar rows compact date/time metadata first, then truncate the title if needed. Smart Status describes the filtered visible view, with wording such as “Nothing else shown today,” rather than claiming all calendars are empty.
- Open Event / Open in Google Calendar retains the exact Google event target and connected account in the default browser. The relevant Schedule/Next Up, menu-bar, Edit Event, and Event Actions paths use browser routing. The maintainer confirmed the tested opening locations, including Lime.
- Open Calendar opens the connected account's calendar view in the default browser. Both accounts were runtime-verified.
- The installed Google Calendar Chrome PWA/app is no longer selected for these actions; the app-opening preference has been removed.
- Permissions distinguish editing from moving/deleting. Writable guest copies may be edited locally where offered; this does not make the attendee the organiser. Move/delete require stricter ownership checks. Read-only and birthday events are restricted; guest and special events may offer Copy instead of Move. Inspect each surface's guards before changing them.
- Supported edits use PATCH so unrelated Google fields, including reminders, are not replaced. Copies explicitly carry supported metadata and reminders; moves fetch the source event and reapply explicit reminder overrides after Google's move operation. These are code-reviewed guarantees within the supported operations, not a promise that copies duplicate every Google field.

## 4. Important architecture

Paths below are relative to the repository root.

| File/module | Responsibility |
| --- | --- |
| `src/lib/google.ts` | Authenticated Google Calendar API calls, pagination, calendars/events, creation, PATCH editing, copy/move/delete, reminder and supported metadata handling, connection fingerprint. |
| `src/lib/google-oauth.ts` | Raycast Google OAuth service, public client ID, requested scopes. Commands use `withAccessToken` around this service. |
| `src/lib/types.ts` | Google calendar/event and Schedule data types. |
| `src/lib/schedule.ts` | Load and filter calendar/event data; account-aware URLs; calendar-view account lookup; date, all-day, display, and overview helpers. |
| `src/schedule.tsx` | Schedule UI, Next Up and event rows, filters, setup redirect, actions, and Schedule mutation refresh orchestration. |
| `src/lib/calendar-settings.ts` | Account scope resolution, roles, independent calendar selections, routing keywords, completion flag, validated storage writes. |
| `src/lib/calendar-setup-view.tsx` | Persistent three-step draft, form validation, write/read-back verification, completion and setup refresh. |
| `src/menu-bar.tsx` | Persistent menu worker, connection-keyed snapshot, display-only versus full refresh, upcoming/active filtering, compact rows, Smart Status, opening actions. |
| `src/lib/menu-bar-display-settings.ts` | Local menu display preferences and normalization; distinct from account-scoped calendar configuration. |
| `src/menu-bar-settings.tsx` / `src/enabled-calendars.tsx` | Settings surfaces, selection changes, and appropriate display/full refresh requests. |
| `src/event-actions.tsx` | Event Actions, ownership/guest checks, transfer flows, confirmation and refresh wiring. |
| `src/edit-event.tsx` | Timed/all-day edit form, date handling, PATCH submission, and caller-provided save refresh callback. |
| `src/lib/parse.ts`, `routing.ts`, `quick-add-plan.ts` | Natural-language date/duration parsing, role/keyword routing, and event planning. |
| `src/lib/quick-add.ts`, `quick-add-view.tsx`, `chooser.ts` | Quick Add execution, confirmation/choice flows, and post-create refresh. |
| `src/disconnect-google.ts` / `src/reset-onboarding.ts` | Disconnect versus development setup replay; intentionally different operations. |
| `src/refresh-diagnostics.tsx` | Non-destructive live menu-bar refresh diagnostics. |

**Refresh rule:** UI/local-setting changes must not unnecessarily cause Google API calls. Schedule's local view state and the Menu Bar's cached snapshot are intentionally separated from fetching Google events. Menu settings request `refreshMode: "display"` for display-only changes and `"full"` when the underlying calendar set changes. Schedule reloads when its calendar-selection signature changes, not merely on every local-setting check. Event edits/transfers/deletes and Quick Add request actual data refreshes. Menu Bar background refresh rebuilds the snapshot when required. Preserve this separation and the persistence-before-state ordering used by menu settings.

## 5. Storage and multi-account rules

- `currentGoogleConnectionFingerprint()` hashes the current access token as a connection discriminator; it does not store the raw token as a settings key.
- Durable account scope is a deterministic local hash of the trimmed, lowercased primary calendar ID. A bounded LocalStorage index maps recent connection fingerprints to that scope; an in-memory promise avoids duplicate resolution. Token refresh can change the fingerprint, but resolving the same primary account returns the same durable scope.
- Hashes are identifiers, not encryption or an authorization boundary. Do not treat them as anonymization guarantees.
- Account-scoped v2 keys append `.account.<scope>` to `calendar-shortcuts` base keys. Unscoped legacy v1 values are deliberately not fallback values because their account ownership is ambiguous.
- Keep compatibility namespaces and the internal manifest name unless an explicit migration is designed and tested. Branding cleanup must not discard existing users' settings.
- Disconnect removes Raycast-managed local OAuth tokens and clears the Menu Bar cache. It retains Raycast preferences, account-scoped selections, role mappings, keywords, and setup completion. It does not revoke Google-account authorization; users revoke that separately in Google.
- `setupComplete` is account-scoped. First-run Schedule redirects an incomplete account to setup. The completion flag is written only after the full draft passes read-back verification; a failed save does not claim success.
- The module-local JSON write queue orders settings writes even when save invokes several setters through `Promise.all`. Failed writes reach their caller without permanently blocking later queued writes. Do not describe this as a global cross-process lock or an atomic transaction.
- `[]` means an intentional empty calendar selection and is valid. Missing/uninitialized selection is distinct. Missing/undefined or invalid native form submissions must be rejected, never silently coerced to `[]` or blank keywords.
- Development Replay Calendar Setup snapshots current choices, clears current setup keys, restores saved choices, then launches setup with completion unset. Restore finishes before setup opens. This is not part of normal disconnect.

## 6. Open Event and Open Calendar design

Event links use Google's `htmlLink`, retaining the event target and other URL details. The loader adds `authuser` for the connected account and strips numeric `/calendar/u/<slot>` assumptions from recognized Calendar URLs. Browser account slot zero is not CalFlow's authenticated identity. If Google supplies no event link, the existing fallback opens the account-aware day view; do not promise an exact event in that case.

Schedule, Next Up, Edit Event, and Event Actions use browser actions; menu-bar Open Event opens the event URL without specifying an app. Open Calendar calls `connectedGoogleCalendarViewUrl()`, resolves the primary account from the full calendar list at click time, and opens `/calendar/r?authuser=...` without an event target. It works even with no visible events. Account resolution failures show an error instead of falling back to the main account. The user may need to sign in to the connected account in the browser.

The installed Chrome Calendar PWA was abandoned for these actions because it opened its own main-account calendar and did not reliably select the target event or switch accounts. Correct event/account routing takes precedence over forcing the PWA. The removed **Open Google Calendar In** preference must not be restored as an incidental refactor.

## 7. Test suite

Run from the repository root:

| Command | Protection |
| --- | --- |
| `npm run test:parser` | Natural-language parsing, dates, durations, timed/all-day planning and payload expectations. |
| `npm run test:routing` | Calendar role/keyword routing and destination selection rules. |
| `npm run test:refresh` | Source contracts for mutation refresh wiring, display/full refresh separation, and account-aware loaded links. |
| `npm run test:onboarding` | Setup draft/validation, persistence verification and write serialization contracts, account-scoped setup and replay safeguards. |
| `npm run test:smart-status` | Filter-aware wording, timing status, and active multi-day all-day display contracts. |
| `npm run test:menu-row` | Metadata compaction before title truncation and the existing row-length target. |
| `npm run test:event-opening` | Executed URL helper checks for main/secondary accounts, recurring/legacy targets, calendar view and lookup failures; structural browser-action checks. Currently 12 checks. |
| `npm test` | Runs all seven suites above. |
| `npx tsc --noEmit` | TypeScript checking without emitting application output. |

Several suites inspect source contracts rather than mounting Raycast or calling Google. Passing them is necessary but does not replace runtime verification of affected native surfaces. Use Refresh Diagnostics for a non-destructive live refresh check where relevant.

## 8. Privacy and security

Read [PRIVACY.md](PRIVACY.md) and [SECURITY.md](SECURITY.md) before changing data handling.

Calendar requests go directly from Raycast to the Google Calendar API. There is no CalFlow backend receiving calendar data. OAuth tokens are managed by Raycast; the checked-in client ID is public, not a client secret. Preferences, account configuration, and event snapshots are stored locally through Raycast LocalStorage/Cache. Event and calendar links open in the default browser; destination services apply their own policies.

Scopes are `https://www.googleapis.com/auth/calendar.events` and `https://www.googleapis.com/auth/calendar.calendarlist.readonly`. CalFlow does not use calendar data for analytics, advertising, profiling, tracking, sale, or AI/ML training.

Never log OAuth tokens or private calendar contents, and never post credentials or private calendar links in public issues. Setup diagnostics are development-gated and summarize draft shape, scope, and counts; preserve that restraint. Do not expand scopes, introduce telemetry, or weaken privacy/security claims as an incidental change.

## 9. Known limitations and open items

- Raycast DatePicker free-text suggestions can reject or inconsistently interpret abbreviated phrases; CalFlow does not replace Raycast's native suggestion parser.
- Timed-to-all-day and all-day-to-timed conversion is not supported. Existing event types can be edited.
- Public Google OAuth verification, tester access, and production release requirements still need release review. Working maintainer accounts do not prove unrestricted public authorization is ready.
- Public beta feedback and Raycast Store readiness/submission are pending; this is not yet a Store release.
- The product is macOS-only.
- A dedicated one-step clear-all-local-configuration command remains planned as documented in the privacy policy. Disconnect intentionally retains settings.

Setup persistence, secondary-account browser opening, multi-day all-day display, menu-row title handling, and filtered Smart Status wording are fixed baseline behavior, not active bugs.

## 10. Do-not-regress rules

- Never overwrite another account's settings or resurrect removed selections.
- Keep Schedule and Menu Bar calendar sets independent.
- Never reintroduce `/u/0` as an account-selection assumption.
- Reject missing form values; preserve intentional empty arrays and cleared keywords.
- Keep serialized JSON writes and post-save verification; changes to setup persistence require regression coverage.
- Do not restore the removed Google Calendar app preference or force PWA deep links.
- Preserve supported reminders/metadata during edits, moves, and copies. PATCH edits leave unrelated fields intact. Copy preserves supported source/conference/attachment/recurrence data, not arbitrary ownership or attendee identity; explicit reminder overrides are limited to Google's supported five entries, while default reminders follow the destination calendar.
- Keep owner/guest/read-only guards and Google's exclusive all-day end semantics.
- Do not turn display changes into unnecessary Google refreshes.
- Keep privacy/security behavior and compatibility namespaces intact.

## 11. Development workflow

GitHub `main` is the source of truth. Inspect the checkout, branch, remote, current files, and any uncommitted changes first. Do not overwrite user work or assume a ZIP backup outranks `main`.

Work on one logical change at a time. Complete the implementation and relevant regression coverage; run `npm test` and `npx tsc --noEmit`; runtime-test the affected Raycast surface. Review the diff and commit/push only after verification and when authorized by the user. Checkpoint known-good builds. Larger changes should not be bundled into beta stabilization without a clear request.

This handoff is documentation only. It does not authorize a new assistant to change application behavior, publish a release, or send a Slack message automatically.

## 12. Next steps

**Immediate next step: PUBLIC BETA / RAYCAST SLACK POST.** Prepare the beta announcement using the current README, installation instructions, privacy/security links, known limitations, and GitHub issue-reporting route. Send/post only when explicitly authorized.

Then gather beta feedback, triage bugs, complete Google OAuth production verification work, and assess Raycast Store readiness/submission. Larger feature work follows those release priorities.

## 13. Fresh chat instructions

Treat this handoff and current GitHub `main` as the source of truth. Check for commits newer than this snapshot. Do not reconstruct older conversation history unless explicitly asked.

Inspect current files before making code changes. Never assume an older backup or supplied file is newer than GitHub `main`. Preserve existing tested behavior unless the user explicitly asks to change it.

For code changes, prefer complete, verified edits and regression tests. Distinguish runtime confirmations, automated checks, and code-inspected behavior. Do not ask for confirmation for obvious continuation steps when the user's intent is already clear; continue within the authorized scope.
