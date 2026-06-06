import { apiClient, buildQueryString } from './api';
import { ApiResponse } from '@/types';
import { StaffMember, StaffFilters, AppointmentRequest } from '@/types';

export const staffService = {
  // Search staff members
  searchStaff: async (filters: StaffFilters = {}): Promise<StaffMember[]> => {
    const queryString = buildQueryString(filters);
    const response = await apiClient.get<ApiResponse<{ staff: StaffMember[] }>>(
      `/student/staff/search${queryString}`
    );
    return response.data.data.staff;
  },

  // Get staff by ID
  getStaffById: async (staffId: string): Promise<StaffMember> => {
    const response = await apiClient.get<ApiResponse<{ staff: StaffMember }>>(
      `/student/staff/${staffId}`
    );
    return response.data.data.staff;
  },

  // Get staff by department
  getStaffByDepartment: async (department: string): Promise<StaffMember[]> => {
    const response = await apiClient.get<ApiResponse<{ staff: StaffMember[] }>>(
      `/student/staff/department/${department}`
    );
    return response.data.data.staff;
  },

  // Get staff teaching a specific course
  getStaffByCourse: async (courseCode: string): Promise<StaffMember[]> => {
    const response = await apiClient.get<ApiResponse<{ staff: StaffMember[] }>>(
      `/student/staff/course/${courseCode}`
    );
    return response.data.data.staff;
  },

  // Get student's assigned academic advisor
  getAcademicAdvisor: async (): Promise<StaffMember | null> => {
    try {
      const response = await apiClient.get<ApiResponse<{ advisor: StaffMember }>>(
        '/student/staff/advisor'
      );
      return response.data.data.advisor;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  // Book appointment with staff
  bookAppointment: async (appointment: {
    staffId: string;
    scheduledAt: string;
    duration: number;
    type: 'in_person' | 'virtual' | 'phone';
    agenda?: string[];
    notes?: string;
  }): Promise<AppointmentRequest> => {
    const response = await apiClient.post<ApiResponse<{ appointment: AppointmentRequest }>>(
      '/student/staff/appointments',
      appointment
    );
    return response.data.data.appointment;
  },

  // Get student's appointments
  getAppointments: async (): Promise<AppointmentRequest[]> => {
    const response = await apiClient.get<ApiResponse<{ appointments: AppointmentRequest[] }>>(
      '/student/staff/appointments'
    );
    return response.data.data.appointments;
  },

  // Cancel appointment
  cancelAppointment: async (appointmentId: string, reason?: string): Promise<void> => {
    await apiClient.patch(
      `/student/staff/appointments/${appointmentId}/cancel`,
      { reason }
    );
  },

  // Reschedule appointment
  rescheduleAppointment: async (appointmentId: string, newTime: string): Promise<AppointmentRequest> => {
    const response = await apiClient.patch<ApiResponse<{ appointment: AppointmentRequest }>>(
      `/student/staff/appointments/${appointmentId}/reschedule`,
      { scheduledAt: newTime }
    );
    return response.data.data.appointment;
  },

  // Get departments list
  getDepartments: async (): Promise<Array<{ _id: string; name: string; faculty: string; code: string }>> => {
    const response = await apiClient.get<ApiResponse<{ departments: any[] }>>(
      '/student/staff/departments'
    );
    return response.data.data.departments;
  },

  // Get faculties list
  getFaculties: async (): Promise<Array<{ _id: string; name: string; code: string }>> => {
    const response = await apiClient.get<ApiResponse<{ faculties: any[] }>>(
      '/student/staff/faculties'
    );
    return response.data.data.faculties;
  },
};

export default staffService;