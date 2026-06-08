import {
  base64ToU8,
  bytesToUtf8,
  concatBytes,
  createRandomString,
  getSubtle,
  randomBytes,
  u8ToBase64,
  utf8ToBytes
} from './crypto.utils';

export class SymmetricCrypto {
  public static async generateProjectKey(): Promise<string> {
    const randomString = createRandomString(64);
    return this.deriveBase64KeyFromPassphrase(randomString);
  }

  public static generateProjectPassphrase(): string {
    return createRandomString(64);
  }

  public static async deriveBase64KeyFromPassphrase(
    passphrase: string
  ): Promise<string> {
    const subtle = getSubtle();
    const passBytes = new TextEncoder().encode(passphrase);
    const digestBuf = await subtle.digest('SHA-256', passBytes);
    return u8ToBase64(new Uint8Array(digestBuf));
  }

  public static async encrypt(data: string, base64Key: string): Promise<string> {
    const subtle = getSubtle();
    const keyBytes = base64ToU8(base64Key);
    if (keyBytes.length !== 32) {
      throw new Error('Invalid key. Expected 32-byte key (base64-encoded)');
    }
    const cryptoKey = await subtle.importKey(
      'raw',
      keyBytes,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt']
    );
    const iv = randomBytes(12);
    const ciphertext = await subtle.encrypt(
      { name: 'AES-GCM', iv },
      cryptoKey,
      utf8ToBytes(data)
    );
    const out = concatBytes(iv, new Uint8Array(ciphertext));
    return u8ToBase64(out);
  }

  public static async decrypt(data: string, base64Key: string): Promise<string> {
    const subtle = getSubtle();
    const keyBytes = base64ToU8(base64Key);
    if (keyBytes.length !== 32) {
      throw new Error('Invalid key. Expected 32-byte key (base64-encoded)');
    }
    const input = base64ToU8(data);
    if (input.length < 12 + 16) {
      throw new Error('Ciphertext too short');
    }
    const iv = input.subarray(0, 12);
    const ciphertext = input.subarray(12);
    const cryptoKey = await subtle.importKey(
      'raw',
      keyBytes,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    );
    const plaintext = await subtle.decrypt(
      { name: 'AES-GCM', iv },
      cryptoKey,
      ciphertext
    );
    return bytesToUtf8(new Uint8Array(plaintext));
  }

  public static async importAesKey(base64Key: string): Promise<CryptoKey> {
    const subtle = getSubtle();
    const keyBytes = base64ToU8(base64Key);
    if (keyBytes.length !== 32) {
      throw new Error('Invalid key. Expected 32-byte key (base64-encoded)');
    }
    return subtle.importKey(
      'raw',
      keyBytes,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
  }

  public static async exportAesKey(key: CryptoKey): Promise<string> {
    const subtle = getSubtle();
    const raw = await subtle.exportKey('raw', key);
    return u8ToBase64(new Uint8Array(raw));
  }

  public static async encryptWithKey(
    data: string,
    key: CryptoKey
  ): Promise<string> {
    const subtle = getSubtle();
    const iv = randomBytes(12);
    const ciphertext = await subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      utf8ToBytes(data)
    );
    const out = concatBytes(iv, new Uint8Array(ciphertext));
    return u8ToBase64(out);
  }

  public static async decryptWithKey(
    data: string,
    key: CryptoKey
  ): Promise<string> {
    const subtle = getSubtle();
    const input = base64ToU8(data);
    if (input.length < 12 + 16) {
      throw new Error('Ciphertext too short');
    }
    const iv = input.subarray(0, 12);
    const ciphertext = input.subarray(12);
    const plaintext = await subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext
    );
    return bytesToUtf8(new Uint8Array(plaintext));
  }
}
