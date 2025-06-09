import { IUser } from "./auth";

export interface Team {
    _id?: string,
    teamImage?: string;
    teamImageBg?: string;
    teamName: string;
    description?: string;
    contact?: string;
    ageGroup: string;
    level: string;
    location?: string;
    user: IUser | string;
    createdAt?: string;
}