// types/payment.ts
export interface Order {
  _id?: string;
  sepayId?: string;
  userId?: string;
  bookingId?: string;
  gateway?: string; // Ngân hàng
  transactionDate?: string; // thoi gian dat
  accountNumber?: string; // Số tài khoản
  amount?: number;
  content?: string; // Nội dung chuyển khoản
  paymentStatus?: string; // Trạng thái thanh toán
  teamName: string;
  phoneNumber: string;
  description?: string;
  fieldName?: string;
  timeStart?: string;
  date?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateOrderRequest {
  amount: number;
  description: string;
  redirectUrl?: string;
}

export interface CreateOrderResponse {
  success: boolean;
  order: Order;
}

export interface CheckPaymentResponse {
  success: boolean;
  order: Order | any;
}

export interface WebhookData {
  id: string;
  gateway: string;
  transactionDate: string;
  accountNumber: string;
  code: string;
  content: string;
  transferType: string;
  transferAmount: number;
}

export interface Webhook {
  timestamp: string;
  data: WebhookData;
}

export interface WebhooksResponse {
  success: boolean;
  webhooks: Webhook[];
}