import {
  base64ToU8,
  bytesToUtf8,
  concatBytes,
  randomBytes,
  subtle,
  u8ToBase64,
  utf8ToBytes,
} from "./utils.js";

export class SymmetricCrypto {
  public static async deriveBase64KeyFromPassphrase(passphrase: string): Promise<string> {
    const passBytes = new TextEncoder().encode(passphrase);
    const digestBuf = await subtle.digest("SHA-256", passBytes);
    return u8ToBase64(new Uint8Array(digestBuf));
  }

  public static async encrypt(data: string, base64Key: string): Promise<string> {
    const keyBytes = base64ToU8(base64Key);
    if (keyBytes.length !== 32) {
      throw new Error("Invalid key. Expected 32-byte key (base64-encoded)");
    }
    const cryptoKey = await subtle.importKey(
      "raw",
      keyBytes,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt"],
    );
    const iv = randomBytes(12);
    const ciphertext = await subtle.encrypt(
      { name: "AES-GCM", iv },
      cryptoKey,
      utf8ToBytes(data),
    );
    return u8ToBase64(concatBytes(iv, new Uint8Array(ciphertext)));
  }

  public static async decrypt(data: string, base64Key: string): Promise<string> {
    const keyBytes = base64ToU8(base64Key);
    if (keyBytes.length !== 32) {
      throw new Error("Invalid key. Expected 32-byte key (base64-encoded)");
    }
    const input = base64ToU8(data);
    if (input.length < 12 + 16) {
      throw new Error("Ciphertext too short");
    }
    const iv = input.subarray(0, 12);
    const ciphertext = input.subarray(12);
    const cryptoKey = await subtle.importKey(
      "raw",
      keyBytes,
      { name: "AES-GCM", length: 256 },
      false,
      ["decrypt"],
    );
    const plaintext = await subtle.decrypt({ name: "AES-GCM", iv }, cryptoKey, ciphertext);
    return bytesToUtf8(new Uint8Array(plaintext));
  }
}
