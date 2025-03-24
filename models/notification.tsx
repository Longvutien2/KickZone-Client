import { Booking } from "./booking";
import { FootballField } from "./football_field";

export interface Notification {
    _id?: string; // ID của thông báo
    actor: 'user' | 'manager' | 'admin'; // Loại người nhận thông báo (user, manager, admin)
    notificationType: 'field_booked' | 'field_created' | 'opponent_found' | 'posted_opponent' | 'new_order' | 'field_registration_request' | 'user_feedback'; // Loại thông báo
    title: string; // Tiêu đề của thông báo
    content?: string; // Nội dung thông báo
    bookingId?: Booking | any ;
    targetUser?: string; // ID của người nhận thông báo (nếu có)
    footballfield?: FootballField | any;
    read?: boolean; // Trạng thái thông báo đã đọc hay chưa
    createdAt?: Date | any;
}