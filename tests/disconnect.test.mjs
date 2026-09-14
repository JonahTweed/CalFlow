import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import { test } from "node:test";

function harness() {
  const stores = new Map();
  const listeners = new Map();
  const launches = [];
  let tokens = { accessToken: "account-a" };
  let confirmed = true;
  let pendingSchedule;
  let scheduleCalls = 0;
  const settings = { onlyMeetings: false, eventCount: 10, dateStyle: "day-month", rowLayout: "title-first" };
  const ui = new Proxy({}, { get: (_, key) => key });
  const api = {
    Cache: class {
      constructor({ namespace }) { this.name = namespace; if (!stores.has(namespace)) stores.set(namespace, new Map()); }
      get(key) { return stores.get(this.name).get(key); }
      set(key, value) { stores.get(this.name).set(key, value); for (const fn of listeners.get(this.name) || []) fn(key, value); }
      clear() { stores.get(this.name).clear(); }
      subscribe(fn) { const list = listeners.get(this.name) || new Set(); listeners.set(this.name, list); list.add(fn); return () => list.delete(fn); }
    },
    Icon: ui, Color: ui, MenuBarExtra: ui, Alert: { ActionStyle: ui }, Toast: { Style: ui },
    LaunchType: { Background: "background", UserInitiated: "user" }, environment: { launchType: "background" },
    getPreferenceValues: () => ({ menuBarMode: "always", calendarSelectionMode: "all" }),
    launchCommand: async (options) => launches.push(options), confirmAlert: async () => confirmed,
    showHUD: async () => {}, showToast: async () => {},
  };
  let active;
  const react = {
    useState(initial) { const i = active.index++; const owner = active; if (!(i in owner.state)) owner.state[i] = typeof initial === "function" ? initial() : initial; return [owner.state[i], (value) => { owner.state[i] = value; }]; },
    useRef(initial) { return react.useState(() => ({ current: initial }))[0]; },
    useCallback(fn) { return fn; }, useMemo(fn) { return fn(); },
    useEffect(fn) { if (active.first) active.effects.push(fn); },
  };
  const oauth = { client: { getTokens: async () => tokens, removeTokens: async () => { tokens = null; } } };
  const h = (type, props, ...children) => ({ type, props: props || {}, children: children.flat(Infinity).filter(Boolean) });
  const modules = {
    "@raycast/api": api, react,
    "@raycast/utils": { withAccessToken: () => (component) => component },
    "./lib/google-oauth": { googleOAuth: oauth },
    "./event-actions": {},
    "./lib/google": { currentGoogleConnectionFingerprint: () => "account-a" },
    "./lib/calendar-settings": { isCalendarSetupComplete: async () => true },
    "./lib/menu-bar-display-settings": { DEFAULT_MENU_BAR_DISPLAY_SETTINGS: settings, normaliseMenuBarDisplaySettings: (s) => s, readMenuBarDisplaySettings: async () => settings },
    "./lib/schedule": {
      loadSchedule: async () => { scheduleCalls++; return pendingSchedule; },
      isAllDay: () => false, eventStartMillis: (item) => Date.parse(item.event.start.dateTime), eventEndMillis: (item) => Date.parse(item.event.end.dateTime),
    },
    "node:crypto": { randomUUID: () => "disconnected-revision" },
  };
  function load(file, extra = "") {
    const exports = {};
    const code = ts.transpileModule(fs.readFileSync(new URL(`../${file}`, import.meta.url), "utf8") + extra, {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.React, jsxFactory: "h" },
    }).outputText;
    vm.runInNewContext(code, { exports, require: (name) => { assert.ok(name in modules, name); return modules[name]; }, h });
    return exports;
  }
  const session = load("src/lib/menu-bar-session.ts");
  modules["./lib/menu-bar-session"] = session;
  const menu = load("src/menu-bar.tsx", "\nexport { Command, SignedOutMenuBar };\n");
  const disconnect = load("src/disconnect-google.ts").default;
  function mount(component, props = {}) {
    const owner = { state: [], effects: [], first: true };
    return {
      render() { active = owner; owner.index = 0; const tree = component(props); owner.first = false; return tree; },
      effects() { return owner.effects.splice(0).map((fn) => fn()); },
      state: owner.state,
    };
  }
  return { menu, disconnect, mount, launches, stores, session,
    setTokens: (value) => { tokens = value; }, setConfirmed: (value) => { confirmed = value; },
    setSchedule: (value) => { pendingSchedule = value; }, scheduleCalls: () => scheduleCalls,
  };
}
const flush = async () => { for (let i = 0; i < 20; i++) await Promise.resolve(); };
const stale = { calendar: { id: "primary" }, event: { id: "old", summary: "Private stale event", start: { dateTime: "2099-09-14T12:00:00Z" }, end: { dateTime: "2099-09-14T13:00:00Z" } } };

test("Disconnect unmounts an authenticated menu, clears snapshots, and launches an immediate signed-out render", async () => {
  const t = harness();
  t.stores.get("calendar-shortcuts-menu-bar").set("schedule-snapshot-v3:account-a", JSON.stringify({ updatedAt: Date.now(), setupComplete: true, events: [stale] }));
  const shell = t.mount(t.menu.default);
  shell.render(); shell.effects(); await flush();
  assert.equal(shell.render().type, t.menu.Command);
  await t.disconnect(); await flush();
  assert.equal(shell.render().type, t.menu.SignedOutMenuBar);
  assert.equal(t.stores.get("calendar-shortcuts-menu-bar").size, 0);
  assert.equal(t.launches.at(-1).name, "menu-bar");
  assert.equal(t.launches.at(-1).type, "background");
  const tree = t.menu.SignedOutMenuBar();
  assert.equal(tree.props.title, undefined);
  assert.equal(tree.props.icon.source, "Calendar");
  assert.equal(tree.children.length, 1);
  assert.equal(tree.children[0].props.title, "DayCal");
  const items = tree.children[0].children;
  assert.equal(items.length, 1);
  assert.equal(items[0].props.title, "Set Up Calendars");
  await items[0].props.onAction();
  assert.equal(t.launches.at(-1).name, "set-up-calendars");
  assert.equal(t.launches.at(-1).type, "user");
});

test("An event request completing after disconnect cannot restore memory or disk events", async () => {
  const t = harness();
  let finish;
  t.setSchedule(new Promise((resolve) => { finish = resolve; }));
  const child = t.mount(t.menu.Command);
  child.render(); child.effects(); await flush();
  assert.equal(t.scheduleCalls(), 1);
  await t.disconnect();
  finish({ events: [stale] }); await flush();
  assert.equal(t.stores.get("calendar-shortcuts-menu-bar").size, 0);
  assert.ok(!JSON.stringify(child.state).includes("Private stale event"));
});

test("Already disconnected clears stale snapshots and refreshes without authorizing", async () => {
  const t = harness(); t.setTokens(null);
  t.stores.get("calendar-shortcuts-menu-bar").set("stale", "private events");
  await t.disconnect();
  const shell = t.mount(t.menu.default);
  shell.render(); shell.effects(); await flush();
  assert.equal(shell.render().type, t.menu.SignedOutMenuBar);
  assert.equal(t.stores.get("calendar-shortcuts-menu-bar").size, 0);
  assert.equal(t.launches.length, 1);
  assert.equal(t.scheduleCalls(), 0);
});

test("Cancelling disconnect preserves connection and cached events", async () => {
  const t = harness(); t.setConfirmed(false);
  t.stores.get("calendar-shortcuts-menu-bar").set("stale", "events");
  await t.disconnect();
  assert.equal(t.session.menuBarSessionRevision(), "initial");
  assert.equal(t.stores.get("calendar-shortcuts-menu-bar").size, 1);
  assert.equal(t.launches.length, 0);
});

test("Reconnection permits the authenticated child again", async () => {
  const t = harness(); await t.disconnect(); t.setTokens({ accessToken: "account-b" });
  const shell = t.mount(t.menu.default);
  shell.render(); shell.effects(); await flush();
  assert.equal(shell.render().type, t.menu.Command);
});
