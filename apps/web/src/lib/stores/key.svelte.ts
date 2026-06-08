import { browser } from "$app/environment";
import { AsymmetricCrypto } from "$lib/auth/asymmetric-crypto";
import { queueFTUX } from "$lib/auth/ftux-queue";
import { keystore } from "$lib/auth/keystore";
import { SymmetricCrypto } from "$lib/auth/symmetric-crypto";
import { UserApi } from "$lib/auth/user.api";
import { recordUnlockActivity } from "$lib/keys/auto-lock";
import { auth, loadUserData } from "./auth.svelte";
import {
  keyAuth,
  markKeyLocked,
  markKeyUnlocked,
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
}

export async function setUpPassphrase(passphrase: string) {
  if (!auth.userData) {
    return;
  }
  const keyPair = await AsymmetricCrypto.generateKeyPair();
  const base64Key =
    await SymmetricCrypto.deriveBase64KeyFromPassphrase(passphrase);
  const encrypted = await SymmetricCrypto.encrypt(
    keyPair.privateKey,
    base64Key,
  );

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

  queueFTUX();
  await loadUserData();
}

export async function unlock(passphrase: string): Promise<void> {
  const encrypted = auth.userData?.privateKeyEncrypted;
  if (!encrypted) {
    return;
  }

  const base64Key =
    await SymmetricCrypto.deriveBase64KeyFromPassphrase(passphrase);
  let pkcs8Base64: string;
  try {
    pkcs8Base64 = await SymmetricCrypto.decrypt(encrypted, base64Key);
  } catch {
    throw new Error("Invalid passphrase");
  }

  const masterKey =
    await AsymmetricCrypto.importPrivateKeyNonExtractable(pkcs8Base64);
  await keystore.setMasterKey(masterKey);
  markKeyUnlocked();
  recordUnlockActivity();
}

export async function reset() {
  await keystore.wipeAll();
  markKeyLocked();
}
