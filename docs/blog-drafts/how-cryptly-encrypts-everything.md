# How Cryptly actually encrypts your stuff

End-to-end encryption gets thrown around a lot, so let's get specific about what it means here. **Your plaintext secrets, your passphrase, and your raw private key never leave your browser.** The server stores ciphertext and public keys. That's it.

Here's the full walkthrough.

## First login

The moment you sign up, before we touch the network with anything sensitive, your browser generates an asymmetric key pair using the Web Crypto API:

- **Algorithm:** RSA-OAEP
- **Modulus:** 2048-bit
- **Public exponent:** 65537
- **Hash:** SHA-256

This is *your* account-level key pair. It sticks with you for everything you do in Cryptly.

![image|small](https://i.ibb.co/DD7qzChm/shapes-at-26-04-26-14-17-49.png)

The public key is, well, public — fine to ship to the server. The private key is the crown jewel, so we need to lock it down before it goes anywhere. That's where your passphrase comes in.

We ask you to pick one:

![image](https://i.ibb.co/yFdBGWDR/shapes-at-26-04-26-14-18-51.png)

We turn the passphrase into a 32-byte symmetric key by hashing it with **SHA-256**. From here on, whenever this post says "we encrypt X with your passphrase," what it really means is "we encrypt X with the SHA-256 hash of your passphrase, used as a 256-bit AES key." Same idea, fewer words.

> **Real talk on this choice.** SHA-256 is a fast hash. That makes it fast for *us* to derive a key, and equally fast for someone running an offline attack against an encrypted private key blob. A purpose-built password KDF (PBKDF2 with millions of iterations, or Argon2) would force an attacker to spend real CPU per guess. Cryptly does not currently do that, so the strength of your private-key encryption is the strength of your passphrase. Pick a long, unique one.

Now we use that derived key to encrypt your private key with **AES-GCM-256** (fresh 12-byte random IV per encryption — never reused). The resulting ciphertext is what gets stored in our database:

![image](https://i.ibb.co/KpSN6NCV/shapes-at-26-04-26-14-19-15.png)

So at this point the server has:

- Your **public key** — plaintext, by design.
- Your **encrypted private key** blob — only decryptable with your passphrase.

It does **not** have your passphrase, your raw private key, or anything that gets you back to either.

## Logging in on a new device

Cool, so the private key only exists on the laptop you signed up on. What happens when you open Cryptly on your phone?

The phone needs your private key to decrypt anything, and our server can't hand it over (it doesn't have it, and even if it did, it shouldn't). So we use a device-pairing flow:

![image](https://i.ibb.co/5WbqnyGh/shapes-at-26-04-26-14-19-23.png)

The new device generates a fresh, **ephemeral** RSA-OAEP-2048 key pair just for this exchange. Together with a random 6-digit PIN, it sends the ephemeral public key over to one of your already-unlocked devices via a server-relayed message channel.

The unlocked device:

1. Shows you the PIN so you can confirm it matches the one on the new device — this is your defense against someone else trying to hijack the flow.
2. Encrypts your passphrase with the **new device's ephemeral public key**.
3. Sends the ciphertext back through the relay.

The new device decrypts the ciphertext with its ephemeral private key, gets your passphrase, derives the AES key, and uses it (locally) to unwrap your private key blob. The ephemeral keypair is then discarded.

The server, again, only ever sees ciphertext and public keys.

## Creating a new project

### The ProjectKey

Every project gets its own symmetric key — we call it the **ProjectKey**. This is what actually encrypts the secrets you store in the project.

To make one, we:

1. Generate 64 random characters from a base62 alphabet using `crypto.getRandomValues` with rejection sampling, so every character is uniformly distributed. (Side note: we explicitly do **not** use `Math.random()` anywhere — it's a non-crypto PRNG whose state is recoverable from a few outputs, which would torpedo the whole security model.)
2. Hash the result with **SHA-256** to get a 32-byte AES key.

![image](https://i.ibb.co/N6ktGvBR/shapes-at-26-04-26-14-19-39.png)

That's a 256-bit key, used with AES-GCM, scoped to one project. Different projects get different ProjectKeys — leaking one doesn't leak the others.

![image](https://i.ibb.co/FqCypVyD/shapes-at-26-04-26-14-19-55.png)

### Wrapping the ProjectKey

Now the puzzle: every member of the project needs to be able to use the ProjectKey, and the server can never see it. This is where your account-level RSA key pair from earlier earns its keep.

Quick refresher — RSA-OAEP lets you **encrypt with the public key**:

![image](https://i.ibb.co/zWqrJ4v5/shapes-at-26-04-26-14-22-46.png)

…and **decrypt with the private key**:

![image](https://i.ibb.co/fYSg2s8t/shapes-at-26-04-26-14-22-55.png)

So when you create a project, your browser encrypts the ProjectKey with **your own public key**:

![image](https://i.ibb.co/kgYQxtZ2/shapes-at-26-04-26-14-23-08.png)

That ciphertext is what hits the database. When you later open the project, your browser pulls down the ciphertext and decrypts it with your private key — which lives in the browser's CryptoKey vault as a non-extractable handle, so even your own JS code can't read the raw bytes back out. From there, the ProjectKey decrypts your secrets locally.

For multi-member projects, we do this **per member**: one shared ProjectKey, encrypted N times with N different public keys. Each member can only unwrap their own copy with their own private key:

![image](https://i.ibb.co/Q32FYDCf/shapes-at-26-04-26-14-23-16.png)

That's the whole architecture in one sentence: **one symmetric key per project, wrapped once per member with that member's public key, and the server only ever stores wrapped copies.**

## TL;DR

| Thing                              | Algorithm                                   |
| ---------------------------------- | ------------------------------------------- |
| Account key pair                   | RSA-OAEP, 2048-bit, SHA-256                 |
| Passphrase → AES key               | SHA-256                                     |
| Private-key-at-rest encryption     | AES-GCM-256, random 12-byte IV              |
| ProjectKey generation              | 64 base62 chars (CSPRNG) → SHA-256          |
| Secret encryption inside a project | AES-GCM-256 with the ProjectKey             |
| Wrapping ProjectKey per member     | RSA-OAEP-2048 with the member's public key  |
| New-device handoff                 | Ephemeral RSA-OAEP-2048 + 6-digit PIN       |

What never leaves your browser: your passphrase, your raw private key, your unwrapped ProjectKeys, your plaintext secrets.

What the server holds: public keys, encrypted-private-key blobs, encrypted ProjectKey copies (one per member), and encrypted secret values. None of those are useful without a private key it doesn't have.
