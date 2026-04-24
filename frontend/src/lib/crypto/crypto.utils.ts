export function getSubtle(): SubtleCrypto {
  const cryptoObj = (globalThis.crypto || (globalThis as any).msCrypto) as
    | Crypto
    | undefined;
  if (!cryptoObj || !cryptoObj.subtle) {
    throw new Error(
      "Web Crypto SubtleCrypto not available in this environment"
    );
  }
  return cryptoObj.subtle;
}

export function utf8ToBytes(data: string): Uint8Array {
  return new TextEncoder().encode(data);
}

export function bytesToUtf8(data: Uint8Array): string {
  return new TextDecoder().decode(data);
}

export function randomBytes(length: number): Uint8Array {
  const array = new Uint8Array(length);
  (globalThis.crypto || (globalThis as any).msCrypto).getRandomValues(array);
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
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function base64ToU8(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  return u8ToBase64(new Uint8Array(buffer));
}

export function base64ToArrayBuffer(b64: string): ArrayBuffer {
  return base64ToU8(b64).buffer;
}

/**
 * Cryptographically-secure random base62 string.
 *
 * Backed by `crypto.getRandomValues` (via `randomBytes`). Uses rejection
 * sampling so every character is uniformly distributed over the 62-char
 * alphabet — a naïve `byte % 62` would bias the first 8 characters
 * (A–H) because 256 is not a multiple of 62.
 *
 * DO NOT replace with `Math.random()`. `Math.random()` is a non-cryptographic
 * PRNG (V8 uses xorshift128+) whose internal state is recoverable from a
 * handful of outputs. Any secret derived from it has effectively zero
 * security margin.
 */
export function createRandomString(length: number): string {
  if (!Number.isInteger(length) || length < 0) {
    throw new Error(
      "createRandomString: length must be a non-negative integer"
    );
  }
  if (length === 0) return "";

  const alphabet =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  // 256 - (256 % 62) = 248. Bytes >= 248 would introduce modulo bias, so
  // we reject them. Acceptance rate is 248/256 ≈ 96.9%, so oversampling
  // by 2× makes a refill essentially never necessary.
  const maxUnbiased = 256 - (256 % alphabet.length);

  const out = new Array<string>(length);
  let written = 0;
  while (written < length) {
    const need = length - written;
    const buf = randomBytes(Math.max(need * 2, 16));
    for (let i = 0; i < buf.length && written < length; i++) {
      const b = buf[i];
      if (b < maxUnbiased) {
        out[written++] = alphabet[b % alphabet.length];
      }
    }
  }
  return out.join("");
}

/**
 * Cryptographically-secure uniform integer in `[minInclusive, maxExclusive)`.
 *
 * Uses rejection sampling over a 32-bit draw to eliminate modulo bias.
 * `Math.floor(Math.random() * range)` is NOT a substitute — `Math.random()`
 * is a predictable PRNG and `% range` biases the result unless `range`
 * divides 2^32.
 */
export function randomIntInRange(
  minInclusive: number,
  maxExclusive: number
): number {
  if (
    !Number.isInteger(minInclusive) ||
    !Number.isInteger(maxExclusive)
  ) {
    throw new Error("randomIntInRange: bounds must be integers");
  }
  const range = maxExclusive - minInclusive;
  if (range <= 0 || range > 0x1_0000_0000) {
    throw new Error("randomIntInRange: range must be in (0, 2^32]");
  }
  // Largest multiple of `range` that is <= 2^32; samples above it would
  // otherwise cluster the low end of the range (modulo bias).
  const maxUnbiased = 0x1_0000_0000 - (0x1_0000_0000 % range);
  for (;;) {
    const buf = randomBytes(4);
    const v = new DataView(
      buf.buffer,
      buf.byteOffset,
      buf.byteLength
    ).getUint32(0);
    if (v < maxUnbiased) {
      return minInclusive + (v % range);
    }
  }
}
