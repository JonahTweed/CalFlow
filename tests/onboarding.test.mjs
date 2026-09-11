import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const setupPath = path.join(root, "src", "lib", "calendar-setup-view.tsx");
const commandPath = path.join(root, "src", "set-up-calendars.tsx");
const packagePath = path.join(root, "package.json");
const schedulePath = path.join(root, "src", "schedule.tsx");
const replayPath = path.join(root, "src", "reset-onboarding.ts");

const setup = fs.readFileSync(setupPath, "utf8");
const command = fs.readFileSync(commandPath, "utf8");
const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));
const schedule = fs.readFileSync(schedulePath, "utf8");
const replay = fs.readFileSync(replayPath, "utf8");

const checks = [];
function check(name, pass, detail) {
  checks.push({ name, pass, detail });
}

check(
  "Three-step setup flow",
  setup.includes('Set Up Your Calendars · 1 of 3') &&
    setup.includes('Set Up Your Calendars · 2 of 3') &&
    setup.includes('Set Up Your Calendars · 3 of 3'),
  "Roles, visibility and optional routing are separated into focused steps.",
);

check(
  "Personal calendar remains required",
  setup.includes('title: "Choose a Personal calendar"') &&
    setup.includes("Personal is the fallback calendar for Quick Add events."),
  "The required Quick Add fallback guard remains present.",
);

check(
  "Existing account selections are preserved",
  setup.includes("existingScheduleEnabled ?? visibleCalendarIds") &&
    setup.includes("existingMenuBarEnabled ?? visibleCalendarIds"),
  "Existing per-account Schedule/Menu Bar choices win; Google-visible calendars are only the first-run fallback.",
);

check(
  "Schedule and Menu Bar are independently selectable",
  setup.includes('id="scheduleCalendars"') &&
    setup.includes('id="menuBarCalendars"') &&
    setup.includes("setScheduleEnabledCalendarIds(scheduleCalendars)") &&
    setup.includes("setMenuBarEnabledCalendarIds(menuBarCalendars)"),
  "The onboarding flow saves separate account-scoped calendar lists.",
);

check(
  "Role and routing storage remain account scoped",
  setup.includes("setCalendarRoles(roles)") &&
    setup.includes("setRoutingKeywords(keywordMap)") &&
    setup.includes("markCalendarSetupComplete()"),
  "Setup continues through the existing account-scoped storage helpers.",
);

check(
  "Setup refreshes Menu Bar once",
  setup.includes('name: "menu-bar"') &&
    setup.includes('context: { refreshMode: "full" }'),
  "Finishing setup asks the real Menu Bar pipeline for one full refresh.",
);

check(
  "Native OAuth error path has no Google Cloud credential instructions",
  !setup.includes("console.cloud.google.com/apis/credentials") &&
    setup.includes('name: "check-connection"'),
  "Errors now offer retry/connection diagnostics instead of legacy manual OAuth setup.",
);

check(
  "Raycast preferences stay accessible",
  setup.includes("openExtensionPreferences") && setup.includes("⌘⇧P"),
  "Extension-level preferences remain available without duplicating their storage.",
);

const selectionPreference = pkg.preferences.find(
  (preference) => preference.name === "calendarSelectionMode",
);
check(
  "Fresh installs default to Custom Enabled Calendars",
  selectionPreference?.default === "custom",
  "The onboarding calendar pickers are active by default for new installs without overwriting existing preferences.",
);


check(
  "Schedule routes incomplete accounts to dedicated setup",
  schedule.includes('name: "set-up-calendars"') &&
    schedule.includes("setupComplete !== false") &&
    !schedule.includes("<CalendarSetupView"),
  "After Native OAuth, an account with unfinished setup is sent to Set Up Calendars instead of embedding onboarding inside Schedule.",
);

check(
  "Schedule auto-route does not keep a setup polling loop alive",
  !schedule.includes("isCalendarSetupComplete().then((complete)") &&
    !schedule.includes("}, 500)"),
  "The originating Schedule command becomes idle after routing; the setup completion screen opens a fresh Schedule instead of polling in the background.",
);

check(
  "Schedule Native OAuth error path has no legacy Google Cloud setup link",
  !schedule.includes("console.cloud.google.com/apis/credentials") &&
    schedule.includes('name: "check-connection"'),
  "Schedule errors point to the Native OAuth connection diagnostic rather than the removed manual credential flow.",
);
check(
  "Dedicated setup command has useful next actions",
  command.includes('title="Open Schedule"') &&
    command.includes('title="Calendar Settings"') &&
    command.includes('title="Enabled Calendars"'),
  "Finishing the dedicated setup command leads directly to the main product surfaces.",
);


check(
  "Development setup replay preserves saved choices",
  replay.includes("getScheduleEnabledCalendarIds") &&
    replay.includes("getMenuBarEnabledCalendarIds") &&
    replay.includes("getCalendarRoles") &&
    replay.includes("getRoutingKeywords") &&
    replay.includes("setScheduleEnabledCalendarIds") &&
    replay.includes("setMenuBarEnabledCalendarIds") &&
    replay.includes("setCalendarRoles") &&
    replay.includes("setRoutingKeywords"),
  "Replaying onboarding snapshots and restores the connected account's saved setup instead of wiping it.",
);

const replayCommand = pkg.commands.find((item) => item.name === "reset-onboarding");
check(
  "Development command is labelled Replay, not Reset",
  replayCommand?.title === "Replay Calendar Setup" &&
    replayCommand?.description?.includes("keeping saved calendar choices"),
  "The development helper no longer implies that it is safe to wipe an account's configuration during onboarding tests.",
);

console.log("\nCalFlow onboarding contract\n");
for (const item of checks) {
  console.log(`${item.pass ? "✅" : "❌"} ${item.name}`);
  console.log(`   ${item.detail}`);
}

const failed = checks.filter((item) => !item.pass);
console.log("");
if (failed.length) {
  console.error(`❌ ${failed.length}/${checks.length} onboarding checks failed`);
  process.exit(1);
}

console.log(`✅ ${checks.length}/${checks.length} onboarding checks passed`);
