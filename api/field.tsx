/* eslint-disable @typescript-eslint/no-explicit-any */
import { Field } from "@/models/field";
import { API_NodeJS } from "./utils/axios";
import { TimeSlot } from "@/models/field";
// Đăng ký sân bóng mới
export const createField = (field: Field) => {
  return API_NodeJS.post("fields", field);
};

// Lấy danh sách sân bóng
export const getFields = () => {
  return API_NodeJS.get<Field[]>("fields");
};

// Lấy thông tin chi tiết một sân bóng
export const getFieldById = (fieldId: string) => {
  return API_NodeJS.get(`fields/${fieldId}`);
};

export const getFieldsByIdFootball = (footballId: string) => {
  return API_NodeJS.get<Field[]>(`fields/footballId/${footballId}`);
};

// Cập nhật thông tin sân bóng
export const updateField = (fieldId: string, field: Field) => {
  return API_NodeJS.patch(`fields/${fieldId}`, field);
};

// Xóa sân bóng
export const deleteField = (fieldId: string) => {
  return API_NodeJS.delete(`fields/${fieldId}`);
};

// Thêm lịch đặt sân (`schedules`)
export const addSchedule = (fieldId: string, schedule: { date: string; timeSlots: any[] }) => {
  return API_NodeJS.put(`fields/${fieldId}/add-schedule`, schedule);
};

// Cập nhật lịch đặt sân
export const updateSchedule = (fieldId: string, scheduleId: string, schedule: { date: string; timeSlots: any[] }) => {
  return API_NodeJS.put(`fields/${fieldId}/update-schedule/${scheduleId}`, schedule);
};

// Xóa một lịch đặt sân
export const deleteSchedule = (fieldId: string, scheduleId: string) => {
  return API_NodeJS.delete(`fields/${fieldId}/delete-schedule/${scheduleId}`);
};



// =============================== TIME SLOT ========================================================


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

export const getTimeSlotByIdFootballField = (idFootBallField: string) => {
  return API_NodeJS.get<TimeSlot[]>(`timeSlot/${idFootBallField}/idFootBallField`);
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