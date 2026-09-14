import {
  Alert,
  Toast,
  confirmAlert,
  showHUD,
  showToast,
} from "@raycast/api";
import { googleOAuth } from "./lib/google-oauth";

import { invalidateMenuBarSession } from "./lib/menu-bar-session";

export default async function Command() {
  const tokens = await googleOAuth.client.getTokens();
  if (!tokens?.accessToken) {
    await invalidateMenuBarSession();
    await showHUD("Google Calendar is already disconnected");
    return;
  }

  const confirmed = await confirmAlert({
    title: "Disconnect Google Calendar?",
    message:
      "This signs DayCal out of Google in Raycast. Your Raycast preferences, calendar selections, role mappings, and routing keywords are kept. This removes the locally stored OAuth tokens but does not revoke DayCal in your Google Account.",
    primaryAction: {
      title: "Disconnect",
      style: Alert.ActionStyle.Destructive,
    },
  });

  if (!confirmed) return;

  try {
    await googleOAuth.client.removeTokens();
    await invalidateMenuBarSession();
    await showHUD("🔒 Google Calendar disconnected · settings kept");
  } catch (error) {
    await showToast({
      style: Toast.Style.Failure,
      title: "Could not disconnect Google Calendar",
      message: error instanceof Error ? error.message : String(error),
    });
  }
}
