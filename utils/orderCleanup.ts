// utils/orderCleanup.ts
import { cleanupPendingOrders } from '@/api/payment';

/**
 * Tự động xóa các orders pending quá 10 phút
 * Có thể được gọi từ:
 * 1. Component khi mount
 * 2. Scheduled job (nếu có)
 * 3. Manual trigger từ admin panel
 */
export const performOrderCleanup = async () => {
  try {
    const result = await cleanupPendingOrders();
    console.log('Order cleanup completed:', result.data);
    return result.data;
  } catch (error) {
    console.error('Order cleanup failed:', error);
    throw error;
  }
};

/**
 * Setup interval để tự động cleanup mỗi 5 phút
 * Chỉ nên chạy ở một nơi (ví dụ: layout chính)
 */
export const setupAutoCleanup = () => {
  // Cleanup ngay khi setup
  performOrderCleanup();
  
  // Setup interval cleanup mỗi 5 phút
  const intervalId = setInterval(() => {
    performOrderCleanup();
  }, 5 * 60 * 1000); // 5 phút

  // Return function để clear interval khi cần
  return () => clearInterval(intervalId);
};

/**
 * Hook để sử dụng trong React components
 */
export const useOrderCleanup = (autoStart: boolean = true) => {
  if (typeof window !== 'undefined' && autoStart) {
    // Chỉ chạy ở client side
    performOrderCleanup();
  }
};
