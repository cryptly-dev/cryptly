import {
  actions,
  connect,
  events,
  kea,
  listeners,
  path,
  reducers,
  selectors,
} from "kea";

import { UserApi, type User } from "../api/user.api";
import { AsymmetricCrypto } from "../crypto/crypto.asymmetric";
import { keystore } from "../crypto/keystore";
import { SymmetricCrypto } from "../crypto/crypto.symmetric";
import { authLogic } from "./authLogic";
import { ftuxLogic } from "./ftuxLogic";
import type { keyLogicType } from "./keyLogicType";

export const keyLogic = kea<keyLogicType>([
  path(["src", "lib", "logics", "keyLogic"]),

  connect({
    values: [authLogic, ["userData", "jwtToken"]],
    actions: [authLogic, ["loadUserData"], ftuxLogic, ["queueFTUX"]],
  }),

  actions({
    setHasMasterKey: (hasMasterKey: boolean) => ({ hasMasterKey }),
    hydrateMasterKey: true,

    setUpPassphrase: (passphrase: string) => ({ passphrase }),
    unlock: (passphrase: string) => ({ passphrase }),
    reset: true,
  }),

  reducers({
    hasMasterKey: [
      false as boolean,
      {
        setHasMasterKey: (
          _: boolean,
          { hasMasterKey }: { hasMasterKey: boolean }
        ) => hasMasterKey,
        reset: () => false,
      },
    ],
  }),

  selectors({
    shouldSetUpPassphrase: [
      (state) => [state.userData],
      (userData: User | null) =>
        Boolean(userData) &&
        (!userData!.publicKey || !userData!.privateKeyEncrypted),
    ],
    // True only when we *know* the account has keys. Distinct from
    // `!shouldSetUpPassphrase`, which is also false while userData is still
    // loading — that ambiguity was causing UnlockBrowserDialog to flash.
    keysAreSetUp: [
      (state) => [state.userData],
      (userData: User | null) =>
        Boolean(userData) &&
        Boolean(userData!.publicKey) &&
        Boolean(userData!.privateKeyEncrypted),
    ],
    browserIsUnlocked: [
      (state) => [state.hasMasterKey],
      (hasMasterKey: boolean) => Boolean(hasMasterKey),
    ],
  }),

  listeners(({ actions, values }) => ({
    setUpPassphrase: async ({ passphrase }) => {
      if (!values.userData) {
        return;
      }
      const keyPair = await AsymmetricCrypto.generateKeyPair();
      const base64Key = await SymmetricCrypto.deriveBase64KeyFromPassphrase(
        passphrase
      );
      const encrypted = await SymmetricCrypto.encrypt(
        keyPair.privateKey,
        base64Key
      );

      const masterKey =
        await AsymmetricCrypto.importPrivateKeyNonExtractable(
          keyPair.privateKey
        );
      await keystore.setMasterKey(masterKey);
      actions.setHasMasterKey(true);

      await UserApi.updateMe(values.jwtToken!, {
        publicKey: keyPair.publicKey,
        privateKeyEncrypted: encrypted,
      });

      actions.queueFTUX();

      await actions.loadUserData();
    },
    unlock: async ({ passphrase }): Promise<void> => {
      const encrypted = values.userData?.privateKeyEncrypted;
      if (!encrypted) {
        return;
      }

      const base64Key = await SymmetricCrypto.deriveBase64KeyFromPassphrase(
        passphrase
      );
      let pkcs8Base64: string;
      try {
        pkcs8Base64 = await SymmetricCrypto.decrypt(encrypted, base64Key);
      } catch {
        throw new Error("Invalid passphrase");
      }

      const masterKey =
        await AsymmetricCrypto.importPrivateKeyNonExtractable(pkcs8Base64);
      await keystore.setMasterKey(masterKey);
      actions.setHasMasterKey(true);
    },
    reset: async () => {
      await keystore.wipeAll();
    },
    hydrateMasterKey: async () => {
      const existing = await keystore.getMasterKey();
      actions.setHasMasterKey(Boolean(existing));
    },
  })),

  events(({ actions }) => ({
    afterMount: () => {
      actions.hydrateMasterKey();
    },
  })),
]);
