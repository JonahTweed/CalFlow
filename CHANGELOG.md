# Changelog

## 0.15.0 Public Beta Candidate — 2026-09-13

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
