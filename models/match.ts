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
    createdAt?: Date;
    updatedAt?: Date;
}