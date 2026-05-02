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

  // Shifts
  getShifts: (businessId: string, therapistId: string) =>
    apiFetch(`/businesses/${businessId}/therapists/${therapistId}/shifts`),
  createShift: (businessId: string, therapistId: string, data: unknown) =>
    apiFetch(`/businesses/${businessId}/therapists/${therapistId}/shifts`, { method: 'POST', body: JSON.stringify(data) }),
  deleteShift: (businessId: string, therapistId: string, shiftId: string) =>
    apiFetch(`/businesses/${businessId}/therapists/${therapistId}/shifts/${shiftId}`, { method: 'DELETE' }),

  // Rooms
  getRooms: (businessId: string) => apiFetch(`/businesses/${businessId}/rooms`),
  createRoom: (businessId: string, data: unknown) =>
    apiFetch(`/businesses/${businessId}/rooms`, { method: 'POST', body: JSON.stringify(data) }),
  updateRoom: (businessId: string, id: string, data: unknown) =>
    apiFetch(`/businesses/${businessId}/rooms/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteRoom: (businessId: string, id: string) =>
    apiFetch(`/businesses/${businessId}/rooms/${id}`, { method: 'DELETE' }),

  // Policy
  getPolicy: (businessId: string) => apiFetch(`/businesses/${businessId}/policy`),
  upsertPolicy: (businessId: string, data: unknown) =>
    apiFetch(`/businesses/${businessId}/policy`, { method: 'POST', body: JSON.stringify(data) }),

  // Booking Requests
  getBookingRequests: (businessId: string, status?: string) =>
    apiFetch(`/businesses/${businessId}/booking-requests${status ? `?status=${status}` : ''}`),
  updateBookingRequest: (businessId: string, id: string, data: unknown) =>
    apiFetch(`/businesses/${businessId}/booking-requests/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  // Calls / Transcripts
  getCalls: (businessId: string) => apiFetch(`/businesses/${businessId}/calls`),
  getCall: (businessId: string, callId: string) => apiFetch(`/businesses/${businessId}/calls/${callId}`),

  // Usage
  getMonthlyUsage: (businessId: string) => apiFetch(`/businesses/${businessId}/usage/monthly`),

  // Butler Network — Experts
  getExperts: (category?: string) => apiFetch(`/experts${category ? `?category=${category}` : ''}`),
  getExpert: (id: string) => apiFetch(`/experts/${id}`),
  approveExpert: (id: string) => apiFetch(`/experts/${id}/approve`, { method: 'POST' }),
  suspendExpert: (id: string) => apiFetch(`/experts/${id}/suspend`, { method: 'POST' }),

  // Butler Network — Vendor Applications
  getVendorApplications: (status?: string) => apiFetch(`/vendor-applications${status ? `?status=${status}` : ''}`),
  submitVendorApplication: (data: unknown) => apiFetch('/vendor-applications', { method: 'POST', body: JSON.stringify(data) }),
  approveVendorApplication: (id: string) => apiFetch(`/vendor-applications/${id}/approve`, { method: 'POST' }),
  rejectVendorApplication: (id: string) => apiFetch(`/vendor-applications/${id}/reject`, { method: 'POST' }),

  // Butler Network — Tasks
  getTasks: (status?: string, category?: string) => apiFetch(`/tasks${status ? `?status=${status}` : ''}${category ? `&category=${category}` : ''}`),
  getTask: (id: string) => apiFetch(`/tasks/${id}`),
  assignExpert: (taskId: string, expertId: string) => apiFetch(`/tasks/${taskId}/assign`, { method: 'POST', body: JSON.stringify({ expertId }) }),
  updateTaskStatus: (taskId: string, status: string) => apiFetch(`/tasks/${taskId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  // Butler Network — AI Chat
  butlerChat: (messages: unknown[], message: string, category: string) =>
    apiFetch('/butler/chat', { method: 'POST', body: JSON.stringify({ messages, message, category }) }),

  // Travel Butler
  travelButlerChat: (messages: unknown[], message: string, context?: string, selectedServices?: string[]) =>
    apiFetch('/travel-butler/chat', { method: 'POST', body: JSON.stringify({ messages, message, context, selectedServices }) }),

  // Experiences
  getExperiences: (status?: string, type?: string) =>
    apiFetch(`/experiences${status ? `?status=${status}` : ''}${type ? `${status ? '&' : '?'}type=${type}` : ''}`),
  getExperience: (id: string) => apiFetch(`/experiences/${id}`),
  updateExperienceStatus: (id: string, status: string) =>
    apiFetch(`/experiences/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
};
