import "@fontsource-variable/open-sans";
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
  api_host: "https://ph.cryptly.dev",
};

axios.defaults.baseURL = import.meta.env.VITE_API_URL;

// Add global axios interceptor to handle 401 responses
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth token from localStorage
      localStorage.clear();

      // Redirect to login page
      window.location.href = "/app/login";
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
