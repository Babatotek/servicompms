/**
 * Centralised API client for SERVICOM ePMS backend.
 * Base URL: http://localhost:8000/api
 * Auth: Bearer token stored in localStorage under 'servicom_token'
 */

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';
const TOKEN_KEY = 'servicom_token';

export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);
export const setToken = (t: string) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return undefined as T;

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message =
      json?.message ??
      json?.errors
        ? Object.values(json.errors as Record<string, string[]>)
            .flat()
            .join(' ')
        : `HTTP ${res.status}`;
    throw new Error(message as string);
  }

  return json as T;
}

export const api = {
  get:    <T>(path: string)                  => request<T>('GET',    path),
  post:   <T>(path: string, body?: unknown)  => request<T>('POST',   path, body),
  patch:  <T>(path: string, body?: unknown)  => request<T>('PATCH',  path, body),
  delete: <T>(path: string)                  => request<T>('DELETE', path),
};

// ── Typed endpoint helpers ────────────────────────────────────────────────────

export const authApi = {
  login:  (email: string, password: string) =>
    api.post<{ token: string; user: any }>('/auth/login', { email, password }),
  me:     () => api.get<{ data: any }>('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

export const profileApi = {
  update: (data: { firstname?: string; surname?: string; othername?: string; phone?: string; avatar_url?: string }) =>
    api.patch<{ data: any }>('/profile', data),
  changePassword: (current_password: string, password: string, password_confirmation: string) =>
    api.patch<{ message: string }>('/profile/password', { current_password, password, password_confirmation }),
};

export const dashboardApi = {
  index: () => api.get<any>('/dashboard'),
};

export const contractApi = {
  mine:    (year: number)                          => api.get<any>(`/contracts/my/${year}`),
  store:   (year: number, templateId: number)      => api.post<any>('/contracts', { year, template_id: templateId }),
  submit:  (id: number)                            => api.patch<any>(`/contracts/${id}/submit`),
  approve: (id: number, comment?: string)          => api.patch<any>(`/contracts/${id}/approve`, { comment }),
  return:  (id: number, comment: string)           => api.patch<any>(`/contracts/${id}/return`, { comment }),
  pending: ()                                      => api.get<any>('/contracts/pending'),
};

export const appraisalApi = {
  mine:            (period: string)  => api.get<any>(`/appraisals/my/${period}`),
  store:           (body: any)       => api.post<any>('/appraisals', body),
  supervisorQueue: ()                => api.get<any>('/appraisals/supervisor-queue'),
  counterQueue:    ()                => api.get<any>('/appraisals/counter-queue'),
  review:          (id: number, action: 'approve'|'return', comment: string, rating?: number) =>
    api.patch<any>(`/appraisals/${id}/review`, { action, comment, rating }),
  counterSign:     (id: number, comment: string) =>
    api.patch<any>(`/appraisals/${id}/counter-sign`, { comment }),
  returnFromCounter: (id: number, comment: string) =>
    api.patch<any>(`/appraisals/${id}/return-from-counter`, { comment }),
};

export const leaderboardApi = {
  annual:      (year: number) => api.get<any>(`/leaderboard/annual/${year}`),
  quarter:     (year: number) => api.get<any>(`/leaderboard/quarter/${year}`),
  departments: (year: number) => api.get<any>(`/leaderboard/departments/${year}`),
};

export const analyticsApi = {
  me:  () => api.get<any>('/analytics/me'),
  org: () => api.get<any>('/analytics/org'),
};

export const mpmsApi = {
  dashboard:         (year: number)  => api.get<any>(`/mpms/dashboard/${year}`),
  kpis:              ()              => api.get<any>('/mpms/kpis'),
  storeAchievement:  (body: any)     => api.post<any>('/mpms/achievements', body),
  updateAchievement: (id: number, body: any) => api.patch<any>(`/mpms/achievements/${id}`, body),
};

export const adminApi = {
  users:             ()              => api.get<any>('/admin/users'),
  createUser:        (body: any)     => api.post<any>('/admin/users', body),
  updateUser:        (id: number, body: any) => api.patch<any>(`/admin/users/${id}`, body),
  departments:       ()              => api.get<any>('/admin/departments'),
  createDepartment:  (body: any)     => api.post<any>('/admin/departments', body),
  updateDepartment:  (id: string, body: any) => api.patch<any>(`/admin/departments/${id}`, body),
  settings:          ()              => api.get<any>('/admin/settings'),
  /**
   * Saves settings using the dot-notation pattern from the steering rule.
   * Frontend nests the payload before posting so Laravel's validator matches.
   */
  saveSettings: (flat: Record<string, any>) => {
    // Nest flat keys into deep object so Laravel validator matches dot-notation rules
    const nested: Record<string, any> = {};
    for (const [flatKey, value] of Object.entries(flat)) {
      const parts = flatKey.split('.');
      let cur = nested;
      for (let i = 0; i < parts.length - 1; i++) {
        cur[parts[i]] ??= {};
        cur = cur[parts[i]];
      }
      cur[parts[parts.length - 1]] = value;
    }
    return api.patch<any>('/admin/settings', { settings: nested });
  },
};
