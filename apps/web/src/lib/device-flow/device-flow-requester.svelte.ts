import { EventSource } from "eventsource";
import { AsymmetricCrypto } from "$lib/auth/asymmetric-crypto";
import { randomIntInRange } from "$lib/crypto/crypto.utils";
import { publicEnv } from "$lib/shared/env/public-env";
import { auth } from "$lib/stores/auth.svelte";
import { unlock } from "$lib/stores/key.svelte";
import { getDeviceId, getDeviceName } from "$lib/utils";
import { DeviceFlowApi, type DeviceItem } from "./device-flow.api";

const APPROVERS_LIST = "approvers-list";

let connection: EventSource | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let attached = false;

export const deviceFlowRequester = $state({
  approvers: [] as DeviceItem[],
  unlockRequestPin: null as string | null,
  unlockRequestPrivateKey: null as string | null,
});

function closeConnection() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  connection?.close();
  connection = null;
}

function openStream() {
  const jwt = auth.jwtToken;
  if (!jwt || connection) return;

  const requesterDeviceId = getDeviceId();
  const apiBase = publicEnv.apiUrl.replace(/\/$/, "");
  const url = `${apiBase}/auth/device-flow/messages?role=requester&deviceId=${encodeURIComponent(
    requesterDeviceId,
  )}&deviceName=${encodeURIComponent(getDeviceName())}`;

  const es = new EventSource(url, {
    fetch: (input, init) =>
      fetch(input, {
        ...init,
        headers: {
          ...init?.headers,
          Authorization: `Bearer ${jwt}`,
        },
      }),
  });

  es.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data as string) as {
        type?: string;
        approvers?: DeviceItem[];
        approved?: boolean;
        encryptedPassphrase?: string;
      };

      if (message.type === "approve") {
        void handleApproveMessage(message);
      } else if (message.type === APPROVERS_LIST && message.approvers) {
        deviceFlowRequester.approvers = message.approvers;
      }
    } catch {
      // ignore malformed payloads
    }
  };

  es.onerror = () => {
    es.close();
    connection = null;
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      if (attached && auth.jwtToken) {
        openStream();
      }
    }, 3000);
  };

  connection = es;
}

async function handleApproveMessage(message: {
  type?: string;
  approved?: boolean;
  encryptedPassphrase?: string;
}) {
  if (
    message.type !== "approve" ||
    !message.approved ||
    !message.encryptedPassphrase
  ) {
    return;
  }
  const priv = deviceFlowRequester.unlockRequestPrivateKey;
  if (!priv) return;

  try {
    const decryptedPassphrase = await AsymmetricCrypto.decrypt(
      message.encryptedPassphrase,
      priv,
    );
    await unlock(decryptedPassphrase);
    deviceFlowRequester.unlockRequestPrivateKey = null;
    deviceFlowRequester.unlockRequestPin = null;
  } catch {
    // decryption failures stay silent (no passphrase leakage)
  }
}

export function attachDeviceFlowRequester() {
  attached = true;
  closeConnection();
  openStream();
}

export function detachDeviceFlowRequester() {
  attached = false;
  closeConnection();
  deviceFlowRequester.approvers = [];
  deviceFlowRequester.unlockRequestPin = null;
  deviceFlowRequester.unlockRequestPrivateKey = null;
}

export async function requestUnlockFromDevice(deviceId: string): Promise<void> {
  const jwt = auth.jwtToken;
  if (!jwt) return;

  const keyPair = await AsymmetricCrypto.generateKeyPair();
  deviceFlowRequester.unlockRequestPrivateKey = keyPair.privateKey;

  const pin = randomIntInRange(100000, 1000000).toString();
  deviceFlowRequester.unlockRequestPin = pin;

  const requesterDeviceId = getDeviceId();
  const message = {
    type: "request",
    publicKey: keyPair.publicKey,
    requesterDeviceId,
    pin,
    timestamp: new Date().toISOString(),
  };

  await DeviceFlowApi.sendMessage(jwt, "requester", message, deviceId);
}
