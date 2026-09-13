# CalFlow

<p align="center">
  <img src="assets/branding/calflow-store-icon-3d-1024.png" width="160" alt="CalFlow icon">
</p>

**CalFlow** is a Google Calendar extension for [Raycast](https://www.raycast.com/) with a fast Schedule view, a persistent menu-bar calendar, natural-language Quick Add, event editing, calendar routing, and account-aware setup.

> **Beta:** CalFlow is under active testing and is not yet published in the Raycast Store.

**Privacy & security:** [Privacy Policy](PRIVACY.md) · [Security Policy](SECURITY.md)

## Highlights

- **Schedule** — browse upcoming Google Calendar events without Apple Calendar.
- **Menu Bar** — keep current and upcoming events one click away.
- **Quick Add** — create Personal, Work, and Shared / Partner events with compact natural-language input.
- **Event management** — edit, move, copy, delete, join meetings, and open locations when permissions allow.
- **True all-day events** — create and edit Google all-day events without converting them into fake midnight events.
- **Independent calendar sets** — choose different calendars for Schedule and the Menu Bar.
- **Guided setup** — map Personal, Work, Shared / Partner, and Family roles after signing in.
- **Multiple Google accounts** — role mappings and calendar selections stay scoped to the connected account.
- **Native Google sign-in** — no downloaded client-secret file or Terminal OAuth helper is required.
- **Smart Status** — the menu-bar headline describes the events CalFlow is currently showing without claiming visibility into calendars you excluded.

CalFlow reads and writes Google Calendar directly. **Apple Calendar is not used.**

## Beta installation

### Requirements

- macOS
- Raycast
- Node.js / npm
- a Google account with Google Calendar

### Install from source

```bash
git clone https://github.com/JonahTweed/CalFlow.git
cd CalFlow
npm install
npm run dev
```

Raycast will load the local extension.

Open **Schedule**. On first use:

1. sign in to Google through Raycast;
2. choose the app CalFlow should use when opening Google Calendar links;
3. complete the three-step calendar setup;
4. choose which calendars appear in Schedule and the Menu Bar.

If Google sign-in is blocked during the beta, please report it through GitHub Issues. OAuth tester access may be limited while the public OAuth configuration is being finalised.

## Main commands

| Command | Purpose |
| --- | --- |
| **Schedule** | View and manage upcoming events |
| **Calendar Menu Bar** | Show current/upcoming events in the macOS menu bar |
| **Enabled Calendars** | Choose independent Schedule and Menu Bar calendar sets |
| **Calendar Settings** | Configure filtering, event count, date format, and row layout |
| **Set up Calendars** | Assign Personal, Work, Shared / Partner, and Family roles |
| **Add Personal Event** | Quick Add to the Personal role |
| **Add Work Event** | Quick Add to the Work role |
| **Add Shared Event** | Quick Add to the Shared / Partner role |
| **Check Google Calendar Connection** | Verify Google Calendar access |
| **Disconnect Google Calendar** | Sign out locally while preserving CalFlow settings |

Development builds also include non-destructive diagnostics and parsing/setup replay commands to help beta testing.

## Suggested hotkeys

These are optional Raycast hotkeys:

| Command | Suggested hotkey |
| --- | --- |
| Schedule | `⌃⌥S` |
| Add Personal Event | `⌃⌥P` |
| Add Work Event | `⌃⌥W` |
| Add Shared Event | `⌃⌥J` |

Configure them in **Raycast Settings → Extensions → CalFlow**.

## Quick Add examples

```text
tomorrow 7pm
Friday 12pm
next Friday
15/09 7pm
45m @ Home
Friday 3d
Zoom
https://example.com/meeting
```

CalFlow supports UK (`DD/MM/YYYY`) and US (`MM/DD/YYYY`) date modes from Calendar Settings.

## Opening events and calendars

Open Event / Open in Google Calendar uses your default browser from Schedule, Next Up, Edit Event, Event Actions, and the menu bar. Links retain Google's event target and identify the connected Google account, including secondary accounts. Sign in to that account in your browser if prompted.

**Open Calendar** in the menu bar also uses your default browser, opening the calendar view for the currently connected Google account. It resolves the account when clicked, even if no events are visible. If Google supplies no event link, the existing fallback opens the event day rather than a specific event.

## Event permissions

CalFlow deliberately treats owned events and invitations differently.

Owned events can expose actions such as Edit, Move, and Delete. Guest/invited events use safer actions such as Copy to Calendar and do not receive destructive owner-style actions where Google does not indicate ownership.

## Privacy and authentication

See the full [Privacy Policy](PRIVACY.md) and [Security Policy](SECURITY.md).

CalFlow uses Raycast's native Google OAuth support and requests:

- `calendar.events` — read and manage calendar events;
- `calendar.calendarlist.readonly` — read the user's calendar list, colours, and access roles.

OAuth tokens are managed by Raycast. The repository contains the OAuth **client ID**, which is public by design, but contains no client secret, refresh token, or access token.

CalFlow stores extension preferences and account-scoped calendar configuration locally through Raycast. The persistent Menu Bar also uses a local Raycast cache of upcoming event data so it can render quickly without contacting Google on every click. CalFlow does not operate a backend server that receives this calendar data.

CalFlow does not use calendar data for advertising, tracking, analytics, data brokerage, or training generalized AI/ML models.

## Known beta limitations

- Raycast's native DatePicker free-text suggestion parser can reject or inconsistently interpret some abbreviated phrases. CalFlow validates Start/End relationships and preserves event duration when Start moves past End, but does not replace Raycast's DatePicker parser.
- Timed events and all-day events can both be edited in Raycast, but CalFlow intentionally does **not** convert timed events into all-day events or vice versa yet.
- The public Google OAuth configuration may still require additional verification before a completely open release.
- CalFlow is currently macOS-only.

## Internal compatibility note

The Raycast manifest `name` and some local-storage/cache namespaces still use the legacy `calendar-shortcuts` identifier. That is intentional for this beta so existing tested installations keep their local state while the public-facing product is branded **CalFlow**.

## Testing

```bash
npm test
npx tsc --noEmit
```

The current regression suite covers parsing, routing, refresh wiring, onboarding, and Smart Status behavior.

A **Refresh Diagnostics — Development** command also performs a non-destructive live check of the real Raycast menu-bar refresh pipeline.

## Reporting beta issues

Please use [GitHub Issues](https://github.com/JonahTweed/CalFlow/issues).

Useful bug reports include:

- what you expected;
- what happened instead;
- which CalFlow command you were using;
- whether the event was timed or all-day;
- whether the calendar was owned, shared, or read-only;
- screenshots or a short screen recording where helpful.

**Do not post OAuth tokens, client-secret files, private calendar links, or other credentials in an issue.**

## Development principles

The project currently follows a deliberately conservative workflow:

1. one logical change at a time;
2. runtime-test the affected Raycast surface;
3. run `npm test`;
4. run `npx tsc --noEmit`;
5. checkpoint known-good builds before the next change.

This is intentional: calendar data and long-running menu-bar workers deserve cautious changes.

## License

MIT
