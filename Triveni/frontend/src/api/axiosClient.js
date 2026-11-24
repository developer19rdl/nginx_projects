import axios from 'axios';
import { getToken, setAccessToken, setUser, clearSession } from '../utils/tokenStorage';

// AuthContext lives inside React and can't be imported here (this module has no component tree of
// its own), but it needs to know when a silent refresh below brings back a role/permission change
// so hasPermission()/the nav actually re-render with it rather than needing a full reload - a
// plain window event is the simplest bridge across that boundary. AuthContext listens for this.
export const USER_REFRESHED_EVENT = 'tiveni:user-refreshed';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  timeout: 30000,
});

axiosClient.interceptors.request.use((config) => {
  const token = getToken('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let pendingRequests = [];

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response, config } = error;
    if (response?.status === 401 && !config._retry && getToken('refreshToken')) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingRequests.push({ resolve, reject, config });
        });
      }
      config._retry = true;
      isRefreshing = true;
      try {
        const refreshToken = getToken('refreshToken');
        const { data } = await axios.post(`${axiosClient.defaults.baseURL}/auth/refresh`, { refreshToken });
        setAccessToken(data.data.accessToken);
        if (data.data.user) {
          setUser(data.data.user);
          window.dispatchEvent(new CustomEvent(USER_REFRESHED_EVENT, { detail: data.data.user }));
        }
        pendingRequests.forEach((p) => axiosClient(p.config).then(p.resolve).catch(p.reject));
        pendingRequests = [];
        return axiosClient(config);
      } catch (refreshError) {
        clearSession();
        window.location.href = `${import.meta.env.BASE_URL || '/'}login`;
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
