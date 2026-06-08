import { keystore } from '$lib/auth/keystore';

export const keystoreService = {
  async hasMasterKey(): Promise<boolean> {
    const k = await keystore.getMasterKey();
    return k !== null;
  }
};
