import { FTUX_QUEUED_STORAGE_KEY } from './kea-storage-keys';

/** Mirrors kea ftux `queueFTUX` (persisted flag). */
export function queueFTUX(): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(FTUX_QUEUED_STORAGE_KEY, JSON.stringify(true));
}
