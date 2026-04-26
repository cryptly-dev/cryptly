import { useValues } from "kea";
import { authLogic } from "../logics/authLogic";

export function useIsAdmin(): boolean {
  const { userData } = useValues(authLogic);
  return !!userData?.isAdmin;
}
