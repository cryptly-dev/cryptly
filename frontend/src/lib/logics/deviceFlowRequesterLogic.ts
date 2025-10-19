import { actions, connect, events, kea, listeners, path, reducers } from "kea";
import { DeviceFlowApi, type Device } from "../api/device-flow.api";
import { AsymmetricCrypto } from "../crypto/crypto.asymmetric";
import { getDeviceId, getDeviceName } from "../utils";
import { authLogic } from "./authLogic";
import type { deviceFlowRequesterLogicType } from "./deviceFlowRequesterLogicType";
import { EventSourceWrapper } from "./EventSourceWrapper";
import { keyLogic } from "./keyLogic";

export const deviceFlowRequesterLogic = kea<deviceFlowRequesterLogicType>([
  path(["src", "lib", "logics", "deviceFlowRequesterLogic"]),

  connect({
    values: [authLogic, ["jwtToken"]],
    actions: [keyLogic, ["setPassphrase", "decryptPrivateKey"]],
  }),

  actions({
    sendMessage: (
      deviceId: string,
      message: any,
      role: "requester" | "approver"
    ) => ({ deviceId, message, role }),
    requestUnlock: (deviceId: string) => ({ deviceId }),
    setUnlockRequestPrivateKey: (privateKey: string | null) => ({ privateKey }),
    setUnlockRequestPin: (pin: string | null) => ({ pin }),
    openMessageStream: true,
    closeMessageStream: true,
    setMessageConnection: (connection: EventSourceWrapper | null) => ({
      connection,
    }),
    handleMessage: (message: any) => ({ message }),
    setApprovers: (approvers: Device[]) => ({ approvers }),
    clearReceivedMessage: true,
    startRequester: true,
    stopRequester: true,
  }),

  reducers({
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
    approvers: [
      [] as Device[],
      {
        setApprovers: (_, { approvers }) => approvers,
      },
    ],
  }),

  events(({ actions }) => ({
    beforeUnmount: () => {
      actions.stopRequester();
    },
  })),

  listeners(({ actions, values }) => ({
    sendMessage: async ({ deviceId, message, role }) => {
      if (!values.jwtToken) {
        return;
      }

      await DeviceFlowApi.sendMessage(values.jwtToken, role, message, deviceId);
    },
    requestUnlock: async ({ deviceId }) => {
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

      actions.sendMessage(deviceId, message, "requester");
    },
    openMessageStream: () => {
      if (!values.jwtToken || values.messageConnection) {
        return;
      }

      const requesterDeviceId = getDeviceId();
      const eventSource = new EventSourceWrapper({
        url: `${
          import.meta.env.VITE_API_URL
        }/auth/device-flow/messages?role=requester&deviceId=${requesterDeviceId}&deviceName=${getDeviceName()}`,
        fetch: (input, init) =>
          fetch(input, {
            ...(init || {}),
            headers: {
              ...(init?.headers || {}),
              Authorization: `Bearer ${values.jwtToken}`,
            },
          }),
      });

      eventSource.onMessage((event) => {
        try {
          const message = JSON.parse(event.data);

          if (message.type === "approve") {
            actions.handleMessage(message);
          } else if (message.type === "approvers-list") {
            actions.setApprovers(message.approvers);
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
      actions.closeMessageStream();
      actions.openMessageStream();
    },
    stopRequester: () => {
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
