import { FootballField } from "./football_field";

export interface Booking {
  _id?: string;
  date: string;
  fieldName: string;
  address: string;
  field: string;
  footballField?: string | FootballField;
  timeStart: string;
  user: string | any;
  price: number;
  payment_method: string;
  username: string;
  email: string;
  phoneNumber: string;
  status?: "Chờ xác nhận" | "Đã xác nhận" | "Đã huỷ" | "Thất bại" | any;
  createdAt?: string;
}
