import { authLogic } from "../logics/authLogic";
import { useActions } from "kea";
import { keyLogic } from "../logics/keyLogic";

export function useAuth() {
  const { logout: authLogout } = useActions(authLogic);
  const { reset } = useActions(keyLogic);

  const logout = () => {
    authLogout();
    reset();
  };

  return { logout };
}
