import { CliFlowApi } from "../api/cli-flow.js";
import { writeAuthState } from "../config/auth-store.js";
import { AsymmetricCrypto } from "../crypto/asymmetric.js";
import { SymmetricCrypto } from "../crypto/symmetric.js";
import { deviceName } from "../util/device-name.js";
import { startSpinner } from "../util/spinner.js";
import { c, info, ok } from "../util/style.js";

const POLL_INTERVAL_MS = 1500;

export async function loginCommand(): Promise<void> {
  process.stderr.write(`\n${c.bold("Authorize this CLI")}\n\n`);

  const tempKeys = await AsymmetricCrypto.generateKeyPair();
  const session = await CliFlowApi.startSession({
    tempPublicKey: tempKeys.publicKey,
    deviceName: deviceName(),
  });

  process.stderr.write(`${info("Open this URL to approve:")}\n`);
  process.stderr.write(`  ${c.cyan(c.underline(session.approveUrl))}\n\n`);

  const spinner = startSpinner("Waiting for approval…");
  try {
    const result = await pollUntilDone(session.sessionId);
    spinner.succeed("Approved.");

    const ephemeralKey = await AsymmetricCrypto.decrypt(result.wrappedKey, tempKeys.privateKey);
    const userPrivateKey = await SymmetricCrypto.decrypt(
      result.encryptedPrivateKey,
      ephemeralKey,
    );

    await writeAuthState({
      userId: result.userId,
      refreshToken: result.refreshToken,
      userPrivateKey,
      createdAt: new Date().toISOString(),
    });

    process.stderr.write(`\n${ok("Logged in.")}\n`);
  } catch (e) {
    spinner.fail();
    throw e;
  }
}

interface ConsumedSession {
  jwt: string;
  refreshToken: string;
  wrappedKey: string;
  encryptedPrivateKey: string;
  userId: string;
}

async function pollUntilDone(sessionId: string): Promise<ConsumedSession> {
  for (;;) {
    await sleep(POLL_INTERVAL_MS);
    const result = await CliFlowApi.poll(sessionId);
    if (result.status === "approved") {
      if (
        !result.jwt ||
        !result.refreshToken ||
        !result.wrappedKey ||
        !result.encryptedPrivateKey ||
        !result.userId
      ) {
        throw new Error("Approved session missing payload — try again.");
      }
      return {
        jwt: result.jwt,
        refreshToken: result.refreshToken,
        wrappedKey: result.wrappedKey,
        encryptedPrivateKey: result.encryptedPrivateKey,
        userId: result.userId,
      };
    }
    if (result.status === "consumed") {
      throw new Error("Session was already used. Run `cryptly login` again.");
    }
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
