import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import api, { TOKEN_KEY, UNAUTHORIZED_EVENT, getErrorMessage } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  // true while we verify a stored token on first load, so protected pages don't flash "access denied"
  const [initializing, setInitializing] = useState(Boolean(localStorage.getItem(TOKEN_KEY)));

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const startSession = useCallback((newToken, newUser) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
    setUser(newUser);
  }, []);

  // Restore the session from the stored token (server is the source of truth).
  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) return undefined;
    let cancelled = false;
    api
      .get("/auth/me")
      .then(({ data }) => !cancelled && setUser(data.user))
      .catch(() => !cancelled && clearSession())
      .finally(() => !cancelled && setInitializing(false));
    return () => {
      cancelled = true;
    };
  }, [clearSession]);

  useEffect(() => {
    window.addEventListener(UNAUTHORIZED_EVENT, clearSession);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, clearSession);
  }, [clearSession]);

  const login = useCallback(
    async (email, password) => {
      try {
        const { data } = await api.post("/auth/login", { email, password });
        startSession(data.token, data.user);
        return { ok: true, user: data.user };
      } catch (error) {
        return { ok: false, error: getErrorMessage(error, "Sign in failed") };
      }
    },
    [startSession]
  );

  const value = useMemo(
    () => ({
      user,
      token,
      initializing,
      login,
      startSession,
      logout: clearSession,
      updateUser: (patch) => setUser((u) => (u ? { ...u, ...patch } : u)),
      isAdmin: user?.role === "admin",
      isModerator: user?.role === "moderator",
      isCustomer: user?.role === "user",
    }),
    [user, token, initializing, login, startSession, clearSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};
