import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_URL = 'http://127.0.0.1:8000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        // Don't logout if using demo token, just let the request fail
        if (token !== 'demo-token') {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export interface ApiResponse<T> {
  data: T;
  meta?: {
    page: number;
    limit: number;
    cached: boolean;
    total?: number;
    last_page?: number;
  };
}

export interface Anime {
  id: string;
  title: string;
  slug: string;
  genre: string;
  description: string;
  image_url: string;
  links?: {
    self: string;
  };
}

export interface AnalyticsData {
  total_requests: number;
  average_response_time: number;
  methods: Record<string, number>;
  status_codes: Record<string, number>;
  daily_requests: Record<string, number>;
  recent_requests: {
    timestamp: string;
    method: string;
    endpoint: string;
    status: number;
    duration: number;
    ip: string;
  }[];
}

export interface Webhook {
  id: string;
  url: string;
  events: string[];
  is_active: boolean;
  created_at: string;
}

export interface HealthStatus {
  status: string;
  checks: {
    database: string;
    cache: string;
    firestore: string;
  };
  memory_usage: {
    used: string;
    peak: string;
  };
  uptime: string;
  server_time: string;
}

export interface AuditLog {
  id: number;
  user_id: string;
  action: string;
  model_type: string;
  model_id: string;
  old_values: any;
  new_values: any;
  ip_address: string;
  created_at: string;
}

export interface DashboardStats {
  anime_count: number;
  user_count: number;
}

import { MOCK_ANALYTICS, MOCK_HEALTH, MOCK_WEBHOOKS } from './mock-data';

const isDemo = () => typeof window !== 'undefined' && localStorage.getItem('token') === 'demo-token';

export const apiService = {
  // Auth
  login: (token: string) => {
    localStorage.setItem('token', token);
  },
  loginWithGoogle: (token: string) => api.post<{ token: string }>('/auth/google', { token }),
  logout: async () => {
    try {
      if (!isDemo()) await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('token');
    }
  },
  checkAdmin: () => isDemo() ? Promise.resolve({ data: true }) : api.get('/admin-check'),

  // Anime
  getAnimeList: (page = 1, search = '', genre = '') =>
    api.get<ApiResponse<Anime[]>>('/anime/search', { params: { page, q: search, genre } }),
  getAnime: (id: string) => api.get<ApiResponse<Anime>>(`/anime/${id}`),
  createAnime: (data: Partial<Anime>) => api.post<ApiResponse<Anime>>('/anime', data),
  updateAnime: (id: string, data: Partial<Anime>) => api.put<ApiResponse<Anime>>(`/anime/${id}`, data),
  deleteAnime: (id: string) => api.delete(`/anime/${id}`),
  getGenres: () => api.get<Record<string, number>>('/anime/genres'),

  // Analytics
  getAnalytics: () => isDemo() ? Promise.resolve({ data: MOCK_ANALYTICS }) : api.get<AnalyticsData>('/analytics/dashboard'),
  getDashboardStats: () => isDemo() ? Promise.resolve({ data: { anime_count: 150, user_count: 42 } }) : api.get<DashboardStats>('/dashboard/stats'),
  getAuditLogs: () => isDemo() ? Promise.resolve({ data: { data: [] } }) : api.get<ApiResponse<AuditLog[]>>('/audit-logs'),

  // Webhooks
  getWebhooks: () => isDemo() ? Promise.resolve({ data: { data: MOCK_WEBHOOKS, meta: { page: 1, limit: 10, cached: false } } }) : api.get<ApiResponse<Webhook[]>>('/webhooks'),
  createWebhook: (data: { url: string; events: string[] }) => isDemo() ? Promise.resolve({ data: { data: { ...data, id: 'mock-id', is_active: true, created_at: new Date().toISOString() } } }) : api.post<ApiResponse<Webhook>>('/webhooks', data),
  deleteWebhook: (id: string) => isDemo() ? Promise.resolve() : api.delete(`/webhooks/${id}`),

  // Health
  getHealth: () => isDemo() ? Promise.resolve({ data: MOCK_HEALTH }) : api.get<HealthStatus>('/health'),
};
