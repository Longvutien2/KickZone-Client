import { Booking } from "./booking";
import { FootballField } from "./football_field";
import { Match } from "./match";
import { Order } from "./payment";
import { Team } from "./team";

// Actor types for better type safety
export type ActorType = 'user' | 'manager' | 'admin';

// Notification types enum
export type NotificationType =
    | 'field_booked'
    | 'field_created'
    | 'opponent_found'
    | 'posted_opponent'
    | 'new_order'
    | 'field_booking_failed'
    | 'field_registration_request'
    | 'user_feedback';

export interface Notification {
    _id?: string; // ID của thông báo
    actor: ActorType; // Loại người nhận thông báo với type safety
    notificationType: NotificationType; // Loại thông báo với type safety
    title: string; // Tiêu đề của thông báo
    content?: string; // Nội dung thông báo
    bookingId?: Booking; // Remove any type
    orderId?: Order; // Remove any type
    targetUser?: string; // ID của người nhận thông báo (nếu có)
    footballfield?: FootballField; // Remove any type
    match?: Match; // Remove any type
    club_A?: Team; // Remove any type
    club_B?: Team; // Remove any type
    read?: boolean; // Trạng thái thông báo đã đọc hay chưa
    createdAt?: Date; // Remove any type
}