// types/payment.ts

// Payment status enum for better type safety
export type PaymentStatus = 'success' | 'pending' | 'failed' | 'cancelled';

// Payment method enum
export type PaymentMethod = 'bank_transfer' | 'qr_code' | 'cash' | 'online';

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
  paymentStatus?: PaymentStatus; // Trạng thái thanh toán với type safety
  teamName: string;
  phoneNumber: string;
  description?: string;
  fieldName?: string;
  footballField?: string; // Remove any type
  paymentMethod?: PaymentMethod;
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
  order: Order;
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