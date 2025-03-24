import { IUser } from "./auth";
import { Field, TimeSlot } from "./field";
import { FootballField } from "./football_field";

export interface RootStateType {
    timeSlot: {
        value: TimeSlot[];
    };
    field: {
        value: Field[];
    };
    auth: {
        value: IUser
    };
    footballField: {
        value: FootballField
    };
    notification:{
        value: Notification[]
    }
}