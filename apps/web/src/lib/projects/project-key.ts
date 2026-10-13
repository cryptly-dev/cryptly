import { AsymmetricCrypto } from "$lib/auth/asymmetric-crypto";
import { keystore } from "$lib/auth/keystore";
import { SymmetricCrypto } from "$lib/auth/symmetric-crypto";
import { auth } from "$lib/stores/auth.svelte";
import { keyAuth } from "$lib/stores/key.svelte";

/**
 * The project's AES key, unwrapped in the browser with the user's private key and cached in
 * the keystore. Null while the browser is locked, when the user has no wrapped key for the
 * project, or when the lock state changed mid-way (the caller must drop any decrypted state).
 */
export async function getUnlockedProjectKey(project: {
  id: string;
  encryptedSecretsKeys?: Record<string, string>;
}): Promise<CryptoKey | null> {
  const expectedRevision = keyAuth.revision;
  const stillUnlocked = () =>
    expectedRevision === keyAuth.revision && keyAuth.hasMasterKey;
  if (!keyAuth.hasMasterKey) return null;

  let projectKey = await keystore.getProjectKey(project.id);
  if (!stillUnlocked()) return null;
  if (projectKey) return projectKey;

  const userId = auth.userData?.id;
  const encryptedKey = userId
    ? project.encryptedSecretsKeys?.[userId]
    : undefined;
  const masterKey = await keystore.getMasterKey();
  if (!stillUnlocked() || !masterKey || !encryptedKey) return null;

  const projectKeyB64 = await AsymmetricCrypto.decryptWithKey(
    encryptedKey,
    masterKey,
  );
  projectKey = await SymmetricCrypto.importAesKey(projectKeyB64);
  if (!stillUnlocked()) return null;
  await keystore.setProjectKey(project.id, projectKey);
  return projectKey;
}
