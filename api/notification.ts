import { Notification } from "@/models/notification";
import { API_NodeJS } from "./utils/axios";

// 1. Tạo mới một Notification
export const createNotification = (notification: Notification) => {
  return API_NodeJS.post('notification', notification);
};

// 2. Cập nhật thông tin một Notification
export const updateNotification = (id: string, notification: Notification) => {
  return API_NodeJS.patch(`notification/${id}`, notification);
};

// 3. Lấy danh sách tất cả Notification
export const getNotifications = () => {
  return API_NodeJS.get<Notification[]>('notification');
};

export const getNotificationsById = (id: string) => {
  return API_NodeJS.get<Notification>(`notification/detail/${id}`);
};

// 4. Lấy thông tin chi tiết của một Notification theo ID với pagination
export const getNotificationByActor = (
  userId: string,
  role: string,
  options?: {
    page?: number;
    limit?: number;
    filter?: 'all' | 'unread';
  }
) => {
  const params = new URLSearchParams();
  if (options?.page) params.append('page', options.page.toString());
  if (options?.limit) params.append('limit', options.limit.toString());
  if (options?.filter && options.filter !== 'all') params.append('filter', options.filter);

  const queryString = params.toString();
  const url = `notification/${userId}/${role}${queryString ? `?${queryString}` : ''}`;

  return API_NodeJS.get<{
    notifications: Notification[];
    total: number;
    page: number;
    totalPages: number;
  }>(url);
};

export const getNotificationByManager = (role: string) => {
  return API_NodeJS.get<Notification[]>(`notification/role/manager/${role}`);
};

// 5. Xóa Notification theo ID
export const deleteNotification = (id: string) => {
  return API_NodeJS.delete(`notification/${id}`);
};

export const deleteNotificationsByUserId = (userId: string) => {
  return API_NodeJS.delete(`notification/byUser/${userId}`);
};
