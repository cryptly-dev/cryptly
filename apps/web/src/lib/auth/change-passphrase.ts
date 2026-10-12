import { broadcastPassphraseChanged } from "$lib/stores/key-state.svelte";
import { decryptPrivateKey, encryptPrivateKey } from "./private-key";
import { UserApi } from "./user.api";

export { IncorrectPassphraseError } from "./private-key";

/**
 * Changes the account passphrase by re-encrypting the private key in the browser. The key pair
 * does not change, so project keys, this unlocked browser and logged-in CLIs keep working.
 * Only the re-encrypted key is sent; the passphrases and the decrypted key never leave this
 * function. Nothing is written when `current` is wrong (IncorrectPassphraseError).
 */
export async function changePassphrase(
  jwtToken: string,
  current: string,
  next: string,
): Promise<void> {
  const privateKeyEncrypted = await encryptPrivateKey(
    await decryptPrivateKey(current),
    next,
  );
  await UserApi.updateMe(jwtToken, { privateKeyEncrypted });
  broadcastPassphraseChanged();
}
