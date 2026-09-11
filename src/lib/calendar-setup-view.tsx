import {
  Action,
  ActionPanel,
  Color,
  Form,
  Icon,
  LaunchType,
  Toast,
  getPreferenceValues,
  launchCommand,
  openExtensionPreferences,
  showToast,
} from "@raycast/api";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarRoleMap,
  CalendarSelectionMode,
  RoutingKeywordMap,
  calendarEntryDisplayName,
  defaultRoleSelections,
  formatKeywordList,
  getCalendarRoles,
  getMenuBarEnabledCalendarIds,
  getRoutingKeywords,
  getScheduleEnabledCalendarIds,
  googleVisibleCalendarIds,
  markCalendarSetupComplete,
  parseKeywordList,
  setCalendarRoles,
  setMenuBarEnabledCalendarIds,
  setRoutingKeywords,
  setScheduleEnabledCalendarIds,
} from "./calendar-settings";
import { isWritable, listCalendars } from "./google";
import { GoogleCalendarEntry } from "./types";

const NONE = "__none__";

type SetupStep = 1 | 2 | 3;

type RoleValues = {
  personalCalendar: string;
  workCalendar: string;
  sharedCalendar: string;
  familyCalendar: string;
};

type VisibilityValues = {
  scheduleCalendars: string[];
  menuBarCalendars: string[];
};

type KeywordValues = {
  personalKeywords: string;
  workKeywords: string;
  sharedKeywords: string;
  familyKeywords: string;
};

interface Preferences {
  calendarSelectionMode: CalendarSelectionMode;
}

type Props = {
  onComplete?: () => void | Promise<void>;
};

function roleMapFromValues(values: RoleValues): CalendarRoleMap {
  return {
    personal: values.personalCalendar,
    ...(values.workCalendar !== NONE ? { work: values.workCalendar } : {}),
    ...(values.sharedCalendar !== NONE
      ? { shared: values.sharedCalendar }
      : {}),
    ...(values.familyCalendar !== NONE
      ? { family: values.familyCalendar }
      : {}),
  };
}

function selectionModeLabel(mode: CalendarSelectionMode): string {
  switch (mode) {
    case "custom":
      return "Custom Enabled Calendars";
    case "google":
      return "Google Calendar Visibility";
    case "all":
      return "All Calendars";
  }
}

async function refreshMenuBar(): Promise<void> {
  try {
    await launchCommand({
      name: "menu-bar",
      type: LaunchType.Background,
      context: { refreshMode: "full" },
    });
  } catch {
    // Non-fatal: the menu bar may be disabled or already relaunching.
  }
}

export function CalendarSetupView({ onComplete }: Props) {
  const preferences = getPreferenceValues<Preferences>();
  const [step, setStep] = useState<SetupStep>(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [calendars, setCalendars] = useState<GoogleCalendarEntry[]>([]);
  const [roles, setRoles] = useState<CalendarRoleMap>({});
  const [keywords, setKeywords] = useState<RoutingKeywordMap>({});
  const [scheduleCalendars, setScheduleCalendars] = useState<string[]>([]);
  const [menuBarCalendars, setMenuBarCalendars] = useState<string[]>([]);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [allCalendars, savedRoles, savedKeywords, existingScheduleEnabled, existingMenuBarEnabled] =
        await Promise.all([
          listCalendars(),
          getCalendarRoles(),
          getRoutingKeywords(),
          getScheduleEnabledCalendarIds(),
          getMenuBarEnabledCalendarIds(),
        ]);

      const readableCalendars = allCalendars.filter(
        (calendar) => calendar.accessRole !== "none",
      );
      const writableCalendars = readableCalendars.filter(isWritable);
      const visibleCalendarIds = googleVisibleCalendarIds(readableCalendars);

      setCalendars(readableCalendars);
      setRoles(
        Object.keys(savedRoles).length
          ? savedRoles
          : defaultRoleSelections(writableCalendars),
      );
      setKeywords(savedKeywords);
      setScheduleCalendars(existingScheduleEnabled ?? visibleCalendarIds);
      setMenuBarCalendars(existingMenuBarEnabled ?? visibleCalendarIds);
      setStep(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const writableCalendars = useMemo(
    () =>
      calendars
        .filter(isWritable)
        .slice()
        .sort((a, b) =>
          calendarEntryDisplayName(a).localeCompare(calendarEntryDisplayName(b)),
        ),
    [calendars],
  );

  const readableCalendars = useMemo(
    () =>
      calendars
        .slice()
        .sort((a, b) =>
          calendarEntryDisplayName(a).localeCompare(calendarEntryDisplayName(b)),
        ),
    [calendars],
  );

  async function continueFromRoles(values: RoleValues) {
    if (values.personalCalendar === NONE) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Choose a Personal calendar",
        message: "Personal is the fallback calendar for Quick Add events.",
      });
      return;
    }

    setRoles(roleMapFromValues(values));
    setStep(2);
  }

  function continueFromVisibility(values: VisibilityValues) {
    setScheduleCalendars(values.scheduleCalendars);
    setMenuBarCalendars(values.menuBarCalendars);
    setStep(3);
  }

  async function save(values: KeywordValues) {
    const personalCalendar = roles.personal;
    if (!personalCalendar) {
      setStep(1);
      await showToast({
        style: Toast.Style.Failure,
        title: "Choose a Personal calendar",
      });
      return;
    }

    const keywordMap: RoutingKeywordMap = {
      personal: parseKeywordList(values.personalKeywords),
      work: parseKeywordList(values.workKeywords),
      shared: parseKeywordList(values.sharedKeywords),
      family: parseKeywordList(values.familyKeywords),
    };

    setIsSaving(true);
    try {
      await Promise.all([
        setCalendarRoles(roles),
        setRoutingKeywords(keywordMap),
        setScheduleEnabledCalendarIds(scheduleCalendars),
        setMenuBarEnabledCalendarIds(menuBarCalendars),
      ]);

      setKeywords(keywordMap);
      await markCalendarSetupComplete();
      void refreshMenuBar();

      await showToast({
        style: Toast.Style.Success,
        title: "Calendar setup saved",
        message: "CalFlow is ready to use.",
      });
      await onComplete?.();
    } catch (err) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Could not save calendar setup",
        message: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <Form navigationTitle="Set Up Your Calendars" isLoading>
        <Form.Description
          title="Loading Google Calendars"
          text="Reading the calendars available to this Google account…"
        />
      </Form>
    );
  }

  if (error) {
    return (
      <Form
        navigationTitle="Set Up Your Calendars"
        actions={
          <ActionPanel>
            <Action
              title="Retry Loading Calendars"
              icon={Icon.ArrowClockwise}
              onAction={() => void load()}
            />
            <Action
              title="Check Google Calendar Connection"
              icon={Icon.Link}
              onAction={() =>
                launchCommand({
                  name: "check-connection",
                  type: LaunchType.UserInitiated,
                })
              }
            />
          </ActionPanel>
        }
      >
        <Form.Description
          title="Could Not Load Google Calendars"
          text={`${error}\n\nYour Raycast Google sign-in is kept separate from CalFlow settings. Retry first, or check the connection for more detail.`}
        />
      </Form>
    );
  }

  if (step === 1) {
    return (
      <Form
        navigationTitle="Set Up Your Calendars · 1 of 3"
        actions={
          <ActionPanel>
            <Action.SubmitForm
              title="Continue"
              icon={Icon.ArrowRight}
              onSubmit={continueFromRoles}
            />
          </ActionPanel>
        }
      >
        <Form.Description
          title="1. Choose Calendar Roles"
          text="Tell CalFlow which writable calendar should be used for Personal, Work, Shared / Partner and Family events. Personal is required; the other roles are optional."
        />

        <Form.Dropdown
          id="personalCalendar"
          title="Personal"
          value={roles.personal || NONE}
          onChange={(value) =>
            setRoles((current) => ({
              ...current,
              personal: value === NONE ? undefined : value,
            }))
          }
        >
          <Form.Dropdown.Item
            value={NONE}
            title="Not Used"
            icon={{ source: Icon.Circle, tintColor: Color.SecondaryText }}
          />
          {writableCalendars.map((calendar) => (
            <Form.Dropdown.Item
              key={calendar.id}
              value={calendar.id}
              title={calendarEntryDisplayName(calendar)}
              icon={{
                source: Icon.Circle,
                tintColor: calendar.backgroundColor || Color.SecondaryText,
              }}
            />
          ))}
        </Form.Dropdown>

        <Form.Dropdown
          id="workCalendar"
          title="Work"
          value={roles.work || NONE}
          onChange={(value) =>
            setRoles((current) => ({
              ...current,
              work: value === NONE ? undefined : value,
            }))
          }
        >
          <Form.Dropdown.Item
            value={NONE}
            title="Not Used"
            icon={{ source: Icon.Circle, tintColor: Color.SecondaryText }}
          />
          {writableCalendars.map((calendar) => (
            <Form.Dropdown.Item
              key={calendar.id}
              value={calendar.id}
              title={calendarEntryDisplayName(calendar)}
              icon={{
                source: Icon.Circle,
                tintColor: calendar.backgroundColor || Color.SecondaryText,
              }}
            />
          ))}
        </Form.Dropdown>

        <Form.Dropdown
          id="sharedCalendar"
          title="Shared / Partner"
          value={roles.shared || NONE}
          onChange={(value) =>
            setRoles((current) => ({
              ...current,
              shared: value === NONE ? undefined : value,
            }))
          }
        >
          <Form.Dropdown.Item
            value={NONE}
            title="Not Used"
            icon={{ source: Icon.Circle, tintColor: Color.SecondaryText }}
          />
          {writableCalendars.map((calendar) => (
            <Form.Dropdown.Item
              key={calendar.id}
              value={calendar.id}
              title={calendarEntryDisplayName(calendar)}
              icon={{
                source: Icon.Circle,
                tintColor: calendar.backgroundColor || Color.SecondaryText,
              }}
            />
          ))}
        </Form.Dropdown>

        <Form.Dropdown
          id="familyCalendar"
          title="Family"
          value={roles.family || NONE}
          onChange={(value) =>
            setRoles((current) => ({
              ...current,
              family: value === NONE ? undefined : value,
            }))
          }
        >
          <Form.Dropdown.Item
            value={NONE}
            title="Not Used"
            icon={{ source: Icon.Circle, tintColor: Color.SecondaryText }}
          />
          {writableCalendars.map((calendar) => (
            <Form.Dropdown.Item
              key={calendar.id}
              value={calendar.id}
              title={calendarEntryDisplayName(calendar)}
              icon={{
                source: Icon.Circle,
                tintColor: calendar.backgroundColor || Color.SecondaryText,
              }}
            />
          ))}
        </Form.Dropdown>
      </Form>
    );
  }

  if (step === 2) {
    const modeIsCustom = preferences.calendarSelectionMode === "custom";

    return (
      <Form
        navigationTitle="Set Up Your Calendars · 2 of 3"
        actions={
          <ActionPanel>
            <Action.SubmitForm
              title="Continue"
              icon={Icon.ArrowRight}
              onSubmit={continueFromVisibility}
            />
            <Action
              title="Back"
              icon={Icon.ArrowLeft}
              onAction={() => setStep(1)}
            />
          </ActionPanel>
        }
      >
        <Form.Description
          title="2. Choose What You See"
          text={
            modeIsCustom
              ? "Schedule and the Menu Bar can show different calendars. Choose the calendars you want in each place."
              : `Your Calendar Selection Mode is currently “${selectionModeLabel(preferences.calendarSelectionMode)}”. These custom selections will still be saved and will be ready if you switch to Custom Enabled Calendars later.`
          }
        />

        <Form.TagPicker
          id="scheduleCalendars"
          title="Schedule Calendars"
          placeholder="Choose calendars for Schedule"
          value={scheduleCalendars}
          onChange={setScheduleCalendars}
        >
          {readableCalendars.map((calendar) => (
            <Form.TagPicker.Item
              key={calendar.id}
              value={calendar.id}
              title={calendarEntryDisplayName(calendar)}
              icon={{
                source: Icon.Circle,
                tintColor: calendar.backgroundColor || Color.SecondaryText,
              }}
            />
          ))}
        </Form.TagPicker>

        <Form.TagPicker
          id="menuBarCalendars"
          title="Menu Bar Calendars"
          placeholder="Choose calendars for the Menu Bar"
          value={menuBarCalendars}
          onChange={setMenuBarCalendars}
        >
          {readableCalendars.map((calendar) => (
            <Form.TagPicker.Item
              key={calendar.id}
              value={calendar.id}
              title={calendarEntryDisplayName(calendar)}
              icon={{
                source: Icon.Circle,
                tintColor: calendar.backgroundColor || Color.SecondaryText,
              }}
            />
          ))}
        </Form.TagPicker>
      </Form>
    );
  }

  return (
    <Form
      navigationTitle="Set Up Your Calendars · 3 of 3"
      isLoading={isSaving}
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Finish Setup"
            icon={Icon.Checkmark}
            onSubmit={save}
          />
          <Action
            title="Back"
            icon={Icon.ArrowLeft}
            onAction={() => setStep(2)}
          />
          <Action
            title="Open Extension Preferences"
            icon={Icon.Gear}
            shortcut={{ modifiers: ["cmd", "shift"], key: "p" }}
            onAction={openExtensionPreferences}
          />
        </ActionPanel>
      }
    >
      <Form.Description
        title="3. Optional Routing Keywords"
        text="Add names or words that are specific to you. Separate multiple keywords with commas. Generic rules such as dentist → Personal and client → Work are already included, so you can leave these blank."
      />

      <Form.TextField
        id="personalKeywords"
        title="Personal Keywords"
        defaultValue={formatKeywordList(keywords.personal)}
        placeholder="e.g. Study"
      />
      <Form.TextField
        id="workKeywords"
        title="Work Keywords"
        defaultValue={formatKeywordList(keywords.work)}
        placeholder="e.g. Acme, project codename"
      />
      <Form.TextField
        id="sharedKeywords"
        title="Shared Keywords"
        defaultValue={formatKeywordList(keywords.shared)}
        placeholder="e.g. partner's name"
      />
      <Form.TextField
        id="familyKeywords"
        title="Family Keywords"
        defaultValue={formatKeywordList(keywords.family)}
        placeholder="e.g. family surname"
      />

      <Form.Separator />
      <Form.Description
        title="Raycast Preferences"
        text="Schedule range, the app used to open Google Calendar, declined-event handling, Calendar Selection Mode and Menu Bar headline/timing remain normal Raycast extension preferences. You can change them at any time with ⌘⇧P."
      />
    </Form>
  );
}
