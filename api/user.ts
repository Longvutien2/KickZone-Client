import { IUser } from "@/models/auth";
import { API_NodeJS } from "./utils/axios";

// Đăng ký một user mới
export const createUser = (user: IUser) => {
  return API_NodeJS.post("user", user);
};

// Cập nhật thông tin một user
export const updateUser = (userId: string, user: IUser) => {
  return API_NodeJS.patch(`user/${userId}`, user);
};

// Lấy danh sách tất cả user
export const getUsers = () => {
  return API_NodeJS.get<IUser[]>(`user`);
};

// Lấy thông tin chi tiết của một user
export const getUserById = (userId: string) => {
  return API_NodeJS.get<IUser>(`user/${userId}`);
};

// Xóa một user theo ID
export const deleteUser = (id: string) => {
  return API_NodeJS.delete(`user/${id}`);
};

// Xóa tất cả user theo một trường (ví dụ: theo role hoặc trạng thái)
export const deleteUsersByRole = (role: string) => {
  return API_NodeJS.delete(`user/byRole/${role}`);
};
