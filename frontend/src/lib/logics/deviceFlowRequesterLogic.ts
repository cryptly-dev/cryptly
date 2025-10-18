import { actions, connect, events, kea, listeners, path, reducers } from "kea";
import { loaders } from "kea-loaders";
import { DeviceFlowApi, type Device } from "../api/device-flow.api";
import { authLogic } from "./authLogic";
import { AsymmetricCrypto } from "../crypto/crypto.asymmetric";
import type { deviceFlowRequesterLogicType } from "./deviceFlowRequesterLogicType";

const REFRESH_INTERVAL_MS = 1000;

export const deviceFlowRequesterLogic = kea<deviceFlowRequesterLogicType>([
  path(["src", "lib", "logics", "deviceFlowRequesterLogic"]),

  connect({
    values: [authLogic, ["jwtToken"]],
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
  }),

  loaders(({ values }) => ({
    devices: [
      [] as Device[],
      {
        loadDevices: async () => {
          if (!values.jwtToken) {
            return [];
          }

          const devices = await DeviceFlowApi.getDevices(values.jwtToken);

          return devices;
        },
      },
    ],
  })),

  events(({ actions }) => ({
    afterMount: () => {
      actions.loadDevices();
      actions.startRefreshing();
    },
    beforeUnmount: () => {
      actions.stopRefreshing();
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

      const message = {
        type: "unlock-request",
        publicKey: keyPair.publicKey,
        timestamp: new Date().toISOString(),
      };

      const devices = values.devices;
      await Promise.all(
        devices.map((device) =>
          DeviceFlowApi.sendMessage(values.jwtToken!, device.deviceId, message)
        )
      );
    },
  })),
]);
