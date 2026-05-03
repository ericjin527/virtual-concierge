'use client';
import { useAuth } from '@clerk/nextjs';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002';

export function useAccountApi() {
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
    getMyExperiences: () => fetch_('/account/my-experiences'),
  };
}
