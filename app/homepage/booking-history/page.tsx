'use client';
import { useEffect, useState, useMemo } from 'react';
import { Typography, message, Empty } from 'antd';
import { useAppDispatch, useAppSelector } from '@/store/hook';
import { setBreadcrumb } from '@/features/breadcrumb.slice';
import { getOrdersByUserIdSlice } from '@/features/order.slice';
import dayjs from 'dayjs';
// Import các plugin cần thiết cho dayjs
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { Order, PaymentStatus } from '@/models/payment';
import { FootballField } from '@/models/football_field';
import { BookingFilterType } from '@/types/common';

// Import components
import {
    OrderSkeleton,
    OrderCard,
    OrderTabs,
    OrderModal,
    OrderPagination,
    EmptyState
} from '@/components/booking-history';

// Đăng ký các plugin
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(customParseFormat);

const { Title } = Typography;

const BookingHistoryPage = () => {
    const orders = useAppSelector(state => state.order.value) || [];
    const footballField = useAppSelector(state => state.footballField.detail) as FootballField;
    const user = useAppSelector(state => state.auth.value);
    const dispatch = useAppDispatch();

    const [bookingFilter, setBookingFilter] = useState<BookingFilterType>('upcoming');

    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);

    // State cho modal chi tiết
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    useEffect(() => {

        if (user?.user?._id) {
            getData();
        }
    }, [dispatch, user?.user?._id]);
    
    const getData = async () => {
        setLoading(true);
        try {
            if (user.user?._id) {
                await dispatch(getOrdersByUserIdSlice(user.user._id)).unwrap();
            }
            dispatch(setBreadcrumb([
                { name: 'Home', url: '/' },
                { name: 'Lịch đặt sân', url: '/homepage/booking-history' },
            ]));
        } catch (error) {
            console.error("Error fetching orders:", error);
            message.error("Không thể tải dữ liệu đặt sân. Vui lòng thử lại sau.");
        } finally {
            setLoading(false);
        }
    };

    // Tối ưu filtering logic - đơn giản hóa để giảm loading time
    const filteredOrders = useMemo(() => {
        if (!orders?.length) return [];

        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Lọc nhanh chỉ orders thành công và có date
            return orders.filter((order: Order) => {
                if (order.paymentStatus !== "success" || !order.date) return false;

                // Parse date nhanh hơn với native Date
                const [day, month, year] = order.date.split('-').map(Number);
                const orderDate = new Date(year, month - 1, day);
                orderDate.setHours(0, 0, 0, 0);

                // Lọc theo tab
                return bookingFilter === 'upcoming'
                    ? orderDate >= today
                    : orderDate < today;
            });
        } catch (error) {
            console.error("Error filtering orders:", error);
            return [];
        }
    }, [bookingFilter, orders]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const getStatusColor = (status: PaymentStatus): string => {
        switch (status) {
            case 'success':
                return 'green';
            case 'pending':
                return 'orange';
            case 'failed':
                return 'red';
            case 'cancelled':
                return 'red';
            default:
                return 'blue';
        }
    };

    // Hàm xử lý khi click vào đơn hàng
    const handleOrderClick = (order: Order) => {
        setSelectedOrder(order);
        setIsModalVisible(true);
    };

    // Hàm đóng modal
    const handleCloseModal = () => {
        setIsModalVisible(false);
    };

    if (!user?.user) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Empty description="Vui lòng đăng nhập để xem lịch đặt sân" />
            </div>
        );
    }

    // Hàm tính thời lượng từ chuỗi timeStart (ví dụ: "09:00 - 10:30")
    const calculateDuration = (timeString: string): number => {
        if (!timeString || !timeString.includes('-')) return 90; // Giá trị mặc định nếu không có dữ liệu

        try {
            // Tách chuỗi thành giờ bắt đầu và kết thúc
            const [startTime, endTime] = timeString.split('-').map(t => t.trim());

            // Tách giờ và phút
            const [startHour, startMinute] = startTime.split(':').map(Number);
            const [endHour, endMinute] = endTime.split(':').map(Number);

            // Tính tổng phút
            const startTotalMinutes = startHour * 60 + startMinute;
            const endTotalMinutes = endHour * 60 + endMinute;

            // Tính thời lượng (phút)
            let duration = endTotalMinutes - startTotalMinutes;

            return duration;
        } catch (error) {
            console.error("Error calculating duration:", error);
            return 90; // Giá trị mặc định nếu có lỗi
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
            <div className="bg-white rounded-none sm:rounded-xl">
                <Title level={3} className="mb-4 sm:mb-6 text-xl sm:text-2xl">
                    Lịch đặt sân
                </Title>

                <OrderTabs
                    activeKey={bookingFilter}
                    onChange={setBookingFilter}
                />

                {filteredOrders.length > 0 ? (
                    <div className="space-y-3 sm:space-y-4">
                        {filteredOrders.slice((currentPage - 1) * 5, currentPage * 5).map((order: any) => (
                            <OrderCard
                                key={order._id}
                                order={order}
                                bookingFilter={bookingFilter}
                                onOrderClick={handleOrderClick}
                                getStatusColor={getStatusColor}
                            />
                        ))}
                    </div>
                ) : (
                    <EmptyState bookingFilter={bookingFilter} />
                )}

                <OrderPagination
                    current={currentPage}
                    total={filteredOrders.length}
                    pageSize={5}
                    onChange={handlePageChange}
                />
            </div>

            <OrderModal
                isVisible={isModalVisible}
                selectedOrder={selectedOrder}
                footballField={footballField}
                onClose={handleCloseModal}
                getStatusColor={getStatusColor}
                calculateDuration={calculateDuration}
            />
        </div>
    );
};

export default BookingHistoryPage;
