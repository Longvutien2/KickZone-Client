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
        const getData = async () => {
            setLoading(true);
            try {
                // Chỉ fetch nếu chưa có data hoặc data cũ
                if (!orders || orders.length === 0) {
                    // Sử dụng API tối ưu chỉ lấy orders của user hiện tại
                    if (user?.user?._id) {
                        await dispatch(getOrdersByUserIdSlice(user.user._id)).unwrap();
                    }
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

        if (user?.user?._id) {
            getData();
        } else {
            setLoading(false);
        }
    }, [dispatch, user?.user?._id]); // Bỏ orders khỏi dependency để tránh infinite loop

    // Memoized filtering logic để tối ưu performance
    const filteredOrders = useMemo(() => {
        if (!orders || !Array.isArray(orders) || orders.length === 0) {
            return [];
        }

        try {
            // Lấy ngày hiện tại ở đầu ngày (00:00:00)
            const today = dayjs().startOf('day');

            // Lọc đơn đặt sân đã thanh toán thành công (API đã filter theo userId)
            let filtered = orders.filter((order: Order) => {
                return order.paymentStatus === "success";
            });

            // Lọc theo tab đang chọn
            switch (bookingFilter) {
                case 'upcoming':
                    // Các đơn đặt sân sắp tới (từ hôm nay trở đi)
                    filtered = filtered.filter((order: Order) => {
                        if (!order.date) return false;

                        // Chuyển đổi chuỗi ngày từ định dạng "DD-MM-YYYY" sang đối tượng dayjs
                        const dateParts = order.date.split('-');
                        if (dateParts.length !== 3) return false;

                        // Tạo đối tượng Date từ các phần của ngày (chú ý thứ tự: năm, tháng-1, ngày)
                        const orderDate = dayjs(new Date(
                            parseInt(dateParts[2]), // Năm
                            parseInt(dateParts[1]) - 1, // Tháng (0-11)
                            parseInt(dateParts[0]) // Ngày
                        )).startOf('day');

                        // So sánh với ngày hiện tại
                        const isUpcoming = orderDate.isAfter(today) || orderDate.isSame(today);
                        return isUpcoming;
                    });
                    break;
                case 'history':
                    // Lịch sử đặt sân (trước hôm nay)
                    filtered = filtered.filter((order: Order) => {
                        if (!order.date) return false;

                        // Chuyển đổi chuỗi ngày từ định dạng "DD-MM-YYYY" sang đối tượng dayjs
                        const dateParts = order.date.split('-');
                        if (dateParts.length !== 3) return false;

                        // Tạo đối tượng Date từ các phần của ngày (chú ý thứ tự: năm, tháng-1, ngày)
                        const orderDate = dayjs(new Date(
                            parseInt(dateParts[2]), // Năm
                            parseInt(dateParts[1]) - 1, // Tháng (0-11)
                            parseInt(dateParts[0]) // Ngày
                        )).startOf('day');

                        // So sánh với ngày hiện tại
                        const isHistory = orderDate.isBefore(today);
                        return isHistory;
                    });
                    break;
            }

            // Sắp xếp theo ngày, gần nhất lên đầu
            return filtered.sort((a: any, b: any) => {
                // Chuyển đổi chuỗi ngày từ định dạng "DD-MM-YYYY" sang đối tượng dayjs
                const datePartsA = a.date?.split('-');
                const datePartsB = b.date?.split('-');

                const dateA = dayjs(new Date(
                    parseInt(datePartsA[2]), // Năm
                    parseInt(datePartsA[1]) - 1, // Tháng (0-11)
                    parseInt(datePartsA[0]) // Ngày
                ));

                const dateB = dayjs(new Date(
                    parseInt(datePartsB[2]), // Năm
                    parseInt(datePartsB[1]) - 1, // Tháng (0-11)
                    parseInt(datePartsB[0]) // Ngày
                ));

                return dateB.diff(dateA);
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

                {loading ? (
                    <OrderSkeleton />
                ) : filteredOrders.length > 0 ? (
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
