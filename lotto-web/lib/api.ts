import axios from "axios";

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any) => {
  failedQueue.forEach((prom) => (error ? prom.reject(error) : prom.resolve()));
  failedQueue = [];
};

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});


api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 1. Basic checks
    if (!error.response) return Promise.reject(error);
    if (error.response.status !== 401) return Promise.reject(error);

    // 2. Ignore refresh and login endpoints from retrying themselves
    if (
      originalRequest.url?.includes("/auth/refresh") ||
      originalRequest.url?.includes("/auth/login")
    ) {
      return Promise.reject(error);
    }

    // 3. Prevent infinite loops on a retried request that still gets 401
    if ((originalRequest as any)._retry) {
      // Tokens are fully invalid (refresh token likely expired too)
      // Clear all state and redirect. We use window.location as Next.js router might not be available here.
      // Note: localStorage is probably unnecessary if tokens are only in httpOnly cookies.
      // Keeping it just in case other state is there.
      localStorage.clear();
      window.location.href = "/sign-in";
      return Promise.reject(error);
    }

    // 4. Handle Concurrency: Queue the current request if a refresh is in progress
    if (isRefreshing) {
      return (
        new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          // Once refresh is done, retry the original request
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err))
      );
    }

    // 5. Initiate Refresh Token Flow (First 401 request)
    (originalRequest as any)._retry = true;
    isRefreshing = true;

    try {
      // Note: Use the base 'axios' instance OR a new un-intercepted 'api' instance
      // to prevent an infinite loop where the refresh call gets intercepted.
      // Since the original `api` instance has the interceptor, we call it directly here.
      // The Response Interceptor ignores the /auth/refresh URL, which is safe.
      await api.post("/auth/refresh", {}, { withCredentials: true });

      // Refresh succeeded
      processQueue(null);
      isRefreshing = false;

      // Retry the original request (it will now carry the newly set access_token cookie)
      return api(originalRequest);
    } catch (refreshError) {
      // Refresh failed (e.g., refresh_token is expired/invalid)
      processQueue(refreshError);
      isRefreshing = false;
      localStorage.clear();
      window.location.href = "/sign-in";
      return Promise.reject(refreshError);
    }
  }
);

export default api;
