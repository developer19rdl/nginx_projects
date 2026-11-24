import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import * as authApi from '../api/auth.api';
import { USER_REFRESHED_EVENT } from '../api/axiosClient';
import { getToken, setSession, clearSession } from '../utils/tokenStorage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = getToken('user');
    return raw ? JSON.parse(raw) : null;
  });

  // `remember` mirrors the Login page's "Remember Me" checkbox - true (the default) persists the
  // session across browser restarts, false confines it to sessionStorage for this tab only.
  const login = useCallback(async (email, password, remember = true) => {
    const result = await authApi.login({ email, password });
    setSession(result, remember);
    setUser(result.user);
    return result.user;
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  // axiosClient's silent-refresh flow (on any 401, e.g. the access token expiring) fetches this
  // user's *current* role/permissions and persists them to storage, then fires this event - pick
  // it up here so a role/permission change made elsewhere shows up in this tab's nav/hasPermission
  // checks without the user needing to log out and back in. Only ever narrows/widens what's
  // already displayed; the actual access-control decision is enforced server-side regardless (see
  // middleware/auth.js), this is purely keeping the UI honest about it.
  useEffect(() => {
    const onUserRefreshed = (e) => setUser(e.detail);
    window.addEventListener(USER_REFRESHED_EVENT, onUserRefreshed);
    return () => window.removeEventListener(USER_REFRESHED_EVENT, onUserRefreshed);
  }, []);

  const hasPermission = useCallback(
    (...codes) => {
      if (!user) return false;
      return codes.some((c) => user.permissions?.includes(c));
    },
    [user]
  );

  const value = useMemo(() => ({ user, login, logout, hasPermission }), [user, login, logout, hasPermission]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
