# CalFlow Privacy Policy

**Effective date:** 12 September 2026

CalFlow is a Google Calendar extension for Raycast. Privacy and security are core design priorities: CalFlow is built to work directly between Raycast on your Mac and Google Calendar, without a CalFlow-operated backend service.

## Summary

- CalFlow does **not** operate a server that receives your calendar data.
- CalFlow does **not** sell user data.
- CalFlow does **not** use calendar data for advertising, profiling, analytics, tracking, or training AI/ML models.
- Google OAuth tokens are managed by Raycast.
- Calendar preferences, account-scoped configuration, and a local menu-bar event cache are stored locally through Raycast on your Mac.
- CalFlow requests only the Google Calendar scopes needed for its visible calendar features.

## Google data CalFlow accesses

CalFlow currently requests these Google OAuth scopes:

- `https://www.googleapis.com/auth/calendar.events` — read and manage calendar events;
- `https://www.googleapis.com/auth/calendar.calendarlist.readonly` — read the user's calendar list, calendar colours, and access roles.

Depending on the feature you use, CalFlow may access Google Calendar information such as:

- calendar names, colours, IDs, and access roles;
- event titles, dates, start/end times, and all-day status;
- event descriptions and locations;
- organiser/attendee metadata and response status;
- conference/meeting links;
- reminders, recurrence information, source links, and attachment metadata when present.

CalFlow uses this information only to provide user-facing calendar features such as Schedule, Menu Bar, Quick Add, editing, copying, moving, deleting, calendar routing, meeting links, and permission-aware event actions.

## How Google data is transmitted

Calendar API requests are made directly from the Raycast extension to the Google Calendar API at `www.googleapis.com` using the Google OAuth access token supplied by Raycast.

CalFlow does not proxy those requests through a CalFlow-owned server.

When you explicitly choose actions such as **Open Event**, **Open Location**, or **Join Meeting**, CalFlow may open the relevant Google Calendar, maps, conferencing, or other event-provided URL in the app or browser you selected. Those destinations then operate under their own privacy policies.

## Local storage on your Mac

CalFlow stores some information locally through Raycast so the extension can remember your choices and remain responsive.

This can include:

- extension preferences;
- account-scoped calendar role mappings;
- Schedule and Menu Bar calendar selections;
- optional routing keywords;
- menu-bar display settings;
- a local cached snapshot of upcoming calendar events used to render the persistent Menu Bar efficiently without contacting Google every time you open it.

This local event cache can contain calendar event information returned by Google. It is used only for CalFlow's local UI and refresh behaviour.

CalFlow does not intentionally transmit this locally stored configuration or cache to the developer.

## OAuth tokens

Google OAuth authentication is provided through Raycast's native OAuth support. CalFlow does not contain a Google client secret, refresh token, or access token in its public source repository.

The public OAuth client ID is included in the source code because OAuth client IDs are application identifiers, not secrets.

CalFlow does not log or intentionally transmit OAuth tokens to the developer.

## Disconnecting and revoking access

The **Disconnect Google Calendar** command:

- removes CalFlow's locally stored Google OAuth tokens through Raycast;
- clears CalFlow's local Menu Bar event cache;
- intentionally keeps Raycast preferences, calendar selections, role mappings, and routing keywords so they are available if you reconnect later.

Disconnecting inside CalFlow does **not** revoke the app's authorization in your Google Account. You can separately revoke Google access from your Google Account's third-party access/security settings.

A dedicated one-step command for clearing all remaining CalFlow local configuration is planned before the full public release. Until then, CalFlow is transparent that Disconnect preserves those settings rather than silently deleting them.

## Analytics, advertising, and tracking

CalFlow currently includes no CalFlow-operated analytics, advertising SDK, behavioural tracking, telemetry service, or crash-reporting service that sends calendar data to the developer.

CalFlow does not sell, rent, or trade Google user data or CalFlow user data.

CalFlow does not use Google user data for advertising, credit decisions, or training generalized AI or machine-learning models.

## Human access to calendar data

The developer does not receive or routinely have access to your calendar data through CalFlow.

If you choose to submit a GitHub issue, screenshot, screen recording, log, or other diagnostic information, that information is provided voluntarily by you. Please redact private event details, email addresses, private calendar links, OAuth tokens, and other credentials before posting publicly.

Security-sensitive reports should follow [SECURITY.md](SECURITY.md) instead of being posted publicly.

## Google API Services User Data Policy

CalFlow's use and transfer of information received from Google APIs will adhere to the **Google API Services User Data Policy**, including the **Limited Use** requirements.

CalFlow requests Google data only for features that are visible to and initiated for the benefit of the user, and does not use that data for unrelated purposes.

## Data sharing

CalFlow does not share Google Calendar data with advertisers, data brokers, or unrelated third parties.

Data may be handled by the services required to provide the extension's functionality, principally:

- **Google**, which provides Google Calendar and the Google Calendar API;
- **Raycast**, which provides the extension runtime, native OAuth handling, and local extension storage.

Any additional external destination is opened only when you explicitly trigger an action such as opening a map, conference link, event source link, or calendar page.

## Security

CalFlow is open source so its Google API usage and local data handling can be inspected publicly.

The project aims to use the minimum Google scopes required for its current features, avoids embedding secrets in the repository, distinguishes writable/owned events from guest or read-only events, and runs automated regression and TypeScript checks on changes.

See [SECURITY.md](SECURITY.md) for vulnerability reporting guidance.

## Changes to this policy

If CalFlow's data handling changes materially, this policy will be updated before or alongside that change. The effective date at the top of this document will be revised when appropriate.

## Contact

For privacy questions that do not contain sensitive information, use the CalFlow GitHub repository or contact the maintainer through the GitHub profile.

For suspected vulnerabilities or anything involving credentials or private calendar data, follow the private reporting guidance in [SECURITY.md](SECURITY.md).
