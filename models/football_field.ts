import { TimeSlot } from "./field";

export interface FootballField {
    _id?: string;
    name: string;
    image: string;
    address: any;
    phone: string;
    desc: string;
    userId: any;
    timeSlot?: TimeSlot[];
}