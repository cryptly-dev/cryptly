import { browser } from "$app/environment";
import { track } from "$lib/analytics/logdash";
import { AsymmetricCrypto } from "$lib/auth/asymmetric-crypto";
import { keystore } from "$lib/auth/keystore";
import { decryptPrivateKey, encryptPrivateKey } from "$lib/auth/private-key";
import { UserApi } from "$lib/auth/user.api";
import { recordUnlockActivity } from "$lib/keys/auto-lock";
import { auth, loadUserData } from "./auth.svelte";
import { queueFTUX } from "./ftux.svelte";
import {
  keyAuth,
  markKeyLocked,
  markKeyUnlocked,
  PASSPHRASE_CHANGED_STORAGE_KEY,
} from "./key-state.svelte";

export {
  broadcastKeyLock,
  keyAuth,
  markKeyLocked,
  markKeyUnlocked,
  markMasterKeyHydrated,
  setHasMasterKey,
} from "./key-state.svelte";

export async function hydrateMasterKey() {
  try {
    const existing = await keystore.getMasterKey();
    if (existing) {
      markKeyUnlocked();
    } else {
      markKeyLocked();
    }
  } finally {
    keyAuth.masterKeyHydrated = true;
  }
}

if (browser) {
  void hydrateMasterKey();
  // Another tab changed the passphrase: reload the encrypted private key it re-wrote.
  window.addEventListener("storage", (event) => {
    if (event.key === PASSPHRASE_CHANGED_STORAGE_KEY && auth.jwtToken) {
      void loadUserData();
    }
  });
}

export async function setUpPassphrase(passphrase: string) {
  if (!auth.userData) {
    return;
  }
  const keyPair = await AsymmetricCrypto.generateKeyPair();
  const encrypted = await encryptPrivateKey(keyPair.privateKey, passphrase);

  const masterKey = await AsymmetricCrypto.importPrivateKeyNonExtractable(
    keyPair.privateKey,
  );
  await keystore.setMasterKey(masterKey);
  markKeyUnlocked();
  recordUnlockActivity();

  await UserApi.updateMe(auth.jwtToken!, {
    publicKey: keyPair.publicKey,
    privateKeyEncrypted: encrypted,
  });
  track("signup_completed");

  queueFTUX();
  await loadUserData();
}

/** Throws IncorrectPassphraseError. Checked against the server's current key, not a stale copy. */
export async function unlock(passphrase: string): Promise<void> {
  const masterKey = await AsymmetricCrypto.importPrivateKeyNonExtractable(
    await decryptPrivateKey(passphrase),
  );
  await keystore.setMasterKey(masterKey);
  markKeyUnlocked();
  recordUnlockActivity();
}

export async function reset() {
  await keystore.wipeAll();
  markKeyLocked();
}
