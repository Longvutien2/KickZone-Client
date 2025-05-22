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
  return API_NodeJS.get<Order>(`paymentSepay/listorders`);
};

export const getOrdersByUserId = (userId: string) => {
  return API_NodeJS.get<Order[]>(`paymentSepay/userId/${userId}`);
};

