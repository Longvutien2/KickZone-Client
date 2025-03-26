import { Team } from "@/models/team";
import { API_NodeJS } from "./utils/axios";

// 1. Tạo mới một đội bóng
export const createTeam = (team: Team) => {
  return API_NodeJS.post('team', team); // Gửi yêu cầu POST tới API để tạo đội bóng
};

// 2. Cập nhật thông tin một đội bóng
export const updateTeam = (id: string, team: Team) => {
  return API_NodeJS.patch(`team/${id}`, team); // Gửi yêu cầu PATCH để cập nhật đội bóng theo id
};

// 3. Lấy danh sách tất cả đội bóng
export const getTeams = () => {
  return API_NodeJS.get<Team[]>('team'); // Lấy danh sách đội bóng từ API
};

// 4. Lấy thông tin chi tiết của một đội bóng theo ID
export const getTeamById = (id: string) => {
  return API_NodeJS.get<Team>(`team/${id}`); // Lấy thông tin chi tiết của đội bóng theo id
};

export const getTeamByUserId = (id: string) => {
  return API_NodeJS.get<Team[]>(`team/byUser/${id}`); // Lấy thông tin chi tiết của đội bóng theo id
};

// 5. Xóa đội bóng theo ID
export const deleteTeam = (id: string) => {
  return API_NodeJS.delete(`team/${id}`); // Xóa đội bóng theo id
};

// 6. Xóa đội bóng theo userId (ví dụ xóa đội bóng của một người dùng)
export const deleteTeamByUserId = (userId: string) => {
  return API_NodeJS.delete(`team/byUser/${userId}`); // Xóa đội bóng theo userId
};
