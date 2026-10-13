import { auth, setUserData } from "$lib/stores/auth.svelte";
import { SymmetricCrypto } from "./symmetric-crypto";
import { UserApi } from "./user.api";

/**
 * The account private key (PKCS#8, base64) is stored on the server encrypted with AES-GCM keyed
 * by SHA-256 of the passphrase. Every path that opens or writes it goes through this module, so
 * setup, unlock, device approval, CLI login and passphrase change share one format.
 */

export class IncorrectPassphraseError extends Error {
  constructor() {
    super("Incorrect passphrase");
    this.name = "IncorrectPassphraseError";
  }
}

/**
 * The server's current encrypted private key. A copy loaded earlier may predate a passphrase
 * change (in another tab or browser), and would still open with the old passphrase. Falls back
 * to the loaded copy when the API is unreachable.
 */
async function currentPrivateKeyEncrypted(): Promise<string | undefined> {
  const jwt = auth.jwtToken;
  if (jwt) {
    try {
      const me = await UserApi.getMe(jwt);
      if (auth.jwtToken === jwt) setUserData(me);
      return me.privateKeyEncrypted;
    } catch {
      // Offline or API error: use the copy we have.
    }
  }
  return auth.userData?.privateKeyEncrypted;
}

/** Opens the account private key with `passphrase`. Throws IncorrectPassphraseError. */
export async function decryptPrivateKey(passphrase: string): Promise<string> {
  const encrypted = await currentPrivateKeyEncrypted();
  if (!encrypted) throw new Error("This account has no passphrase yet");
  const key = await SymmetricCrypto.deriveBase64KeyFromPassphrase(passphrase);
  try {
    return await SymmetricCrypto.decrypt(encrypted, key);
  } catch {
    throw new IncorrectPassphraseError();
  }
}

/**
 * Encrypts the private key with `passphrase`, then opens the result again before it can leave
 * the browser: a blob the passphrase can't open would lock the account out for good.
 */
export async function encryptPrivateKey(
  privateKey: string,
  passphrase: string,
): Promise<string> {
  const key = await SymmetricCrypto.deriveBase64KeyFromPassphrase(passphrase);
  const encrypted = await SymmetricCrypto.encrypt(privateKey, key);
  if ((await SymmetricCrypto.decrypt(encrypted, key)) !== privateKey) {
    throw new Error("Could not verify the encrypted private key");
  }
  return encrypted;
}
