import {
  Alert,
  Cache,
  Toast,
  confirmAlert,
  showHUD,
  showToast,
} from "@raycast/api";
import { googleOAuth } from "./lib/google-oauth";

const menuBarCache = new Cache({ namespace: "calendar-shortcuts-menu-bar" });

export default async function Command() {
  const tokens = await googleOAuth.client.getTokens();
  if (!tokens?.accessToken) {
    menuBarCache.clear();
    await showHUD("Google Calendar is already disconnected");
    return;
  }

  const confirmed = await confirmAlert({
    title: "Disconnect Google Calendar?",
    message:
      "This signs CalFlow out of Google in Raycast. Your Raycast preferences, calendar selections, role mappings, and routing keywords are kept. This removes the locally stored OAuth tokens but does not revoke CalFlow in your Google Account.",
    primaryAction: {
      title: "Disconnect",
      style: Alert.ActionStyle.Destructive,
    },
  });

  if (!confirmed) return;

  try {
    await googleOAuth.client.removeTokens();
    menuBarCache.clear();
    await showHUD("🔒 Google Calendar disconnected · settings kept");
  } catch (error) {
    await showToast({
      style: Toast.Style.Failure,
      title: "Could not disconnect Google Calendar",
      message: error instanceof Error ? error.message : String(error),
    });
  }
}
