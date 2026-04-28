import { backendClient } from '$lib/shared/shared.api';

export const projectsService = {
  async healthCheck(): Promise<boolean> {
    await backendClient.request('get', '/health');

    return true;
  }
};
