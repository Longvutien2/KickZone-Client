import {
  CreateOrderRequest,
  CreateOrderResponse,
  CheckPaymentResponse,
  WebhooksResponse,
  Order
} from '../models/payment';
import { API_NodeJS } from "./utils/axios";

// Tạo đơn hàng mới
export const createOrder = (orderData: Order) => {
  return API_NodeJS.post('paymentSepay/create-order', orderData);
};

// Kiểm tra trạng thái thanh toán
export const checkPaymentStatus = (orderId: string) => {
  return API_NodeJS.get<CheckPaymentResponse>(`paymentSepay/check-payment/${orderId}`);
};

// Lấy thông tin chi tiết đơn hàng
export const getOrderDetails = (orderId: string) => {
  return API_NodeJS.get<CheckPaymentResponse>(`paymentSepay/order/${orderId}`);
};

// Lấy danh sách webhooks
export const getWebhooks = () => {
  return API_NodeJS.get<WebhooksResponse>('paymentSepay/webhooks');
};


export const getListOrders = () => {
  return API_NodeJS.get<Order[]>(`paymentSepay/listorders`);
};
// kiểm tra order có tồn tại chưa
export const checkOrderExist = (fieldName: string, date: string, timeStart: string) => {
  return API_NodeJS.get(`paymentSepay/check-exist?field=${fieldName}&date=${date}&time=${timeStart}`);
};

// kiểm tra order đã được đặt bởi người khác chưa
export const checkUserOrderExists = (fieldName: string, date: string, timeStart: string, userId: string) => {
  return API_NodeJS.get(`paymentSepay/check-user-exist?field=${fieldName}&date=${date}&time=${timeStart}&userId=${userId}`);
};

export const getOrdersByUserId = (userId: string) => {
  return API_NodeJS.get<Order[]>(`paymentSepay/userId/${userId}`);
};

// Xóa các orders pending quá 10 phút
export const cleanupPendingOrders = () => {
  return API_NodeJS.delete('paymentSepay/cleanup-pending-orders');
};

// Cập nhật order pending thay vì tạo mới
export const updatePendingOrder = (orderId: string, orderData: Order) => {
  return API_NodeJS.put(`paymentSepay/update-pending-order/${orderId}`, orderData);
};
