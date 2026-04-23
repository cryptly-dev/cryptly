import {
  actions,
  connect,
  kea,
  listeners,
  path,
  reducers,
  selectors,
} from "kea";

import { subscriptions } from "kea-subscriptions";
import { UserApi, type User } from "../api/user.api";
import { AsymmetricCrypto } from "../crypto/crypto.asymmetric";
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
    // reducers
    setPassphrase: (passphrase: string) => ({ passphrase }),
    setPrivateKeyDecrypted: (privateKeyDecrypted: string | null) => ({
      privateKeyDecrypted,
    }),

    // listeners
    setUpPassphrase: (passphrase: string) => ({ passphrase }),
    decryptPrivateKey: true,
    reset: true,
  }),

  reducers({
    passphrase: [
      null as string | null,
      {
        persist: true,
      },
      {
        setPassphrase: (
          _: string | null,
          { passphrase }: { passphrase: string }
        ) => passphrase,
        reset: () => null,
      },
    ],
    privateKeyDecrypted: [
      null as string | null,
      {
        persist: true,
      },
      {
        setPrivateKeyDecrypted: (
          _: string | null,
          { privateKeyDecrypted }: { privateKeyDecrypted: string | null }
        ) => privateKeyDecrypted,
        reset: () => null,
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
      (state) => [state.privateKeyDecrypted],
      (privateKeyDecrypted: string | null) => Boolean(privateKeyDecrypted),
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

      actions.setPassphrase(passphrase);
      // We already hold the plaintext private key here, so set it directly.
      // Otherwise the userData subscription has to re-derive and decrypt
      // after loadUserData, leaving a window where `keysAreSetUp` is true
      // but `browserIsUnlocked` is still false — which briefly satisfies
      // UnlockBrowserDialog's gate and causes a flash.
      actions.setPrivateKeyDecrypted(keyPair.privateKey);

      await UserApi.updateMe(values.jwtToken!, {
        publicKey: keyPair.publicKey,
        privateKeyEncrypted: encrypted,
      });

      actions.queueFTUX();

      await actions.loadUserData();
    },
    decryptPrivateKey: async (): Promise<void> => {
      const encrypted = values.userData?.privateKeyEncrypted;
      const passphrase = values.passphrase;
      if (!passphrase) {
        actions.setPrivateKeyDecrypted(null);
        return;
      }

      if (!encrypted) {
        return;
      }

      const base64Key = await SymmetricCrypto.deriveBase64KeyFromPassphrase(
        passphrase
      );
      try {
        const decrypted = await SymmetricCrypto.decrypt(encrypted, base64Key);
        actions.setPrivateKeyDecrypted(decrypted);
      } catch (e) {
        actions.setPrivateKeyDecrypted(null);
        throw Error("Invalid passphrase");
      }
    },
  })),

  subscriptions(({ actions }) => ({
    passphrase: () => {
      actions.decryptPrivateKey();
    },
    userData: () => {
      actions.decryptPrivateKey();
    },
  })),
]);
