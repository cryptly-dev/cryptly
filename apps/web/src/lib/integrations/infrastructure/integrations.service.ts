import { backendClient } from '$lib/shared/shared.api';

export const integrationsService = {
  async healthCheck(): Promise<boolean> {
    await backendClient.request('get', '/health');

    return true;
  }
};
