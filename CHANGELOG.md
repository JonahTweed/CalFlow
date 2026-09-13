# Changelog

## Unreleased

- Renamed extension display text, manifest branding, icons and current documentation to DayCal. Existing command identifiers, account-scoped storage, OAuth configuration and repository URLs are unchanged.
- Replaced the website Schedule mockup with a real demo screenshot, added the Menu Bar screenshot, and added a shared enlargement overlay with close, Escape and backdrop dismissal. The Menu Bar capture shows the renamed DayCal interface.

## 0.15.0 Public Beta Candidate — 2026-09-13

- Added the DayCal static website, privacy and security pages in `docs/` for free GitHub Pages hosting at `daycal.co.uk`. Website branding introduces DayCal without renaming the repository or changing extension behaviour, OAuth or compatibility identifiers.
- Explicit first-run Calendar Menu Bar launches now open Set Up Calendars for incomplete accounts. Background launches stay quiet and retain the setup action, without polling or repeated automatic redirect attempts. Schedule first-run routing is unchanged.
- Promoted Copy to Calendar into the Menu Bar transfer slot for ordinary writable recurring events, preserving supported one-off Move actions and existing meeting/location shortcuts. More Actions omits Copy only when promoted; recurring-event Move support was not added.
- Added regression coverage for Menu Bar setup launch modes, stale setup snapshots, redirect failures, event submenu permissions and Move/Copy placement. Both UX improvements were locally runtime-verified by the maintainer.
- Fixed and verified setup persistence, including changed selections, routing keywords, and intentional clearing.
- Serialized LocalStorage writes to prevent partial setup saves.
- Open Event now opens account-aware event links in the default browser.
- Open Calendar now opens the connected account’s calendar view in the default browser.
- Removed the unused app-opening preference.
- Corrected display of multi-day all-day events that are active today.
- Compacted and truncated long menu-bar event titles cleanly.
- Refined Smart Status wording to describe only the filtered, visible view.
- Added menu-row and event-opening regression tests.

## 0.14.0 Beta Candidate — 2026-09-11

First public GitHub beta candidate.

Highlights include:

- Native Google OAuth through Raycast
- Schedule and persistent Menu Bar
- Guided first-run calendar setup
- Account-scoped role mappings and calendar selections
- Timed and true all-day Quick Add
- Safe timed and all-day event editing
- Move / Copy / Delete permission handling
- Automatic Schedule/Menu Bar refresh wiring
- Runtime refresh diagnostics
- Consistent, filtered-view-aware Smart Status
- Safer Start/End DatePicker handling

Earlier development versions were private recovery/stabilisation checkpoints and are intentionally not reproduced as public release history.
