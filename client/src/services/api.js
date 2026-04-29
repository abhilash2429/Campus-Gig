import axios from "axios";
import { auth } from "../firebase/config";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

api.interceptors.request.use(async (config) => {
  config.headers = config.headers || {};

  const currentUser = auth.currentUser;
  if (currentUser) {
    const forceRefresh = Boolean(config._retryWithRefresh);
    const token = await currentUser.getIdToken(forceRefresh);
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._authRetried &&
      auth.currentUser
    ) {
      originalRequest._authRetried = true;
      originalRequest._retryWithRefresh = true;
      return api(originalRequest);
    }
    return Promise.reject(error);
  },
);

export default api;

/** Normalizes paginated gig list API responses. */
export function gigsFromResponse(data) {
  if (Array.isArray(data)) return data;
  return data?.gigs ?? [];
}

/** Normalizes paginated applicants API responses. */
export function applicationsFromResponse(data) {
  if (Array.isArray(data)) return data;
  return data?.applications ?? [];
}
