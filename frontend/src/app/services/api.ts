import { Artisan, LoginData, LoginResponse, RegisterResponse } from '../types';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api').replace(/\/$/, '');

interface ApiError {
  error?: string;
  errors?: Record<string, string[]>;
  status_code: number;
}

interface RefreshResponse {
  access: string;
  refresh?: string;
}

interface ApiRequestConfig {
  skipAuth?: boolean;
  retryOnAuthError?: boolean;
}

const buildUrl = (endpoint: string) => `${API_BASE_URL}${endpoint}`;

export const tokenService = {
  getAccessToken: () => localStorage.getItem('access_token'),
  getRefreshToken: () => localStorage.getItem('refresh_token'),
  setTokens: (access: string, refresh: string) => {
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
  },
  clearTokens: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('artisan');
  },
  getArtisan: (): Artisan | null => {
    const artisan = localStorage.getItem('artisan');
    if (!artisan) {
      return null;
    }
    try {
      return JSON.parse(artisan) as Artisan;
    } catch {
      localStorage.removeItem('artisan');
      return null;
    }
  },
  setArtisan: (artisan: Artisan) => {
    localStorage.setItem('artisan', JSON.stringify(artisan));
  },
};

const statusDefaultMessage: Record<number, string> = {
  400: 'Requete invalide.',
  401: 'Session expiree.',
  403: "Vous n'avez pas la permission d'effectuer cette action.",
  404: 'Ressource introuvable.',
  429: 'Trop de requetes, veuillez reessayer plus tard.',
};

async function parseApiError(response: Response): Promise<ApiError> {
  const fallback: ApiError = {
    error: statusDefaultMessage[response.status] || 'Une erreur est survenue.',
    status_code: response.status,
  };

  try {
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return fallback;
    }

    const data = await response.json();
    if (typeof data !== 'object' || data === null) {
      return fallback;
    }

    return {
      error: data.error,
      errors: data.errors,
      status_code: data.status_code || response.status,
    };
  } catch {
    return fallback;
  }
}

function redirectToLogin() {
  if (typeof window !== 'undefined') {
    window.location.href = '/login?expired=true';
  }
}

async function refreshToken(): Promise<boolean> {
  const refresh = tokenService.getRefreshToken();
  if (!refresh) {
    return false;
  }

  try {
    const response = await fetch(buildUrl('/token/refresh/'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    });

    if (!response.ok) {
      return false;
    }

    const data = (await response.json()) as RefreshResponse;
    if (!data.access) {
      return false;
    }

    tokenService.setTokens(data.access, data.refresh || refresh);
    return true;
  } catch {
    return false;
  }
}

function buildHeaders(options: RequestInit, skipAuth: boolean): Headers {
  const headers = new Headers(options.headers || {});
  const hasBody = options.body !== undefined && options.body !== null;
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;

  if (hasBody && !isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (!skipAuth) {
    const token = tokenService.getAccessToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  return headers;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  config: ApiRequestConfig = {}
): Promise<T> {
  const { skipAuth = false, retryOnAuthError = true } = config;
  const response = await fetch(buildUrl(endpoint), {
    ...options,
    headers: buildHeaders(options, skipAuth),
  });

  if (response.status === 401 && !skipAuth) {
    if (retryOnAuthError) {
      const refreshed = await refreshToken();
      if (refreshed) {
        return request<T>(endpoint, options, { ...config, retryOnAuthError: false });
      }
    }

    tokenService.clearTokens();
    redirectToLogin();
    throw new Error('Session expiree');
  }

  if (!response.ok) {
    throw await parseApiError(response);
  }

  if (response.status === 204 || response.status === 205) {
    return {} as T;
  }

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return {} as T;
  }

  return (await response.json()) as T;
}

function serializeBody(data?: unknown): BodyInit | undefined {
  if (data === undefined || data === null) {
    return undefined;
  }

  if (typeof FormData !== 'undefined' && data instanceof FormData) {
    return data;
  }

  return JSON.stringify(data);
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint, { method: 'GET' }),
  post: <T>(endpoint: string, data?: unknown, config?: ApiRequestConfig) =>
    request<T>(
      endpoint,
      {
        method: 'POST',
        body: serializeBody(data),
      },
      config
    ),
  put: <T>(endpoint: string, data?: unknown, config?: ApiRequestConfig) =>
    request<T>(
      endpoint,
      {
        method: 'PUT',
        body: serializeBody(data),
      },
      config
    ),
  patch: <T>(endpoint: string, data?: unknown, config?: ApiRequestConfig) =>
    request<T>(
      endpoint,
      {
        method: 'PATCH',
        body: serializeBody(data),
      },
      config
    ),
  delete: <T>(endpoint: string, config?: ApiRequestConfig) =>
    request<T>(endpoint, { method: 'DELETE' }, config),
  upload: <T>(
    endpoint: string,
    formData: FormData,
    method: 'POST' | 'PUT' | 'PATCH' = 'POST',
    config?: ApiRequestConfig
  ) =>
    request<T>(
      endpoint,
      {
        method,
        body: formData,
      },
      config
    ),
};

export const authApi = {
  login: (payload: LoginData) =>
    api.post<LoginResponse>('/login/', payload, { skipAuth: true }),
  register: (payload: FormData) =>
    api.upload<RegisterResponse>('/register/', payload, 'POST', { skipAuth: true }),
  profile: () => api.get<Artisan>('/profil/'),
  logout: () => {
    const refresh = tokenService.getRefreshToken();
    if (!refresh) {
      return Promise.resolve();
    }
    return api.post('/logout/', { refresh });
  },
};

export default api;
