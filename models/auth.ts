export interface IUser {
    _id?: string,
    name?: string,
    email: string,
    password: string,
    image?: string,
    // birthday?: string,
    // age?: number,
    role?: number,
    status?: number
}

export interface User {
    _id?: string,
    name?: string,
    email: string,
    password: string,
    image?: string,
    role: number,
    status: number
}