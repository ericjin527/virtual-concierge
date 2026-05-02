'use client';
import { useAuth } from '@clerk/nextjs';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002';

export function useExpertApi() {
  const { getToken } = useAuth();

  async function fetch_<T>(path: string, init?: RequestInit): Promise<T> {
    const token = await getToken();
    const res = await fetch(`${API}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init?.headers,
      },
      ...init,
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`API ${res.status}: ${text}`);
    }
    return res.json() as Promise<T>;
  }

  return {
    getMyProfile: () => fetch_('/experts/me'),
    updateMyProfile: (data: unknown) => fetch_('/experts/me', { method: 'PUT', body: JSON.stringify(data) }),

    getOpenJobs: (category?: string, city?: string) =>
      fetch_(`/expert-tasks${category ? `?category=${category}` : ''}${city ? `${category ? '&' : '?'}city=${city}` : ''}`),

    acceptJob: (taskId: string) =>
      fetch_(`/expert-tasks/${taskId}/accept`, { method: 'POST', body: '{}' }),

    startTask: (taskId: string) =>
      fetch_(`/expert-tasks/${taskId}/start`, { method: 'POST', body: '{}' }),

    completeTask: (taskId: string, deliverable?: unknown) =>
      fetch_(`/expert-tasks/${taskId}/complete`, { method: 'POST', body: JSON.stringify({ deliverable }) }),

    getMyTasks: (status?: string) =>
      fetch_(`/expert-tasks/mine${status ? `?status=${status}` : ''}`),

    getMyTaskDetail: (taskId: string) =>
      fetch_(`/expert-tasks/${taskId}/detail`),
  };
}
