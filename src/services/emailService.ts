import { apiClient } from './api';

export interface EmailTemplate {
  id: string;
  template_name: string;
  subject_template: string;
  body_template: string;
  variables: string;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface EmailLog {
  id: string;
  recipient_email: string;
  recipient_name: string;
  email_type: string;
  subject: string;
  body: string;
  status: string;
  sent_at: string;
  error_message: string;
  related_entity_type: string;
  related_entity_id: string;
  preview_url: string;
}

export const emailService = {
  getTemplates: async (): Promise<EmailTemplate[]> => {
    const { data } = await apiClient.get('/email/templates');
    return data.data.templates;
  },
  updateTemplate: async (id: string, payload: Partial<EmailTemplate>): Promise<void> => {
    await apiClient.put(`/email/templates/${id}`, payload);
  },
  getLogs: async (params?: { type?: string; status?: string; limit?: number }): Promise<EmailLog[]> => {
    const { data } = await apiClient.get('/email/logs', { params });
    return data.data.logs;
  },
  getLog: async (id: string): Promise<EmailLog> => {
    const { data } = await apiClient.get(`/email/logs/${id}`);
    return data.data.log;
  },
  resendEmail: async (logId: string): Promise<any> => {
    const { data } = await apiClient.post(`/email/resend/${logId}`);
    return data;
  },
  sendTest: async (to: string): Promise<any> => {
    const { data } = await apiClient.post('/email/test', { to });
    return data;
  },
  sendCustom: async (payload: { to: string; subject: string; body: string }): Promise<any> => {
    const { data } = await apiClient.post('/email/send-custom', payload);
    return data;
  },
};
