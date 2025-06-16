// components/PaymentQR.tsx
'use client';
import { useState, useEffect, FC, useRef } from 'react';
import { checkPaymentStatus, getListOrders } from '@/api/payment';
import { Order } from '@/models/payment';
import { Spin, Alert, Result, Card } from 'antd';
import { addNotificationSlice } from '@/features/notification.slice';
import { useDispatch } from 'react-redux';
import { Notification } from '@/models/notification';
import { toast } from 'react-toastify';
import { useAppDispatch } from '@/store/hook';
import { BankOutlined } from '@ant-design/icons';
import { checkOrderExists } from '@/utils/orderUtils';

interface PaymentQRProps {
    amount: number;
    userId: string;
    bookingId?: string;
    description: string;
    qrContent: string;
    orderId: string;
    onSuccess?: (success: boolean) => void;
    orderCreated?: boolean;
    fieldData?: any; // Thêm fieldData để có thông tin về sân
    newOrder?: any; // Thêm newOrder để có thông tin về đơn hàng
    selectedPayment?: string;
}

const PaymentQR: FC<PaymentQRProps> = ({
    orderId,
    userId,
    amount,
    qrContent,
    description,
    onSuccess,
    orderCreated = false,
    fieldData,
    newOrder,
    selectedPayment
}) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [notificationSent, setNotificationSent] = useState(false); // Thêm state để theo dõi việc gửi thông báo

    // Sử dụng useRef để theo dõi interval và trạng thái mount
    const intervalIdRef = useRef<NodeJS.Timeout | null>(null);
    const isMounted = useRef(true);
    const dispatch = useAppDispatch();

    const convertDescription = (description: string) => {
        let converted = description
            .replace(/Sân/g, 'San') // Sân → San
            .replace(/-/g, '') // Loại bỏ dấu gạch ngang: 31-05-2025 → 31052025
            .replace(/:/g, '') // Loại bỏ dấu hai chấm: 06:30 → 0630
            .replace(/\s-\s/g, ' ') // Loại bỏ " - ": 06:30 - 08:00 → 06:30 08:00
            .replace(/\s+/g, ' ') // Chuẩn hóa khoảng trắng
            .trim();

        return converted;
    };

    // Hàm gửi thông báo
    const sendNotifications = async () => {
        if (notificationSent || !fieldData || !newOrder) return; // Nếu đã gửi thông báo hoặc không có dữ liệu, không làm gì cả

        try {
            // Thông tin thông báo cho Manager (quản lý sân)
            const managerNotification: Notification = {
                actor: 'manager',
                notificationType: 'new_order',
                title: `${fieldData.field} đã có người đặt!`,
                content: `Sân của bạn đã có người đặt vào thời lúc: ${fieldData.timeStart}, ngày ${fieldData.date}.`,
                orderId: newOrder._id,
                footballfield: fieldData.footballField,
                // targetUser: userId,
            };

            await dispatch(addNotificationSlice(managerNotification));

            // Thông báo cho người dùng
            const userNotification: Notification = {
                actor: 'user',
                notificationType: 'field_booked',
                title: 'Đặt sân thành công!',
                content: `Chúc mừng bạn đã đặt sân thành công tại Sân bóng ${fieldData.fieldName}.`,
                orderId: newOrder._id,
                footballfield: fieldData.footballField,
                targetUser: userId,
            };

            await dispatch(addNotificationSlice(userNotification));
            setNotificationSent(true); // Đánh dấu đã gửi thông báo
            console.log("Đã gửi thông báo thành công");
        } catch (error) {
            console.error("Lỗi khi gửi thông báo:", error);
        }
    };

    useEffect(() => {
        // Đánh dấu component đã mount
        isMounted.current = true;
        // Bắt đầu kiểm tra thanh toán nếu đơn hàng đã được tạo
        if (orderCreated && orderId && description) {
            // Hàm kiểm tra thanh toán
            const checkPayment = async () => {
                try {
                    console.log("Đang kiểm tra thanh toán...");

                    // Kiểm tra sân có bị đặt trước không
                    if (fieldData) {
                        const canProceed = await checkOrderExists(fieldData.field, fieldData.date, fieldData.timeStart, userId);
                        if (canProceed === false) {
                            // Sân đã được đặt bởi người khác!
                            if (intervalIdRef.current) {
                                clearInterval(intervalIdRef.current);
                                intervalIdRef.current = null;
                            }
                            toast.error("Khung giờ này đã có người đặt và thanh toán thành công. Vui lòng chọn sân khác!");
                            if (onSuccess) onSuccess(false);
                            return;
                        }
                    }

                    // Kiểm tra thanh toán của user hiện tại
                    const result = await checkPaymentStatus(orderId);

                    // Kiểm tra xem component còn mounted không trước khi cập nhật state
                    if (isMounted.current) {
                        if (result.data.success && result.data.order) {
                            setSuccess(true);

                            // Gửi thông báo khi thanh toán thành công
                            await sendNotifications();

                            // Thông báo cho component cha
                            if (onSuccess) onSuccess(true);

                            console.log("Thanh toán thành công");

                            // Dừng kiểm tra khi thanh toán thành công
                            if (intervalIdRef.current) {
                                clearInterval(intervalIdRef.current);
                                intervalIdRef.current = null;
                            }
                        }
                    }
                } catch (err) {
                    console.error('Error checking payment status:', err);
                }
            };

            // Gọi lần đầu ngay lập tức
            checkPayment();

            // Sau đó thiết lập interval
            intervalIdRef.current = setInterval(checkPayment, 5000);
        }

        // Cleanup khi component unmount
        return () => {
            isMounted.current = false;
            if (intervalIdRef.current) {
                clearInterval(intervalIdRef.current);
                intervalIdRef.current = null;
            }
        };
    }, [orderCreated, orderId, description, onSuccess]);

    if (loading) return <Spin tip="Đang kiểm tra thanh toán..." size="large" />;

    return (
        <div>
            {selectedPayment === "qr" ? (
                <div>
                    <Alert
                        message="Hướng dẫn thanh toán"
                        description={orderCreated
                            ? "Vui lòng quét mã QR để thanh toán. Hệ thống đang tự động kiểm tra trạng thái thanh toán."
                            : "Vui lòng quét mã QR để thanh toán. Sau khi thanh toán, hệ thống sẽ tự động kiểm tra và xác nhận."}
                        type="info"
                        showIcon
                        style={{ marginBottom: 16 }}
                    />

                    <div>
                        <div className="flex flex-col items-center mb-4">
                            {/* Hiển thị mã QR */}
                            <img
                                src={qrContent}
                                alt="QR Code thanh toán"
                                className="h-64 w-64 border-gray-200 rounded-md mb-4"
                            />
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200 text-left">
                            <table className="w-full text-sm">
                                <tbody>
                                    <tr>
                                        <td className="py-1 font-medium w-1/3">Ngân hàng:</td>
                                        <td className="text-blue-600">MB Bank</td>
                                    </tr>
                                    <tr>
                                        <td className="py-1 font-medium">Số tài khoản:</td>
                                        <td>29777777729</td>
                                    </tr>
                                    <tr>
                                        <td className="py-1 font-medium">Chủ tài khoản:</td>
                                        <td>VŨ TIẾN LONG</td>
                                    </tr>
                                    <tr>
                                        <td className="py-1 font-medium">Số tiền:</td>
                                        <td className="text-red-600 font-bold">{amount?.toLocaleString()} VNĐ</td>
                                    </tr>
                                    <tr>
                                        <td className="py-1 font-medium">Nội dung CK:</td>
                                        <td className="font-bold">{convertDescription(description)}</td>
                                    </tr>
                                    <tr>
                                        <td className="py-1 font-medium">Mã đơn hàng:</td>
                                        <td className="font-bold">{orderId}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {orderCreated && (
                            <div className="mt-4 text-center">
                                <Spin tip="Đang kiểm tra thanh toán..." />
                                <p className="mt-2 text-gray-500">Hệ thống đang tự động kiểm tra trạng thái thanh toán của bạn...</p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="space-y-4 text-left">
                    {/* Header thông tin thanh toán */}
                    <Card className="border border-gray-200 mb-4 lg:mb-6">
                        <div className="flex items-center gap-3 mb-4">
                            <BankOutlined className="text-blue-500 text-xl" />
                            <h3 className="text-lg font-semibold">
                                {'Thanh toán bằng chuyển khoản'}
                            </h3>
                        </div>

                        {/* Thông tin thanh toán */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 ">
                            <table className="w-full text-sm">
                                <tbody>
                                    <tr>
                                        <td className="py-2 font-medium w-1/3">Ngân hàng:</td>
                                        <td className="text-blue-600 font-semibold">
                                            {'MB Bank'}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="py-2 font-medium">Số tài khoản:</td>
                                        <td className="font-mono">
                                            {'29777777729'}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="py-2 font-medium">Chủ tài khoản:</td>
                                        <td className="font-semibold">
                                            {'VU TIEN LONG'}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="py-2 font-medium">Số tiền:</td>
                                        <td className="text-red-600 font-bold text-lg">{amount?.toLocaleString()} VNĐ</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2 font-medium">Nội dung CK:</td>
                                        <td className="font-bold text-orange-600">DH{convertDescription(description)}</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2 font-medium">Mã đơn hàng:</td>
                                        <td className="font-mono text-gray-600">{orderId}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        {orderCreated && (
                            <div className="mt-4 text-center">
                                <Spin tip="Đang kiểm tra thanh toán..." />
                                <p className="mt-2 text-gray-500">Hệ thống đang tự động kiểm tra trạng thái thanh toán của bạn...</p>
                            </div>
                        )}
                    </Card>

                    {/* Lưu ý */}
                    <Alert
                        message="Lưu ý quan trọng"
                        description={
                            <ul className="list-disc list-inside space-y-1 text-sm">
                                <li className='text-red-500'><strong>Vui lòng nhập chính xác SỐ TIỀN và NỘI DUNG CHUYỂN KHOẢN</strong></li>
                                <li>Thời gian xử lý: 1-3 phút (Sau khi thanh toán)</li>
                                <li>Đơn hàng sẽ được xác nhận sau khi nhận được tiền</li>
                                <li>Liên hệ hotline nếu cần hỗ trợ: <strong>0966724435</strong></li>
                            </ul>
                        }
                        type="info"
                        showIcon
                    />
                </div>
            )
            }
        </div>
    );
};

export default PaymentQR;
