import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@/constants/api';

const TOKEN_KEY = 'auth_token';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;
const REQUEST_TIMEOUT = 30000;

// ============================================================================
// Types
// ============================================================================

export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ApiErrorBody {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface RequestConfig extends Omit<RequestInit, 'method' | 'body'> {
  method?: HttpMethod;
  body?: unknown;
  requiresAuth?: boolean;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

// ============================================================================
// Error Classes
// ============================================================================

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
  }

  static isApiError(error: unknown): error is ApiError {
    return error instanceof ApiError;
  }

  static isNetworkError(error: unknown): boolean {
    if (error instanceof TypeError && error.message === 'Network request failed') {
      return true;
    }
    return false;
  }

  static isTimeout(error: unknown): boolean {
    return error instanceof Error && error.message === 'Request timeout';
  }

  static isUnauthorized(error: unknown): boolean {
    return ApiError.isApiError(error) && error.status === 401;
  }

  static isForbidden(error: unknown): boolean {
    return ApiError.isApiError(error) && error.status === 403;
  }

  static isNotFound(error: unknown): boolean {
    return ApiError.isApiError(error) && error.status === 404;
  }

  static isServerError(error: unknown): boolean {
    return ApiError.isApiError(error) && error.status >= 500;
  }
}

// ============================================================================
// Token Management
// ============================================================================

async function getToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function setToken(token: string): Promise<void> {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.error('Failed to save token:', error);
  }
}

export async function removeToken(): Promise<void> {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.error('Failed to remove token:', error);
  }
}

// ============================================================================
// Request Interceptors
// ============================================================================

type RequestInterceptor = (config: RequestConfig) => RequestConfig | Promise<RequestConfig>;
type ResponseInterceptor = <T>(response: T, config: RequestConfig) => T | Promise<T>;
type ErrorInterceptor = (error: Error, config: RequestConfig) => void | Promise<void>;

const requestInterceptors: RequestInterceptor[] = [];
const responseInterceptors: ResponseInterceptor[] = [];
const errorInterceptors: ErrorInterceptor[] = [];

export function addRequestInterceptor(interceptor: RequestInterceptor) {
  requestInterceptors.push(interceptor);
}

export function addResponseInterceptor(interceptor: ResponseInterceptor) {
  responseInterceptors.push(interceptor);
}

export function addErrorInterceptor(interceptor: ErrorInterceptor) {
  errorInterceptors.push(interceptor);
}

// ============================================================================
// Core Fetch Function
// ============================================================================

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithTimeout(
  url: string,
  config: RequestInit,
  timeout: number
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...config,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function apiFetch<T>(
  path: string,
  config: RequestConfig = {}
): Promise<T> {
  const {
    method = 'GET',
    body,
    requiresAuth = true,
    timeout = REQUEST_TIMEOUT,
    retries = MAX_RETRIES,
    retryDelay = RETRY_DELAY,
    headers: customHeaders,
    ...restConfig
  } = config;

  // Apply request interceptors
  let processedConfig = config;
  for (const interceptor of requestInterceptors) {
    processedConfig = await interceptor(processedConfig);
  }

  // Build headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(customHeaders as Record<string, string>),
  };

  // Add auth token if required
  if (requiresAuth) {
    const token = await getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  // Build URL
  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`;

  // Build request config
  const requestConfig: RequestInit = {
    ...restConfig,
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  };

  // Execute request with retry logic
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetchWithTimeout(url, requestConfig, timeout);

      // Handle 401 Unauthorized
      if (response.status === 401) {
        await removeToken();
        throw new ApiError('Unauthorized', 401, 'UNAUTHORIZED');
      }

      // Handle non-OK responses
      if (!response.ok) {
        const errorBody: ApiErrorBody | null = await response.json().catch(() => null);
        throw new ApiError(
          errorBody?.message || `Request failed with status ${response.status}`,
          response.status,
          errorBody?.code,
          errorBody?.details
        );
      }

      // Parse response
      const contentType = response.headers.get('content-type');
      let data: T;

      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        data = {} as T;
      }

      // Apply response interceptors
      for (const interceptor of responseInterceptors) {
        data = await interceptor(data, config);
      }

      return data;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry on certain errors
      if (ApiError.isApiError(error)) {
        if (error.status === 401 || error.status === 403 || error.status === 404 || error.status === 422) {
          break;
        }
      }

      // Don't retry on timeout
      if (ApiError.isTimeout(error)) {
        break;
      }

      // Retry on network errors or 5xx errors
      if (attempt < retries) {
        await delay(retryDelay * (attempt + 1)); // Exponential backoff
        continue;
      }
    }
  }

  // Apply error interceptors
  for (const interceptor of errorInterceptors) {
    await interceptor(lastError!, config);
  }

  throw lastError;
}

// ============================================================================
// Convenience Methods
// ============================================================================

export const api = {
  get: <T>(path: string, config?: Omit<RequestConfig, 'method'>) =>
    apiFetch<T>(path, { ...config, method: 'GET' }),

  post: <T>(path: string, body?: unknown, config?: Omit<RequestConfig, 'method' | 'body'>) =>
    apiFetch<T>(path, { ...config, method: 'POST', body }),

  put: <T>(path: string, body?: unknown, config?: Omit<RequestConfig, 'method' | 'body'>) =>
    apiFetch<T>(path, { ...config, method: 'PUT', body }),

  patch: <T>(path: string, body?: unknown, config?: Omit<RequestConfig, 'method' | 'body'>) =>
    apiFetch<T>(path, { ...config, method: 'PATCH', body }),

  delete: <T>(path: string, config?: Omit<RequestConfig, 'method'>) =>
    apiFetch<T>(path, { ...config, method: 'DELETE' }),
};

// ============================================================================
// Typed API Endpoints
// ============================================================================

// Auth endpoints
export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ token: string; user: { id: string; email: string; name: string } }>('/api/auth/login', { email, password }, { requiresAuth: false }),

  register: (email: string, password: string, name: string) =>
    api.post<{ token: string; user: { id: string; email: string; name: string } }>('/api/auth/register', { email, password, name }, { requiresAuth: false }),

  guest: () =>
    api.post<{ token: string; user: { id: string; email: string; name: string } }>('/api/auth/guest', {}, { requiresAuth: false }),

  logout: () =>
    api.post<void>('/api/auth/logout'),
};

// Profile endpoints
export const profileApi = {
  get: () =>
    api.get<{ id: string; email: string; name: string; avatar?: string; onboardingCompleted: boolean }>('/api/profile'),

  update: (data: { name?: string; avatar?: string }) =>
    api.put<{ id: string; email: string; name: string; avatar?: string }>('/api/profile', data),

  completeOnboarding: (data: {
    name: string;
    gender: string;
    age: number;
    height: { feet: number; inches: number };
    weight: number;
    bloodGroup: string;
    medicalConditions: string[];
  }) =>
    api.post<void>('/api/profile/onboarding', data),
};

// Health endpoints
export const healthApi = {
  getMetrics: () =>
    api.get<{
      heartRate: number;
      bloodPressure: { systolic: number; diastolic: number };
      weight: number;
      sleep: number;
      steps: number;
      calories: number;
    }>('/api/health/metrics'),

  getGoals: () =>
    api.get<Array<{
      id: string;
      type: string;
      target: number;
      current: number;
      unit: string;
      deadline: string;
    }>>('/api/health/goals'),

  createGoal: (data: { type: string; target: number; unit: string; deadline?: string }) =>
    api.post<{ id: string; type: string; target: number; current: number; unit: string }>('/api/health/goals', data),

  updateGoal: (id: string, data: { current?: number; target?: number }) =>
    api.put<{ id: string; type: string; target: number; current: number }>(`/api/health/goals/${id}`, data),

  deleteGoal: (id: string) =>
    api.delete<void>(`/api/health/goals/${id}`),

  getReports: () =>
    api.get<Array<{
      id: string;
      type: string;
      date: string;
      summary: string;
      insights: string[];
    }>>('/api/health/reports'),
};

// CURA endpoints
export const curaApi = {
  // Appointments
  getAppointments: () =>
    api.get<Array<{
      id: string;
      doctorName: string;
      doctorAvatar?: string;
      specialty: string;
      date: string;
      time: string;
      location: string;
      type: string;
      status: string;
      notes?: string;
    }>>('/api/cura/appointments'),

  createAppointment: (data: {
    doctorId: string;
    date: string;
    time: string;
    type: string;
    notes?: string;
  }) =>
    api.post<{ id: string; status: string }>('/api/cura/appointments', data),

  updateAppointment: (id: string, data: { date?: string; time?: string; notes?: string }) =>
    api.put<{ id: string }>(`/api/cura/appointments/${id}`, data),

  cancelAppointment: (id: string) =>
    api.delete<void>(`/api/cura/appointments/${id}`),

  // Doctors
  getDoctors: (specialty?: string) =>
    api.get<Array<{
      id: string;
      name: string;
      avatar?: string;
      specialty: string;
      rating: number;
      experience: string;
      location: string;
      availability: string;
      consultationFee: number;
      languages: string[];
    }>>(`/api/cura/doctors${specialty ? `?specialty=${specialty}` : ''}`),

  // Medications
  getMedications: () =>
    api.get<Array<{
      id: string;
      name: string;
      dosage: string;
      frequency: string;
      prescribedBy: string;
      startDate: string;
      endDate?: string;
      instructions: string;
      sideEffects?: string[];
      reminderTimes: string[];
      taken: boolean;
    }>>('/api/cura/medications'),

  createMedication: (data: {
    name: string;
    dosage: string;
    frequency: string;
    prescribedBy: string;
    instructions: string;
    reminderTimes?: string[];
  }) =>
    api.post<{ id: string }>('/api/cura/medications', data),

  updateMedication: (id: string, data: { taken?: boolean; reminderTimes?: string[] }) =>
    api.put<{ id: string }>(`/api/cura/medications/${id}`, data),

  deleteMedication: (id: string) =>
    api.delete<void>(`/api/cura/medications/${id}`),

  // Test Reports
  getTestReports: () =>
    api.get<Array<{
      id: string;
      testName: string;
      testType: string;
      date: string;
      doctorName: string;
      clinic: string;
      status: string;
      results?: string;
      value?: string;
      normalRange?: string;
    }>>('/api/cura/test-reports'),

  // Treatment Plans
  getTreatmentPlans: () =>
    api.get<Array<{
      id: string;
      title: string;
      description: string;
      prescribedBy: string;
      startDate: string;
      endDate?: string;
      milestones: Array<{ id: string; title: string; dueDate: string; completed: boolean }>;
    }>>('/api/cura/treatments'),
};

// Community endpoints
export const communityApi = {
  // Posts
  getPosts: (page = 1, limit = 10) =>
    api.get<PaginatedResponse<{
      id: string;
      content: string;
      user: { id: string; name: string; avatar?: string; isAnonymous: boolean; badges: string[] };
      likes: number;
      comments: number;
      shares: number;
      isLiked: boolean;
      timestamp: string;
      tags?: string[];
    }>>(`/api/community/posts?page=${page}&limit=${limit}`),

  createPost: (data: { content: string; isAnonymous?: boolean; tags?: string[] }) =>
    api.post<{ id: string }>('/api/community/posts', data),

  likePost: (id: string) =>
    api.post<void>(`/api/community/posts/${id}/like`),

  // Groups
  getGroups: () =>
    api.get<Array<{
      id: string;
      name: string;
      description: string;
      category: string;
      memberCount: number;
      postCount: number;
      isJoined: boolean;
      isPrivate: boolean;
    }>>('/api/community/groups'),

  joinGroup: (id: string) =>
    api.post<void>(`/api/community/groups/${id}/join`),

  // Challenges
  getChallenges: () =>
    api.get<Array<{
      id: string;
      title: string;
      description: string;
      category: string;
      duration: string;
      participants: number;
      isJoined: boolean;
      progress?: number;
      points?: number;
    }>>('/api/community/challenges'),

  joinChallenge: (id: string) =>
    api.post<void>(`/api/community/challenges/${id}/join`),

  // Polls
  getPolls: () =>
    api.get<Array<{
      id: string;
      question: string;
      options: Array<{ id: string; text: string; votes: number }>;
      totalVotes: number;
      hasVoted: boolean;
      userVote?: string;
      endsAt: string;
    }>>('/api/community/polls'),

  votePoll: (pollId: string, optionId: string) =>
    api.post<void>(`/api/community/polls/${pollId}/vote`, { optionId }),
};

// Food & Nutrition endpoints
export const foodApi = {
  analyze: (imageBase64: string) =>
    api.post<{
      foods: Array<{
        name: string;
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
        servingSize: string;
      }>;
      totalCalories: number;
      totalProtein: number;
      totalCarbs: number;
      totalFat: number;
    }>('/api/food/analyze', { image: imageBase64 }),
};

// Chat/AI endpoints
export const chatApi = {
  sendMessage: (message: string, conversationId?: string) =>
    api.post<{
      response: string;
      conversationId: string;
      suggestions?: string[];
    }>('/api/chat', { message, conversationId }),
};

export default api;
