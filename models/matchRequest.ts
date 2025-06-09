import { Team } from "./team";
import { Match } from "./match";
import { IUser } from "./auth";

export interface MatchRequest {
    _id?: string;
    match: Match | string; // ID của trận đấu
    user: IUser | string; // ID của người gửi yêu cầu
    club_B: Team | string; // Đội gửi yêu cầu
    message?: string; // Tin nhắn kèm theo
    targetUser?: string; // ID của người nhận yêu cầu
    status?: 'pending' | 'accepted' | 'rejected'; // Trạng thái yêu cầu
    createdAt?: Date;
    updatedAt?: Date;
}
