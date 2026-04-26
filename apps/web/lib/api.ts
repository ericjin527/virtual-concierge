const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002';

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  // Businesses
  createBusiness: (data: unknown) =>
    apiFetch('/businesses', { method: 'POST', body: JSON.stringify(data) }),
  getBusiness: (id: string) => apiFetch(`/businesses/${id}`),
  updateBusiness: (id: string, data: unknown) =>
    apiFetch(`/businesses/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  // Services
  getServices: (businessId: string) => apiFetch(`/businesses/${businessId}/services`),
  createService: (businessId: string, data: unknown) =>
    apiFetch(`/businesses/${businessId}/services`, { method: 'POST', body: JSON.stringify(data) }),
  updateService: (businessId: string, id: string, data: unknown) =>
    apiFetch(`/businesses/${businessId}/services/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteService: (businessId: string, id: string) =>
    apiFetch(`/businesses/${businessId}/services/${id}`, { method: 'DELETE' }),

  // Therapists
  getTherapists: (businessId: string) => apiFetch(`/businesses/${businessId}/therapists`),
  createTherapist: (businessId: string, data: unknown) =>
    apiFetch(`/businesses/${businessId}/therapists`, { method: 'POST', body: JSON.stringify(data) }),
  updateTherapist: (businessId: string, id: string, data: unknown) =>
    apiFetch(`/businesses/${businessId}/therapists/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  assignSkill: (businessId: string, therapistId: string, serviceId: string) =>
    apiFetch(`/businesses/${businessId}/therapists/${therapistId}/skills`, {
      method: 'POST', body: JSON.stringify({ serviceId }),
    }),
  removeSkill: (businessId: string, therapistId: string, serviceId: string) =>
    apiFetch(`/businesses/${businessId}/therapists/${therapistId}/skills/${serviceId}`, { method: 'DELETE' }),
};
