import { IUser } from "./auth";
import { Booking } from "./booking";
import { FootballField } from "./football_field";
import { Team } from "./team";

export interface Match {
    _id: string;
    club_A: Team;
    club_B?: Team;
    user: IUser;
    footballField: FootballField | any;
    date: Date;
    time: string;
    contact: string;
    contactClubB?: string;
    duration: string;
    description?: string;
    bookingId?: string | any;
    orderId?: string | any;
    status?: 'open' | 'pending' | 'confirmed' | 'cancelled'; // Trạng thái trận đấu
    requestedBy?: string; // ID của team đã gửi yêu cầu
    preferredPosition?: string; // Vị trí ưa thích của team gửi yêu cầu
    experience?: string; // Kinh nghiệm thi đấu
    message?: string; // Tin nhắn từ team gửi yêu cầu
    createdAt?: Date;
    updatedAt?: Date;
}