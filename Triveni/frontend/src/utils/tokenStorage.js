// Backs the Login page's "Remember Me" checkbox: checked -> localStorage (survives closing the
// browser/tab), unchecked -> sessionStorage (cleared as soon as the tab/browser closes). Every
// read/write of these three keys goes through here - axiosClient's auth header + silent-refresh
// flow, and AuthContext's bootstrap/login/logout - so a session-only login behaves consistently
// everywhere, not just on the page that set it.
const KEYS = ['accessToken', 'refreshToken', 'user'];

// Whichever storage actually holds a live session right now. localStorage takes priority since
// setSession() below always clears the other one, so only one should ever be populated at a time.
function activeStorage() {
  return localStorage.getItem('refreshToken') ? localStorage : sessionStorage;
}

export function getToken(key) {
  return activeStorage().getItem(key);
}

/** Writes just the refreshed access token back into whichever storage the session already lives
 * in - used by axiosClient's silent-refresh-on-401 flow. */
export function setAccessToken(accessToken) {
  activeStorage().setItem('accessToken', accessToken);
}

/** Updates the cached user (role/permissions) in place, without touching either token - used
 * alongside setAccessToken() by the same silent-refresh flow, since /auth/refresh now also
 * returns the user's current role/permissions (see auth.service.js#refresh) so a role or
 * permission change picked up mid-session doesn't require a full logout/login to be reflected. */
export function setUser(user) {
  activeStorage().setItem('user', JSON.stringify(user));
}

export function setSession({ accessToken, refreshToken, user }, remember) {
  const store = remember ? localStorage : sessionStorage;
  const other = remember ? sessionStorage : localStorage;
  store.setItem('accessToken', accessToken);
  store.setItem('refreshToken', refreshToken);
  store.setItem('user', JSON.stringify(user));
  KEYS.forEach((k) => other.removeItem(k));
}

export function clearSession() {
  KEYS.forEach((k) => {
    localStorage.removeItem(k);
    sessionStorage.removeItem(k);
  });
}
