import { IUser } from "@/models/auth";
import { API_NodeJS } from "./utils/axios";

export const signup = (user: IUser) => {
    return API_NodeJS.post(`signup`, user)
}
export const signin = (user: any) => {
    return API_NodeJS.post(`signin`, user)
}
// export const signinwithnextauth = (user: any) => {
//     return API_NodeJS.post(`signinwithnextauth`, user)
// }

export const changepassword = (user: IUser) => {
    return API_NodeJS.put(`changepass`, user)
}

export const changeprofile = (user: IUser) => {
    return API_NodeJS.put(`users/changeprofile`, user)
}