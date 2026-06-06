import { apiClient } from './api';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  priority: string;
  read: boolean;
  createdAt: string;
}

export const notificationsService = {
  getNotifications: async (): Promise<Notification[]> => {
    const response = await apiClient.get('/notifications');
    const items = response.data?.data?.notifications ?? [];
    return items.map((n: any) => ({
      id: n.id || n._id,
      title: n.title,
      message: n.message,
      type: n.type || 'info',
      priority: n.priority || 'medium',
      read: !!(n.is_read ?? n.read),
      createdAt: n.created_at || n.createdAt,
    }));
  },
  markAsRead: async (id: string): Promise<void> => {
    await apiClient.put(`/notifications/${id}/read`);
  },
  markAllAsRead: async (): Promise<void> => {
    await apiClient.put('/notifications/mark-all-read');
  },
  deleteNotification: async (id: string): Promise<void> => {
    await apiClient.delete(`/notifications/${id}`);
  },
  deleteAllNotifications: async (): Promise<void> => {
    await apiClient.delete('/notifications');
  },
  getNotificationCount: async (): Promise<number> => {
    const response = await apiClient.get('/notifications/unread-count');
    return response.data?.data?.unreadCount ?? 0;
  },
};
