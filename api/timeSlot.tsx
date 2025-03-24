/* eslint-disable @typescript-eslint/no-explicit-any */
import { TimeSlot } from "@/models/field";
import { API_NodeJS } from "./utils/axios";

// Đăng ký sân bóng mới
export const createTimeSlot = (timeSlot: TimeSlot) => {
  return API_NodeJS.post("timeSlot", timeSlot);
};

export const updateTimeSlot = (timeSlotId: string, timeSlot: TimeSlot) => {
  return API_NodeJS.patch(`timeSlot/${timeSlotId}`, timeSlot);
};

// Lấy danh sách giờ theo sân
export const getTimeSlot = () => {
  return API_NodeJS.get<TimeSlot[]>(`timeSlot`);
};

export const getTimeSlotById = (id: string) => {
  return API_NodeJS.get(`timeSlot/${id}`);
};

export const deleteTimeSlot = (id: string) => {
  return API_NodeJS.delete(`timeSlot/${id}`);
};

export const deleteTimeSlotByFieldId = (id: string) => {
  return API_NodeJS.delete(`timeSlot/byField/${id}`);
};

// // Lấy thông tin chi tiết một sân bóng
// export const getFieldById = (fieldId: string) => {
//   return API_NodeJS.get(`fieldId/${fieldId}`);
// };