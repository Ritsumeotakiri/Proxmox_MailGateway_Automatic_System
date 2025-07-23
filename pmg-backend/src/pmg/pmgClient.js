import axios from 'axios';
import https from 'https';
import { loginToPMG } from './pmgAuthService.js';

let authData = null;
let tokenExpiry = null; // Optional expiry tracking (adjust as needed)

// Refresh auth and update expiry (example: 30 minutes expiry)
async function refreshAuth() {
  authData = await loginToPMG();
  // If PMG returns expiry info, use that; otherwise, assume 30 mins validity
  tokenExpiry = Date.now() + 30 * 60 * 1000;
  // console.log('PMG API tokens refreshed');
}

export async function getPmgAxios() {
  const pmgBaseUrl = process.env.PMG_API_URL;
  if (!pmgBaseUrl) {
    throw new Error('PMG_API_URL is not defined');
  }

  const instance = axios.create({
    baseURL: pmgBaseUrl + '/api2/json',
    httpsAgent: new https.Agent({ rejectUnauthorized: false }),
  });

  instance.interceptors.request.use(async (config) => {
    if (!authData || Date.now() >= tokenExpiry) {
      await refreshAuth();
    }

    config.headers['Cookie'] = `PMGAuthCookie=${authData.ticket}`;

    if (config.method !== 'get') {
      config.headers['CSRFPreventionToken'] = authData.CSRFPreventionToken;
    }

    // Log full URL with query params (only if not production)
    if (process.env.NODE_ENV !== 'production') {
      const url = new URL(config.url, config.baseURL);
      if (config.params) {
        Object.entries(config.params).forEach(([key, val]) =>
          url.searchParams.append(key, val)
        );
      }
      // console.log('PMG Request URL:', url.toString());
    }

    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (
        error.response &&
        error.response.status === 401 &&
        !originalRequest._retry
      ) {
        originalRequest._retry = true; // flag to avoid infinite loop

        await refreshAuth();

        // Clone originalRequest headers to avoid mutation issues
        originalRequest.headers = {
          ...originalRequest.headers,
          'CSRFPreventionToken': authData.CSRFPreventionToken,
          'Cookie': `PMGAuthCookie=${authData.ticket}`,
        };

        return instance(originalRequest);
      }

      return Promise.reject(error);
    }
  );

  return instance;
}
