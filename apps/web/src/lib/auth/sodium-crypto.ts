// @ts-expect-error libsodium-wrappers is installed here without local type declarations.
import sodium from "libsodium-wrappers";

await sodium.ready;

export class SodiumCrypto {
  static async encrypt(value: string, publicKey: string): Promise<string> {
    const variant = sodium.base64_variants.ORIGINAL;
    const messageBytes = sodium.from_string(value);
    const keyBytes = sodium.from_base64(publicKey, variant);
    const encryptedBytes = sodium.crypto_box_seal(messageBytes, keyBytes);

    return sodium.to_base64(encryptedBytes, variant);
  }
}
