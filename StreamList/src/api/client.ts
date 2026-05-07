import axios, { AxiosError } from 'axios';
import { TMDB_ACCESS_TOKEN, TMDB_BASE_URL } from '@env';

/** TMDB v3 API — used if @env omits or inlines an empty TMDB_BASE_URL. */
const TMDB_API_BASE_DEFAULT = 'https://api.themoviedb.org/3';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly statusCode?: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function isApiError(value: unknown): value is ApiError {
  return value instanceof ApiError;
}

/** True when the request was intentionally cancelled (abort or axios cancel). */
export function isRequestAborted(error: unknown): boolean {
  if (axios.isCancel(error)) {
    return true;
  }
  if (error && typeof error === 'object') {
    const o = error as { name?: string; code?: string };
    if (o.name === 'AbortError' || o.code === 'ERR_CANCELED') {
      return true;
    }
  }
  return false;
}

function normalizeAxiosError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const ax = error as AxiosError<{ status_message?: string }>;
    const status = ax.response?.status;
    if (ax.response == null && (ax.code === 'ERR_NETWORK' || ax.message === 'Network Error')) {
      return new ApiError(
        'Could not reach TMDB (network). Check Wi‑Fi/VPN, save StreamList/.env with TMDB_BASE_URL and TMDB_ACCESS_TOKEN, restart Metro with --reset-cache, and try again.',
        status,
      );
    }
    const msg =
      ax.response?.data?.status_message ??
      ax.message ??
      'Request failed';
    return new ApiError(msg, status);
  }
  if (error instanceof Error) {
    return new ApiError(error.message);
  }
  return new ApiError('Unknown error');
}

function normalizeAccessToken(raw: string | undefined): string {
  let t = (raw ?? '').trim();
  // .env often uses TMDB_ACCESS_TOKEN="..."; Babel may inline quotes — strip once.
  if (t.length >= 2 && t.startsWith('"') && t.endsWith('"')) {
    t = t.slice(1, -1).trim();
  }
  if (t.length >= 2 && t.startsWith("'") && t.endsWith("'")) {
    t = t.slice(1, -1).trim();
  }
  return t;
}

const token = normalizeAccessToken(TMDB_ACCESS_TOKEN);

const baseURL = (TMDB_BASE_URL ?? '').trim().replace(/\/$/, '') || TMDB_API_BASE_DEFAULT;

export const apiClient = axios.create({
  baseURL,
  timeout: 20000,
  // RN + New Architecture: default XHR adapter often surfaces bogus "Network Error" for HTTPS APIs.
  adapter: 'fetch',
  headers: {
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  },
});

apiClient.interceptors.response.use(
  response => response,
  error => {
    return Promise.reject(normalizeAxiosError(error));
  },
);

export async function apiGet<T>(
  path: string,
  config?: { signal?: AbortSignal; params?: Record<string, string | number | undefined> },
): Promise<T> {
  if (!token) {
    throw new ApiError(
      'TMDB_ACCESS_TOKEN is missing at runtime. Fix: (1) Put the token on one line as TMDB_ACCESS_TOKEN=your_token in StreamList/.env with no spaces around =. (2) Save the file — Metro reads the copy on disk, not unsaved editor buffers. (3) Restart Metro: npx react-native start --reset-cache. Optional: export TMDB_ACCESS_TOKEN=... in the same shell before npm start so Babel can merge it.',
    );
  }
  const { data } = await apiClient.get<T>(path, {
    signal: config?.signal,
    params: config?.params,
  });
  return data;
}
