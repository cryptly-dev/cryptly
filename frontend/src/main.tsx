import "@fontsource-variable/funnel-display";
import "./index.css";

import { RouterProvider, createRouter } from "@tanstack/react-router";
import { resetContext } from "kea";
import ReactDOM from "react-dom/client";
// Import the generated route tree
import axios from "axios";
import { loadersPlugin } from "kea-loaders";
import { localStoragePlugin } from "kea-localstorage";
import { routerPlugin } from "kea-router";
import { subscriptionsPlugin } from "kea-subscriptions";
import { PostHogProvider } from "posthog-js/react";
import { AuthApi } from "./lib/api/auth.api";
import { authLogic } from "./lib/logics/authLogic";
import { withTimeout } from "./lib/utils";
import { routeTree } from "./routeTree.gen";

// Create a new router instance
const router = createRouter({ routeTree });

resetContext({
  plugins: [
    routerPlugin,
    loadersPlugin,
    subscriptionsPlugin,
    localStoragePlugin({
      storageEngine: window.localStorage,
      prefix: "secretly-app",
      separator: "_",
    }),
  ],
});

const posthogOptions = {
  api_host: "https://eu.posthog.com",
};

axios.defaults.baseURL = import.meta.env.VITE_API_URL;

const REFRESH_URL = "/auth/refresh";
let refreshPromise: Promise<string> | null = null;

function getStoredRefreshToken(): string | null {
  return authLogic.findMounted()?.values.refreshToken ?? null;
}

async function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const storedRefreshToken = getStoredRefreshToken();
      if (!storedRefreshToken) {
        throw new Error("No refresh token available");
      }

      const result = await AuthApi.refresh(storedRefreshToken);
      authLogic.findMounted()?.actions.setTokens(
        result.token,
        result.refreshToken
      );
      return result.token;
    })().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

// Add global axios interceptor to handle 401 responses by refreshing the token
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const requestUrl: string | undefined = originalRequest?.url;

    const canAttemptRefresh =
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      requestUrl !== REFRESH_URL &&
      !!getStoredRefreshToken();

    if (canAttemptRefresh) {
      originalRequest._retry = true;

      try {
        const newAccessToken = await refreshAccessToken();

        if (originalRequest.headers?.Authorization) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        return axios(originalRequest);
      } catch {
        localStorage.clear();
        router.navigate({ to: "/app/login" });
        return Promise.reject(error);
      }
    }

    if (status === 401) {
      localStorage.clear();
      router.navigate({ to: "/app/login" });
    }

    return Promise.reject(error);
  }
);

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

async function renderApp() {
  await withTimeout(document.fonts.ready, 3000);

  const rootElement = document.getElementById("root")!;
  if (!rootElement.innerHTML) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <PostHogProvider
        apiKey={import.meta.env.VITE_POSTHOG_KEY}
        options={posthogOptions}
      >
        <RouterProvider router={router} />
      </PostHogProvider>
    );
  }
}

renderApp();
