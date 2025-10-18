import { actions, connect, events, kea, listeners, path, reducers } from "kea";
import { loaders } from "kea-loaders";
import { DeviceFlowApi, type Device } from "../api/device-flow.api";
import { authLogic } from "./authLogic";
import { keyLogic } from "./keyLogic";
import { AsymmetricCrypto } from "../crypto/crypto.asymmetric";
import { EventSourceWrapper } from "./EventSourceWrapper";
import { getDeviceId } from "../utils";
import type { deviceFlowRequesterLogicType } from "./deviceFlowRequesterLogicType";

const REFRESH_INTERVAL_MS = 1000;

export const deviceFlowRequesterLogic = kea<deviceFlowRequesterLogicType>([
  path(["src", "lib", "logics", "deviceFlowRequesterLogic"]),

  connect({
    values: [authLogic, ["jwtToken"]],
    actions: [keyLogic, ["setPassphrase", "decryptPrivateKey"]],
  }),

  actions({
    loadDevices: true,
    startRefreshing: true,
    stopRefreshing: true,
    setRefreshInterval: (intervalId: NodeJS.Timeout | null) => ({ intervalId }),
    sendMessage: (deviceId: string, message: any) => ({ deviceId, message }),
    sendMessageToAll: (message: any) => ({ message }),
    requestUnlock: true,
    setUnlockRequestPrivateKey: (privateKey: string | null) => ({ privateKey }),
    setUnlockRequestPin: (pin: string | null) => ({ pin }),
    openMessageStream: true,
    closeMessageStream: true,
    setMessageConnection: (connection: EventSourceWrapper | null) => ({
      connection,
    }),
    handleMessage: (message: any) => ({ message }),
    clearReceivedMessage: true,
    startRequester: true,
    stopRequester: true,
  }),

  reducers({
    refreshInterval: [
      null as NodeJS.Timeout | null,
      {
        setRefreshInterval: (_, { intervalId }) => intervalId,
      },
    ],
    unlockRequestPrivateKey: [
      null as string | null,
      {
        setUnlockRequestPrivateKey: (_, { privateKey }) => privateKey,
      },
    ],
    unlockRequestPin: [
      null as string | null,
      {
        setUnlockRequestPin: (_, { pin }) => pin,
      },
    ],
    messageConnection: [
      null as EventSourceWrapper | null,
      {
        setMessageConnection: (_, { connection }) => connection,
        closeMessageStream: () => null,
      },
    ],
    receivedMessage: [
      null as any,
      {
        handleMessage: (_, { message }) => message,
        clearReceivedMessage: () => null,
      },
    ],
  }),

  loaders(({ values }) => ({
    devices: [
      [] as Device[],
      {
        loadDevices: async () => {
          if (!values.jwtToken) {
            return [];
          }
          console.log("Loading devices");

          const devices = await DeviceFlowApi.getDevices(values.jwtToken);

          console.log("Devices loaded:", devices);

          return devices;
        },
      },
    ],
  })),

  events(({ actions }) => ({
    beforeUnmount: () => {
      actions.stopRequester();
    },
  })),

  listeners(({ actions, values }) => ({
    startRefreshing: () => {
      if (values.refreshInterval) {
        return;
      }

      const interval = setInterval(() => {
        actions.loadDevices();
      }, REFRESH_INTERVAL_MS);

      actions.setRefreshInterval(interval);
    },
    stopRefreshing: () => {
      if (values.refreshInterval) {
        clearInterval(values.refreshInterval);
        actions.setRefreshInterval(null);
      }
    },
    sendMessage: async ({ deviceId, message }) => {
      if (!values.jwtToken) {
        return;
      }

      await DeviceFlowApi.sendMessage(values.jwtToken, deviceId, message);
    },
    sendMessageToAll: async ({ message }) => {
      if (!values.jwtToken) {
        return;
      }

      const devices = values.devices;
      await Promise.all(
        devices.map((device) =>
          DeviceFlowApi.sendMessage(values.jwtToken!, device.deviceId, message)
        )
      );
    },
    requestUnlock: async () => {
      if (!values.jwtToken) {
        return;
      }

      const keyPair = await AsymmetricCrypto.generateKeyPair();
      actions.setUnlockRequestPrivateKey(keyPair.privateKey);

      const pin = Math.floor(100000 + Math.random() * 900000).toString();
      actions.setUnlockRequestPin(pin);

      const requesterDeviceId = getDeviceId();
      const message = {
        type: "request",
        publicKey: keyPair.publicKey,
        requesterDeviceId,
        pin,
        timestamp: new Date().toISOString(),
      };

      const devices = values.devices;
      await Promise.all(
        devices.map((device) =>
          DeviceFlowApi.sendMessage(values.jwtToken!, device.deviceId, message)
        )
      );
    },
    openMessageStream: () => {
      if (!values.jwtToken || values.messageConnection) {
        return;
      }

      const requesterDeviceId = getDeviceId();
      const eventSource = new EventSourceWrapper({
        url: `${
          import.meta.env.VITE_API_URL
        }/auth/device-flow/messages?deviceId=${requesterDeviceId}`,
        fetch: (input, init) =>
          fetch(input, {
            ...(init || {}),
            headers: {
              ...(init?.headers || {}),
              Authorization: `Bearer ${values.jwtToken}`,
            },
          }),
      });

      console.log("Message stream opened for deviceId:", requesterDeviceId);

      eventSource.onMessage((event) => {
        try {
          const message = JSON.parse(event.data);

          console.log(message);
          if (message.type === "approve") {
            actions.handleMessage(message);
          }
        } catch (e) {
          console.error("Failed to parse message:", e);
        }
      });

      eventSource.onError(() => {
        eventSource.close();
        actions.setMessageConnection(null);

        setTimeout(() => {
          if (values.jwtToken) {
            actions.openMessageStream();
          }
        }, 3000);
      });

      actions.setMessageConnection(eventSource);
    },
    closeMessageStream: () => {
      values.messageConnection?.close();
    },
    startRequester: () => {
      if (!values.jwtToken) {
        return;
      }
      actions.loadDevices();
      actions.startRefreshing();
      actions.openMessageStream();
    },
    stopRequester: () => {
      actions.stopRefreshing();
      actions.closeMessageStream();
    },
    handleMessage: async ({ message }) => {
      if (message.type === "approve" && message.approved) {
        if (!message.encryptedPassphrase || !values.unlockRequestPrivateKey) {
          return;
        }

        try {
          const decryptedPassphrase = await AsymmetricCrypto.decrypt(
            message.encryptedPassphrase,
            values.unlockRequestPrivateKey
          );

          actions.setPassphrase(decryptedPassphrase);
          await actions.decryptPrivateKey();

          actions.clearReceivedMessage();
        } catch (error) {
          console.error("Failed to decrypt passphrase:", error);
        }
      }
    },
  })),
]);
