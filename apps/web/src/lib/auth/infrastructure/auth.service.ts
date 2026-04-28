import { backendClient } from '$lib/shared/shared.api';

export const authService = {
  async loadSessionHealth(): Promise<boolean> {
    await backendClient.request('get', '/health');

    return true;
  }
};
