import { Tag, Button, Typography } from 'antd';
import { CalendarOutlined, TeamOutlined, PhoneOutlined, FileTextOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { Order, PaymentStatus } from '@/models/payment';
import { BookingFilterType } from '@/types/common';

const { Text } = Typography;

interface OrderCardProps {
    order: Order;
    bookingFilter: BookingFilterType;
    onOrderClick: (order: Order) => void;
    getStatusColor: (status: PaymentStatus) => string;
}

const OrderCard = ({ order, bookingFilter, onOrderClick, getStatusColor }: OrderCardProps) => {
    return (
        <div
            className="border border-gray-200 rounded-lg p-3 sm:p-4 transition-all duration-300 hover:shadow-lg hover:border-blue-300 cursor-pointer"
            onClick={() => onOrderClick(order)}
        >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-2">
                <div className="flex items-center mb-2 sm:mb-0">
                    <CalendarOutlined className="mr-2 text-blue-500 text-base sm:text-lg" />
                    <Text strong className="text-base sm:text-lg">{order.date} - {order.timeStart}</Text>
                </div>
                <div className="flex gap-2">
                    {bookingFilter === 'upcoming' && (
                        <Tag color="blue" className="text-xs sm:text-sm">Sắp tới</Tag>
                    )}
                    {bookingFilter === 'history' && (
                        <Tag color="gray" className="text-xs sm:text-sm">Đã qua</Tag>
                    )}
                </div>
            </div>

            <div className="flex flex-col lg:grid lg:grid-cols-2 gap-3 lg:gap-4">
                <div className="space-y-2">
                    <div className="flex items-center text-sm sm:text-base">
                        <TeamOutlined className="mr-2 text-gray-500 flex-shrink-0" />
                        <Text className="truncate">Số sân: {order.fieldName || 'Chưa có thông tin'}</Text>
                    </div>
                    <div className="flex items-center text-sm sm:text-base">
                        <PhoneOutlined className="mr-2 text-gray-500 flex-shrink-0" />
                        <Text className="truncate">Liên hệ: {order.phoneNumber || 'Chưa có thông tin'}</Text>
                    </div>
                    <div className="flex items-start text-sm sm:text-base">
                        <FileTextOutlined className="mr-2 text-gray-500 flex-shrink-0 mt-0.5" />
                        <Text className="line-clamp-2">Ghi chú: {order.description || "Không có ghi chú"}</Text>
                    </div>
                </div>

                <div className="flex flex-row lg:flex-col justify-between lg:justify-start items-center lg:items-end text-right">
                    <div className="flex flex-col lg:order-1">
                        <Tag color={getStatusColor(order.paymentStatus || 'pending')} className="mb-2 text-xs sm:text-sm">
                            {order.paymentStatus === 'success' ? 'Đã thanh toán' :
                                order.paymentStatus === 'pending' ? 'Chờ thanh toán' : 'Thất bại'}
                        </Tag>
                        <div className="text-base sm:text-lg font-semibold text-red-500">
                            {order.amount?.toLocaleString()} VNĐ
                        </div>
                    </div>
                    <Button
                        type="link"
                        icon={<InfoCircleOutlined />}
                        className="text-blue-500 text-xs sm:text-sm lg:mt-2 lg:order-2"
                        size="small"
                        onClick={(e) => {
                            e.stopPropagation();
                            onOrderClick(order);
                        }}
                    >
                        <span className="hidden sm:inline">Xem chi tiết</span>
                        <span className="sm:hidden">Chi tiết</span>
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default OrderCard;
