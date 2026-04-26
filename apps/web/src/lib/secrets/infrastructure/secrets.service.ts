import { backendClient } from '$lib/shared/shared.api';

export const secretsService = {
  async healthCheck(): Promise<boolean> {
    await backendClient.request('get', '/health');

    return true;
  }
};
