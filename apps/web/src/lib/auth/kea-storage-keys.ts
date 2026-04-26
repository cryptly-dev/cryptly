/** Matches kea-localstorage: prefix "secretly-app", path ["src","lib","logics",...] */
export const AUTH_JWT_STORAGE_KEY =
  "secretly-app_src_lib_logics_authLogic_jwtToken" as const;
export const AUTH_REFRESH_STORAGE_KEY =
  "secretly-app_src_lib_logics_authLogic_refreshToken" as const;
export const FTUX_QUEUED_STORAGE_KEY =
  "secretly-app_src_lib_logics_ftuxLogic_ftuxQueued" as const;

/** Kea-localstorage key used by the legacy SPA (`commonLogic.inviteIdToShowAfterLogin`). */
export const COMMON_INVITE_AFTER_LOGIN_KEY =
  "secretly-app_src_lib_logics_commonLogic_inviteIdToShowAfterLogin" as const;
