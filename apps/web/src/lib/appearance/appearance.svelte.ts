import { browser } from "$app/environment";
import { GREY_PRESETS, type GreyPreset } from "./greys";

export type ThemeChoice = "system" | "light" | "dark";

/** Must match the key read by the pre-paint script in app.html. */
const STORAGE_KEY = "cryptly.appearance";
const DEFAULT_GREYS: GreyPreset = "Stone";

function read(): { theme: ThemeChoice; greys: GreyPreset } {
  let saved: { theme?: unknown; greys?: unknown } = {};
  if (browser) {
    try {
      saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") ?? {};
    } catch {
      saved = {};
    }
  }
  const theme =
    saved.theme === "light" || saved.theme === "dark" ? saved.theme : "system";
  const greys = GREY_PRESETS.includes(saved.greys as GreyPreset)
    ? (saved.greys as GreyPreset)
    : DEFAULT_GREYS;
  return { theme, greys };
}

const systemLight = browser
  ? matchMedia("(prefers-color-scheme: light)")
  : null;

export const appearance = $state({
  ...read(),
  /** The theme in effect after resolving "system". */
  resolved: "dark" as "light" | "dark",
});

function apply() {
  if (!browser) return;
  appearance.resolved =
    appearance.theme === "system"
      ? systemLight?.matches
        ? "light"
        : "dark"
      : appearance.theme;
  document.documentElement.dataset.theme = appearance.resolved;
  document.documentElement.dataset.greys = appearance.greys;
}

function save() {
  if (!browser) return;
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ theme: appearance.theme, greys: appearance.greys }),
  );
}

export function setTheme(theme: ThemeChoice) {
  appearance.theme = theme;
  save();
  apply();
}

export function setGreys(greys: GreyPreset) {
  appearance.greys = greys;
  save();
  apply();
}

if (browser) {
  apply();
  systemLight?.addEventListener("change", apply);
  // Keep other tabs in sync.
  window.addEventListener("storage", (event) => {
    if (event.key !== STORAGE_KEY) return;
    Object.assign(appearance, read());
    apply();
  });
}
