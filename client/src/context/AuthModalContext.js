import { createContext, useCallback, useContext, useMemo, useState } from "react";
import AuthModal from "../components/auth/AuthModal";

const AuthModalContext = createContext(null);

/** Lets any component open the sign-in dialog: const { openAuth } = useAuthModal(); */
export function AuthModalProvider({ children }) {
  const [state, setState] = useState({ open: false, mode: "login", onSuccess: null });

  const openAuth = useCallback((mode = "login", onSuccess = null) => setState({ open: true, mode, onSuccess }), []);
  const closeAuth = useCallback(() => setState((s) => ({ ...s, open: false })), []);
  const value = useMemo(() => ({ openAuth, closeAuth }), [openAuth, closeAuth]);

  return (
    <AuthModalContext.Provider value={value}>
      {children}
      {state.open && <AuthModal initialMode={state.mode} onSuccess={state.onSuccess} onClose={closeAuth} />}
    </AuthModalContext.Provider>
  );
}

export const useAuthModal = () => {
  const ctx = useContext(AuthModalContext);
  if (!ctx) throw new Error("useAuthModal must be used inside <AuthModalProvider>");
  return ctx;
};
