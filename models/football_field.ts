import { TimeSlot } from "./field";

export interface FootballField {
    _id?: string;
    name: string;
    image: string;
    address: any;
    phone: string;
    description?: string;
    userId: any;
    status?: string;
    timeSlot?: TimeSlot[];
}