import {
  actions,
  connect,
  events,
  kea,
  listeners,
  path,
  reducers,
  selectors,
} from "kea";
import { DeviceFlowApi } from "../api/device-flow.api";
import { authLogic } from "./authLogic";
import { keyLogic } from "./keyLogic";
import { EventSourceWrapper } from "./EventSourceWrapper";
import { getDeviceId, getDeviceName } from "../utils";
import type { deviceFlowApproverLogicType } from "./deviceFlowApproverLogicType";

const PING_INTERVAL_MS = 5000;

export const deviceFlowApproverLogic = kea<deviceFlowApproverLogicType>([
  path(["src", "lib", "logics", "deviceFlowApproverLogic"]),

  connect({
    values: [
      authLogic,
      ["jwtToken", "isLoggedIn"],
      keyLogic,
      ["browserIsUnlocked"],
    ],
  }),

  actions({
    ping: true,
    startPinging: true,
    stopPinging: true,
    setPingInterval: (intervalId: any) => ({ intervalId }),
    openMessageStream: true,
    closeMessageStream: true,
    setMessageConnection: (connection: EventSourceWrapper | null) => ({
      connection,
    }),
    handleMessage: (message: any) => ({ message }),
    clearMessage: true,
  }),

  reducers({
    pingInterval: [
      null as any,
      {
        setPingInterval: (_, { intervalId }) => intervalId,
      },
    ],
    messageConnection: [
      null as EventSourceWrapper | null,
      {
        setMessageConnection: (_, { connection }) => connection,
        closeMessageStream: () => null,
      },
    ],
    lastMessage: [
      null as any,
      {
        handleMessage: (_, { message }) => message,
        clearMessage: () => null,
      },
    ],
  }),

  selectors({
    hasNewMessage: [
      (s) => [s.lastMessage],
      (lastMessage) => lastMessage !== null,
    ],
  }),

  listeners(({ values, actions }) => ({
    ping: async () => {
      if (!values.jwtToken || !values.isLoggedIn || !values.browserIsUnlocked) {
        return;
      }

      const deviceId = getDeviceId();
      const deviceName = getDeviceName();

      await DeviceFlowApi.ping(values.jwtToken, deviceId, deviceName);
    },
    startPinging: () => {
      if (values.pingInterval) {
        return;
      }

      const interval = setInterval(() => {
        deviceFlowApproverLogic.actions.ping();
      }, PING_INTERVAL_MS);

      actions.setPingInterval(interval);
    },
    stopPinging: () => {
      if (values.pingInterval) {
        clearInterval(values.pingInterval);
        actions.setPingInterval(null);
      }
    },
    openMessageStream: () => {
      if (!values.jwtToken || values.messageConnection) {
        return;
      }

      const deviceId = getDeviceId();
      const eventSource = new EventSourceWrapper({
        url: `${
          import.meta.env.VITE_API_URL
        }/auth/device-flow/messages?deviceId=${deviceId}`,
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
          if (message.type === "request") {
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
          if (values.isLoggedIn) {
            actions.openMessageStream();
          }
        }, 3000);
      });

      actions.setMessageConnection(eventSource);
    },
    closeMessageStream: () => {
      values.messageConnection?.close();
    },
  })),

  events(({ actions }) => ({
    afterMount: () => {
      actions.ping();
      actions.startPinging();
      actions.openMessageStream();
    },
    beforeUnmount: () => {
      actions.stopPinging();
      actions.closeMessageStream();
    },
  })),
]);
