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
import { subscriptions } from "kea-subscriptions";
import { getDeviceId, getDeviceName } from "../utils";
import { authLogic } from "./authLogic";
import type { deviceFlowApproverLogicType } from "./deviceFlowApproverLogicType";
import { EventSourceWrapper } from "./EventSourceWrapper";
import { keyLogic } from "./keyLogic";

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
    openMessageStream: true,
    closeMessageStream: true,
    setMessageConnection: (connection: EventSourceWrapper | null) => ({
      connection,
    }),
    handleMessage: (message: any) => ({ message }),
    clearMessage: true,
  }),

  reducers({
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
    openMessageStream: () => {
      if (!values.jwtToken || values.messageConnection) {
        return;
      }

      const deviceId = getDeviceId();
      const eventSource = new EventSourceWrapper({
        url: `${
          import.meta.env.VITE_API_URL
        }/auth/device-flow/messages?role=approver&deviceId=${deviceId}&deviceName=${getDeviceName()}`,
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
    afterMount: () => {},
    beforeUnmount: () => {
      actions.closeMessageStream();
    },
  })),

  subscriptions(({ actions, values }) => ({
    browserIsUnlocked: (isUnlocked) => {
      if (isUnlocked && values.isLoggedIn) {
        actions.openMessageStream();
      } else {
        actions.closeMessageStream();
      }
    },
    isLoggedIn: (isLoggedIn) => {
      if (isLoggedIn && values.browserIsUnlocked) {
        actions.openMessageStream();
      } else {
        actions.closeMessageStream();
      }
    },
  })),
]);
