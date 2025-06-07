import { IUser } from "@/models/auth";
import { API_NodeJS } from "./utils/axios";

// Sign in request interface
interface SignInRequest {
    email: string;
    password: string;
}

// Change password request interface
interface ChangePasswordRequest {
    _id: string;
    currentPassword: string;
    newPassword: string;
}

export const signup = (user: IUser) => {
    return API_NodeJS.post(`signup`, user)
}

export const signin = (user: SignInRequest) => {
    return API_NodeJS.post(`signin`, user)
}

export const changepassword = (user: ChangePasswordRequest) => {
    return API_NodeJS.patch(`/user/changepass/${user._id}`, user)
}

export const changeprofile = (user: IUser) => {
    return API_NodeJS.patch(`user/${user._id}`, user)
}

// Đăng ký một user mới
export const createUser = (user: IUser) => {
  return API_NodeJS.post("user", user);
};

// Cập nhật thông tin một user
export const updateUser = (user: IUser) => {
  return API_NodeJS.patch(`user/${user._id}`, user);
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