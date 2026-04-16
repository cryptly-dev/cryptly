import {
  actions,
  defaults,
  kea,
  listeners,
  path,
  reducers,
  selectors,
} from "kea";

import { loaders } from "kea-loaders";
import { subscriptions } from "kea-subscriptions";
import { AuthApi } from "../api/auth.api";
import { UserApi, type User } from "../api/user.api";

import { router } from "kea-router";
import posthog from "posthog-js";
import type { authLogicType } from "./authLogicType";

export const authLogic = kea<authLogicType>([
  path(["src", "lib", "logics", "authLogic"]),

  actions({
    setJwtToken: (jwtToken: string) => ({ jwtToken }),
    setRefreshToken: (refreshToken: string) => ({ refreshToken }),
    setTokens: (jwtToken: string, refreshToken: string) => ({
      jwtToken,
      refreshToken,
    }),
    setUserData: (userData: User) => ({ userData }),

    reset: true,
    logout: true,
  }),

  defaults({
    userData: null as User | null,
  }),

  reducers({
    jwtToken: [
      null as string | null,
      {
        persist: true,
      },
      {
        setJwtToken: (_, { jwtToken }) => jwtToken,
        setTokens: (_, { jwtToken }) => jwtToken,
        reset: () => null,
        logout: () => null,
      },
    ],
    refreshToken: [
      null as string | null,
      {
        persist: true,
      },
      {
        setRefreshToken: (_, { refreshToken }) => refreshToken,
        setTokens: (_, { refreshToken }) => refreshToken,
        reset: () => null,
        logout: () => null,
      },
    ],
    userData: [
      null as User | null,
      {
        setUserData: (_, { userData }) => userData,
        reset: () => null,
        logout: () => null,
      },
    ],
  }),

  selectors({
    isLoggedIn: [(state) => [state.jwtToken], (jwtToken) => jwtToken !== null],
  }),

  loaders(({ values, actions }) => ({
    jwtToken: {
      exchangeGoogleCodeForJwt: async (
        googleCode: string
      ): Promise<string | null> => {
        const result = await AuthApi.loginGoogle(googleCode);
        actions.setRefreshToken(result.refreshToken);
        return result.token;
      },
      exchangeGithubCodeForJwt: async (
        githubCode: string
      ): Promise<string | null> => {
        const result = await AuthApi.loginGithub(githubCode);
        actions.setRefreshToken(result.refreshToken);
        return result.token;
      },
      loginLocal: async (email: string): Promise<string | null> => {
        const result = await AuthApi.loginLocal(email);
        actions.setRefreshToken(result.refreshToken);
        return result.token;
      },
    },
    userData: {
      loadUserData: async (): Promise<User> => {
        const userDataValue = await UserApi.getMe(values.jwtToken!);

        if (userDataValue.email) {
          posthog.identify(userDataValue.id, {
            email: userDataValue.email,
          });
        }

        return userDataValue;
      },
    },
  })),

  listeners(({ actions, values }) => ({
    logout: async () => {
      const currentRefreshToken = values.refreshToken;
      actions.reset();
      router.actions.push("/app/login");

      if (currentRefreshToken) {
        try {
          await AuthApi.logout(currentRefreshToken);
        } catch {
          // best effort; ignore errors
        }
      }
    },
  })),

  subscriptions(({ actions }) => ({
    jwtToken: (jwtToken) => {
      if (!jwtToken) {
        return;
      }

      actions.loadUserData();
    },
  })),
]);
