import { checkOrderExist, checkUserOrderExists } from '@/api/payment';

/**
 * Kiểm tra xem sân có bị đặt trước không (chỉ check user hiện tại)
 */
export const checkOrderExists = async (
    fieldName: string,
    date: string,
    timeStart: string,
    userId?: string
) => {
    try {
        // Check xem sân có bị đặt bởi ai khác không
        if (userId) {
            const { data: userHasOrder } = await checkUserOrderExists(fieldName, date, timeStart, userId);
            if (userHasOrder.success === true) {
                return false; // sân đã có người khác đặt
            } else {
                return true;
            }
        }

        // check user có order này chưa
        const { data: orders } = await checkOrderExist(fieldName, date, timeStart);
        if (orders.success === true) {
            return false;
        } else {
            return true;
        }
    } catch (error) {
        console.error("Error checking payment status:", error);
        // Nếu có lỗi, vẫn cho phép tiếp tục
        return true;
    }
};

