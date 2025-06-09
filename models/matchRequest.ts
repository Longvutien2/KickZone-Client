import { Team } from "./team";
import { Match } from "./match";
import { IUser } from "./auth";

export interface MatchRequest {
    _id?: string;
    match: Match | any; // ID của trận đấu
    user: IUser | string; // ID của người gửi yêu cầu
    club_B: Team | any; // Đội gửi yêu cầu
    message?: string; // Tin nhắn kèm theo
    targetUser?: string; // ID của người nhận yêu cầu
    status?: 'pending' | 'accepted' | 'rejected'; // Trạng thái yêu cầu
    description?: string; // Lời nhắn kèm theo
    createdAt?: Date;
    updatedAt?: Date;
}
