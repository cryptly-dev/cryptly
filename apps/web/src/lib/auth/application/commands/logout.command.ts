import { logout } from '$lib/stores/auth.svelte';

export function logoutCommand(): void {
  void logout();
}
