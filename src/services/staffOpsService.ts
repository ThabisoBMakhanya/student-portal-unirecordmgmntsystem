import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const stored = localStorage.getItem('student-portal-auth');
  if (stored) {
    try {
      const { state } = JSON.parse(stored);
      if (state?.token) config.headers.Authorization = `Bearer ${state.token}`;
    } catch {}
  }
  return config;
});

export const staffService = {
  getDashboard: () => api.get('/staff/ops/dashboard'),
  getReceipts: (status?: string) => api.get(`/staff/ops/receipts${status ? `?status=${status}` : ''}`),
  verifyReceipt: (id: string) => api.put(`/staff/ops/receipts/${id}/verify`),
  rejectReceipt: (id: string, rejection_reason: string) => api.put(`/staff/ops/receipts/${id}/reject`, { rejection_reason }),
  getRegistrations: (status?: string) => api.get(`/staff/ops/registrations${status ? `?status=${status}` : ''}`),
  getRegistration: (id: string) => api.get(`/staff/ops/registrations/${id}`),
  verifyDocuments: (id: string) => api.put(`/staff/ops/registrations/${id}/verify-documents`),
  approveRegistration: (id: string) => api.put(`/staff/ops/registrations/${id}/approve`),
  rejectRegistration: (id: string, reason: string) => api.put(`/staff/ops/registrations/${id}/reject`, { rejection_reason: reason }),
};
