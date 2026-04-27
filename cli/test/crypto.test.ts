import { describe, expect, it } from "vitest";
import { AsymmetricCrypto } from "../src/crypto/asymmetric.js";
import { SymmetricCrypto } from "../src/crypto/symmetric.js";
import { randomBytes, u8ToBase64 } from "../src/crypto/utils.js";

describe("envelope round-trip (matches the cli-flow approve payload shape)", () => {
  it("decrypts what the browser would have wrapped with our temp public key", async () => {
    // Pretend we're the CLI: generate a temp keypair as we'd send to the backend.
    const cliTemp = await AsymmetricCrypto.generateKeyPair();

    // Pretend we're the browser: take the user's PKCS8 and envelope it.
    const fakeUserPkcs8Base64 = u8ToBase64(randomBytes(1218)); // ~RSA-2048 PKCS8 size
    const ephemeralKey = u8ToBase64(randomBytes(32));
    const wrappedKey = await AsymmetricCrypto.encrypt(ephemeralKey, cliTemp.publicKey);
    const encryptedPrivateKey = await SymmetricCrypto.encrypt(fakeUserPkcs8Base64, ephemeralKey);

    // Pretend we're the CLI again: decrypt the envelope.
    const recoveredEphemeral = await AsymmetricCrypto.decrypt(wrappedKey, cliTemp.privateKey);
    const recoveredPkcs8 = await SymmetricCrypto.decrypt(encryptedPrivateKey, recoveredEphemeral);

    expect(recoveredEphemeral).toBe(ephemeralKey);
    expect(recoveredPkcs8).toBe(fakeUserPkcs8Base64);
  });

  it("the wrong temp private key fails to unwrap", async () => {
    const cliTemp = await AsymmetricCrypto.generateKeyPair();
    const otherTemp = await AsymmetricCrypto.generateKeyPair();
    const ephemeralKey = u8ToBase64(randomBytes(32));
    const wrappedKey = await AsymmetricCrypto.encrypt(ephemeralKey, cliTemp.publicKey);

    await expect(AsymmetricCrypto.decrypt(wrappedKey, otherTemp.privateKey)).rejects.toThrow();
  });
});

describe("symmetric crypto matches the frontend's SHA256(passphrase) → AES-GCM model", () => {
  it("derives the same key from the same passphrase", async () => {
    const k1 = await SymmetricCrypto.deriveBase64KeyFromPassphrase("hunter2");
    const k2 = await SymmetricCrypto.deriveBase64KeyFromPassphrase("hunter2");
    expect(k1).toBe(k2);
  });

  it("round-trips arbitrary text", async () => {
    const key = await SymmetricCrypto.deriveBase64KeyFromPassphrase("p");
    const ct = await SymmetricCrypto.encrypt("FOO=bar\nBAZ=qux\n", key);
    const pt = await SymmetricCrypto.decrypt(ct, key);
    expect(pt).toBe("FOO=bar\nBAZ=qux\n");
  });

  it("rejects wrong-key decryption", async () => {
    const k1 = await SymmetricCrypto.deriveBase64KeyFromPassphrase("p1");
    const k2 = await SymmetricCrypto.deriveBase64KeyFromPassphrase("p2");
    const ct = await SymmetricCrypto.encrypt("hello", k1);
    await expect(SymmetricCrypto.decrypt(ct, k2)).rejects.toThrow();
  });
});
