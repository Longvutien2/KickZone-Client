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

// 4. Lấy thông tin chi tiết của một Notification theo ID
export const getNotificationByActor = (userId: string, role: string) => {
  return API_NodeJS.get<Notification[]>(`notification/${userId}/${role}`);
};

// 5. Xóa Notification theo ID
export const deleteNotification = (id: string) => {
  return API_NodeJS.delete(`notification/${id}`);
};

export const deleteNotificationsByUserId = (userId: string) => {
  return API_NodeJS.delete(`notification/byUser/${userId}`);
};
