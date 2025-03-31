export interface Booking {
  _id?: string;
  date: string;
  fieldName: string;
  address: string;
  field: string;
  timeStart: string;
  price: number;
  payment_method: string;
  username: string;
  email: string;
  phoneNumber: string;
  status?: "Chờ xác nhận" | "Đã xác nhận" | "Đã huỷ";
  createdAt?: string;
}
