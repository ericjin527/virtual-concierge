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

    getOpenJobs: (glamCategory?: string, city?: string) =>
      fetch_(`/expert-tasks${glamCategory ? `?glamCategory=${glamCategory}` : ''}${city ? `${glamCategory ? '&' : '?'}city=${city}` : ''}`),

    getMyTasks: (status?: string) =>
      fetch_(`/expert-tasks/mine${status ? `?status=${status}` : ''}`),

    getMyTaskDetail: (taskId: string) =>
      fetch_(`/expert-tasks/${taskId}/detail`),

    startTask: (taskId: string) =>
      fetch_(`/expert-tasks/${taskId}/start`, { method: 'POST', body: '{}' }),

    completeTask: (taskId: string, deliverable?: unknown) =>
      fetch_(`/expert-tasks/${taskId}/complete`, { method: 'POST', body: JSON.stringify({ deliverable }) }),

    // Proposal flow
    getMyProposals: () => fetch_('/proposals/mine'),

    acceptProposal: (proposalId: string, data: {
      proposedPrice: number;
      currency: string;
      note?: string;
      portfolioSampleUrl?: string;
      availableStart: string;
      availableEnd: string;
    }) => fetch_(`/proposals/${proposalId}/accept`, { method: 'PATCH', body: JSON.stringify(data) }),

    declineProposal: (proposalId: string, note?: string) =>
      fetch_(`/proposals/${proposalId}/decline`, { method: 'PATCH', body: JSON.stringify({ note }) }),

    getDestinations: () => fetch_('/destinations'),
    getDestinationAreas: (destinationId: string) => fetch_(`/destinations/${destinationId}/areas`),
  };
}
