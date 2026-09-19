/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {
  /** Schedule Range - How far ahead Schedule should load. */
  "daysAhead": "7" | "14" | "30" | "60",
  /** Declined Events - Hide invitations that you have declined. */
  "hideDeclined": boolean,
  /** Calendar Selection Mode - Choose which calendars DayCal uses. Custom is managed with the Enabled Calendars command. */
  "calendarSelectionMode": "custom" | "google" | "all",
  /** Show Events in Menu Bar - Choose when DayCal should appear in the macOS menu bar. */
  "menuBarMode": "never" | "2" | "5" | "10" | "15" | "30" | "60" | "upcoming" | "always",
  /** Menu Bar Headline - Choose whether the menu bar shows smart timing status or only the current/next event title. */
  "menuBarHeadlineStyle": "smart" | "event-only"
}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `schedule` command */
  export type Schedule = ExtensionPreferences & {}
  /** Preferences accessible in the `enabled-calendars` command */
  export type EnabledCalendars = ExtensionPreferences & {}
  /** Preferences accessible in the `set-up-calendars` command */
  export type SetUpCalendars = ExtensionPreferences & {}
  /** Preferences accessible in the `add-personal-event` command */
  export type AddPersonalEvent = ExtensionPreferences & {}
  /** Preferences accessible in the `add-shared-event` command */
  export type AddSharedEvent = ExtensionPreferences & {}
  /** Preferences accessible in the `add-work-event` command */
  export type AddWorkEvent = ExtensionPreferences & {}
  /** Preferences accessible in the `menu-bar-settings` command */
  export type MenuBarSettings = ExtensionPreferences & {}
  /** Preferences accessible in the `menu-bar` command */
  export type MenuBar = ExtensionPreferences & {}
  /** Preferences accessible in the `disconnect-google` command */
  export type DisconnectGoogle = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `schedule` command */
  export type Schedule = {}
  /** Arguments passed to the `enabled-calendars` command */
  export type EnabledCalendars = {}
  /** Arguments passed to the `set-up-calendars` command */
  export type SetUpCalendars = {}
  /** Arguments passed to the `add-personal-event` command */
  export type AddPersonalEvent = {
  /** Event title */
  "title": string,
  /** When: tomorrow, Friday, next Thu 5pm */
  "when": string,
  /** 3d / 45m @ Location / Zoom / URL */
  "details": string
}
  /** Arguments passed to the `add-shared-event` command */
  export type AddSharedEvent = {
  /** Event title */
  "title": string,
  /** When: tomorrow, Friday, next Thu 5pm */
  "when": string,
  /** 3d / 45m @ Location / Zoom / URL */
  "details": string
}
  /** Arguments passed to the `add-work-event` command */
  export type AddWorkEvent = {
  /** Event title */
  "title": string,
  /** When: tomorrow, Friday, next Thu 5pm */
  "when": string,
  /** 3d / 45m @ Location / Zoom / URL */
  "details": string
}
  /** Arguments passed to the `menu-bar-settings` command */
  export type MenuBarSettings = {}
  /** Arguments passed to the `menu-bar` command */
  export type MenuBar = {}
  /** Arguments passed to the `disconnect-google` command */
  export type DisconnectGoogle = {}
}

