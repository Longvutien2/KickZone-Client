import { 
    CreateMatchRequestData,
    UpdateMatchRequestData,
    MatchRequest 
} from '@/models/matchRequest';
import { API_NodeJS } from './utils/axios';

// Tạo yêu cầu tham gia trận đấu mới
export const createMatchRequest = (requestData: CreateMatchRequestData) => {
    return API_NodeJS.post('matchRequest', requestData);
};

// Lấy tất cả yêu cầu tham gia
export const getAllMatchRequests = () => {
    return API_NodeJS.get('matchRequest');
};

// Lấy yêu cầu theo ID
export const getMatchRequestById = (requestId: string) => {
    return API_NodeJS.get(`matchRequest/${requestId}`);
};

// Lấy yêu cầu theo match ID
export const getMatchRequestsByMatchId = (matchId: string) => {
    return API_NodeJS.get(`matchRequest/match/${matchId}`);
};

// Lấy yêu cầu theo user ID
export const getMatchRequestsByUserId = (userId: string) => {
    return API_NodeJS.get(`matchRequest/user/${userId}`);
};

// Cập nhật trạng thái yêu cầu (chấp nhận/từ chối)
export const updateMatchRequestStatus = (requestId: string, status: 'accepted' | 'rejected') => {
    return API_NodeJS.patch(`matchRequest/${requestId}/status`, { status });
};

// Cập nhật thông tin yêu cầu
export const updateMatchRequest = (requestId: string, updateData: Partial<MatchRequest>) => {
    return API_NodeJS.patch(`matchRequest/${requestId}`, updateData);
};

// Xóa yêu cầu
export const deleteMatchRequest = (requestId: string) => {
    return API_NodeJS.delete(`matchRequest/${requestId}`);
};

// Kiểm tra xem user đã gửi yêu cầu cho match này chưa
export const checkExistingRequest = (matchId: string, userId: string) => {
    return API_NodeJS.get(`matchRequest/check-exist?matchId=${matchId}&userId=${userId}`);
};
