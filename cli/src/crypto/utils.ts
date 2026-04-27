import { webcrypto } from "node:crypto";

export const subtle = webcrypto.subtle;

export function utf8ToBytes(data: string): Uint8Array {
  return new TextEncoder().encode(data);
}

export function bytesToUtf8(data: Uint8Array): string {
  return new TextDecoder().decode(data);
}

export function randomBytes(length: number): Uint8Array {
  const array = new Uint8Array(length);
  webcrypto.getRandomValues(array);
  return array;
}

export function concatBytes(...arrays: Uint8Array[]): Uint8Array {
  let total = 0;
  for (const a of arrays) total += a.length;
  const out = new Uint8Array(total);
  let offset = 0;
  for (const a of arrays) {
    out.set(a, offset);
    offset += a.length;
  }
  return out;
}

export function u8ToBase64(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("base64");
}

export function base64ToU8(b64: string): Uint8Array {
  return new Uint8Array(Buffer.from(b64, "base64"));
}

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  return u8ToBase64(new Uint8Array(buffer));
}

export function base64ToArrayBuffer(b64: string): ArrayBuffer {
  const u8 = base64ToU8(b64);
  return u8.buffer.slice(u8.byteOffset, u8.byteOffset + u8.byteLength) as ArrayBuffer;
}
