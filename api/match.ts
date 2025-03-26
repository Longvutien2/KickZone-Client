import { Match } from "@/models/match";
import { API_NodeJS } from "./utils/axios";

// 1. Tạo mới một trận đấu
export const createMatch = (match: Match) => {
  return API_NodeJS.post('match', match);  // Gửi yêu cầu POST để tạo trận đấu
};

// 2. Cập nhật thông tin trận đấu theo id
export const updateMatch = (id: string, match: Match) => {
  return API_NodeJS.patch(`match/${id}`, match);  // Gửi yêu cầu PATCH để cập nhật trận đấu
};

// 3. Lấy danh sách tất cả trận đấu
export const getMatches = () => {
  return API_NodeJS.get<Match[]>('match');  // Lấy danh sách trận đấu từ API
};

// 4. Lấy thông tin chi tiết của một trận đấu theo id
export const getMatchById = (id: string) => {
  return API_NodeJS.get<Match>(`match/${id}`);  // Lấy thông tin chi tiết của trận đấu theo id
};

// 5. Xóa trận đấu theo ID
export const deleteMatch = (id: string) => {
  return API_NodeJS.delete(`match/${id}`);  // Xóa trận đấu theo ID
};

// 6. Xóa trận đấu theo userID (ví dụ: người dùng không còn quản lý trận đấu này)
export const deleteMatchByUserId = (userId: string) => {
  return API_NodeJS.delete(`match/byUser/${userId}`);  // Xóa trận đấu theo userID
};
