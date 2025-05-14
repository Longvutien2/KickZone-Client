import { Booking } from "@/models/booking";
import { API_NodeJS } from "./utils/axios";

// Đăng ký một booking mới
export const createBooking = (booking: Booking) => {
  return API_NodeJS.post("booking", booking);
};

// Cập nhật thông tin một booking
export const updateBooking = (bookingId: string, booking: Booking) => {
  return API_NodeJS.patch(`booking/${bookingId}`, booking);
};

// Lấy danh sách tất cả booking
export const getBookings = () => {
  return API_NodeJS.get<Booking[]>(`booking`);
};

// Lấy thông tin chi tiết của một booking
export const getBookingById = (bookingId: string) => {
  return API_NodeJS.get<Booking>(`booking/${bookingId}`);
};

export const getBookingByFootballField = (footballFieldId: string) => {
  return API_NodeJS.get<Booking>(`booking/footballField/${footballFieldId}`);
};

export const getBookingsByFootballFieldAndDate  = (footballFieldId: string, date: string) => {
  return API_NodeJS.get<Booking>(`booking/${footballFieldId}/${date}`);
};


// Xóa một booking theo ID
export const deleteBooking = (id: string) => {
  return API_NodeJS.delete(`booking/${id}`);
};

// Xóa tất cả booking theo một trường (ví dụ: theo sân hoặc người dùng)
export const deleteBookingsByFieldId = (fieldId: string) => {
  return API_NodeJS.delete(`booking/byField/${fieldId}`);
};

