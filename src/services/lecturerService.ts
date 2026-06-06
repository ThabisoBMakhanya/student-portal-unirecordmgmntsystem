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

export const lecturerService = {
  getDashboard: () => api.get('/lecturer/dashboard'),
  getCourses: () => api.get('/lecturer/courses'),
  getCourseStudents: (courseId: string) => api.get(`/lecturer/courses/${courseId}/students`),
  getCourseGrades: (courseId: string) => api.get(`/lecturer/courses/${courseId}/grades`),
  updateGrades: (courseId: string, grades: any[]) => api.put(`/lecturer/courses/${courseId}/grades`, { grades }),
  getMaterials: (courseId: string) => api.get(`/lecturer/materials/${courseId}`),
  uploadMaterial: (data: any) => api.post('/lecturer/materials/upload', data),
  getConsultation: () => api.get('/lecturer/consultation'),
  updateConsultation: (hours: any[]) => api.put('/lecturer/consultation', { hours }),
};
