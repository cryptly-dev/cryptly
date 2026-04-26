import { backendClient } from '$lib/shared/shared.api';

export const deviceFlowService = {
  async healthCheck(): Promise<boolean> {
    await backendClient.request('get', '/health');

    return true;
  }
};
