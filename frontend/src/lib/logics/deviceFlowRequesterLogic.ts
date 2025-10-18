import { actions, connect, events, kea, listeners, path, reducers } from "kea";
import { loaders } from "kea-loaders";
import { DeviceFlowApi, type Device } from "../api/device-flow.api";
import { authLogic } from "./authLogic";
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
  }),

  reducers({
    refreshInterval: [
      null as NodeJS.Timeout | null,
      {
        setRefreshInterval: (_, { intervalId }) => intervalId,
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
  })),
]);
