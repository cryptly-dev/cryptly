import { backendClient } from '$lib/shared/shared.api';

export const blogService = {
  async healthCheck(): Promise<boolean> {
    await backendClient.request('get', '/health');

    return true;
  }
};
