export interface KeyPair {
  publicKey: string;
  privateKey: string;
}

import {
  getSubtle,
  utf8ToBytes,
  bytesToUtf8,
  arrayBufferToBase64,
  base64ToArrayBuffer,
} from "./crypto.utils";

export class AsymmetricCrypto {
  public static async generateKeyPair(): Promise<KeyPair> {
    const subtle = getSubtle();
    const keyPair = await subtle.generateKey(
      {
        name: "RSA-OAEP",
        modulusLength: 2048,
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
        hash: "SHA-256",
      },
      true,
      ["encrypt", "decrypt"]
    );

    const publicSpki = await subtle.exportKey("spki", keyPair.publicKey);
    const privatePkcs8 = await subtle.exportKey("pkcs8", keyPair.privateKey);

    return {
      publicKey: arrayBufferToBase64(publicSpki),
      privateKey: arrayBufferToBase64(privatePkcs8),
    };
  }

  public static async encrypt(
    data: string,
    publicKey: string
  ): Promise<string> {
    const subtle = getSubtle();
    const pubKey = await subtle.importKey(
      "spki",
      base64ToArrayBuffer(publicKey),
      { name: "RSA-OAEP", hash: "SHA-256" },
      false,
      ["encrypt"]
    );
    const ciphertext = await subtle.encrypt(
      { name: "RSA-OAEP" },
      pubKey,
      utf8ToBytes(data)
    );
    return arrayBufferToBase64(ciphertext);
  }

  public static async decrypt(
    data: string,
    privateKey: string
  ): Promise<string> {
    const subtle = getSubtle();
    const privKey = await subtle.importKey(
      "pkcs8",
      base64ToArrayBuffer(privateKey),
      { name: "RSA-OAEP", hash: "SHA-256" },
      false,
      ["decrypt"]
    );
    const plaintext = await subtle.decrypt(
      { name: "RSA-OAEP" },
      privKey,
      base64ToArrayBuffer(data)
    );
    return bytesToUtf8(new Uint8Array(plaintext));
  }

  /** Imports a PKCS8 base64 private key as a non-extractable CryptoKey for storage/use. */
  public static async importPrivateKeyNonExtractable(
    pkcs8Base64: string
  ): Promise<CryptoKey> {
    const subtle = getSubtle();
    return subtle.importKey(
      "pkcs8",
      base64ToArrayBuffer(pkcs8Base64),
      { name: "RSA-OAEP", hash: "SHA-256" },
      false,
      ["decrypt"]
    );
  }

  /** Decrypts using a CryptoKey handle (master key never leaves the keystore). */
  public static async decryptWithKey(
    data: string,
    privateKey: CryptoKey
  ): Promise<string> {
    const subtle = getSubtle();
    const plaintext = await subtle.decrypt(
      { name: "RSA-OAEP" },
      privateKey,
      base64ToArrayBuffer(data)
    );
    return bytesToUtf8(new Uint8Array(plaintext));
  }
}
