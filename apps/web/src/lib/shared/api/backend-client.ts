import { createBackendClient } from '@packages/backend-sdk';
import { AUTH_JWT_STORAGE_KEY } from '$lib/auth/kea-storage-keys';
import { publicEnv } from '$lib/shared/env/public-env';

export const backendClient = createBackendClient({
  baseUrl: publicEnv.apiUrl,
  headers: async () => {
    const token = getStoredJwtToken();

    if (!token) {
      return new Headers();
    }

    return {
      Authorization: `Bearer ${token}`
    };
  }
});

function getStoredJwtToken(): string | null {
  if (typeof localStorage === 'undefined') {
    return null;
  }

  return localStorage.getItem(AUTH_JWT_STORAGE_KEY);
}
