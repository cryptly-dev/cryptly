import { browser } from "$app/environment";
import {
  FTUX_COMPLETED_STORAGE_KEY,
  FTUX_QUEUED_STORAGE_KEY,
} from "$lib/auth/kea-storage-keys";

/** First-run tour, mirrors the legacy kea `ftuxLogic` (same persisted keys). */
export type FtuxStep =
  | "not_started"
  | "editor"
  | "save"
  | "integrations"
  | "completed";

const STEP_NUMBER: Record<FtuxStep, number> = {
  not_started: 0,
  editor: 1,
  save: 2,
  integrations: 3,
  completed: 0,
};

export const FTUX_TOTAL_STEPS = 3;

export const ftux = $state({ step: "not_started" as FtuxStep });

function readFlag(key: string): boolean {
  return browser && localStorage.getItem(key) === "true";
}

function writeFlag(key: string, value: boolean) {
  if (browser) localStorage.setItem(key, JSON.stringify(value));
}

export function ftuxStepNumber(): number {
  return STEP_NUMBER[ftux.step];
}

/** Queued after passphrase setup; shown on the next project view. */
export function queueFTUX() {
  writeFlag(FTUX_QUEUED_STORAGE_KEY, true);
}

export function startFTUX() {
  if (ftux.step !== "not_started") return;
  if (
    readFlag(FTUX_COMPLETED_STORAGE_KEY) ||
    !readFlag(FTUX_QUEUED_STORAGE_KEY)
  )
    return;
  writeFlag(FTUX_QUEUED_STORAGE_KEY, false);
  ftux.step = "editor";
}

export function completeFTUX() {
  ftux.step = "completed";
  writeFlag(FTUX_QUEUED_STORAGE_KEY, false);
  writeFlag(FTUX_COMPLETED_STORAGE_KEY, true);
}

export function nextFTUXStep() {
  if (ftux.step === "editor") ftux.step = "save";
  else if (ftux.step === "save") ftux.step = "integrations";
  else if (ftux.step === "integrations") completeFTUX();
}

export function previousFTUXStep() {
  if (ftux.step === "save") ftux.step = "editor";
  else if (ftux.step === "integrations") ftux.step = "save";
}

export function ftuxUserMadeEdit() {
  if (ftux.step === "editor") ftux.step = "save";
}

export function ftuxUserSaved() {
  if (ftux.step === "save") ftux.step = "integrations";
}

export function ftuxUserOpenedIntegrations() {
  if (ftux.step === "integrations") completeFTUX();
}
