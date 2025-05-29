'use client';
import { useEffect, useState } from 'react';
import { Tabs, Typography, Card, List, Tag, Button, Empty, Pagination, Avatar, Spin, message, Modal, Descriptions, Divider } from 'antd';
import { CalendarOutlined, HistoryOutlined, ClockCircleOutlined, AimOutlined, TeamOutlined, CheckCircleOutlined, PhoneOutlined, DollarOutlined, FileTextOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '@/store/hook';
import { getListOrdersSlice } from '@/features/order.slice';
import { setBreadcrumb } from '@/features/breadcrumb.slice';
import dayjs from 'dayjs';
// Import các plugin cần thiết cho dayjs
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { Order } from '@/models/payment';
import { FootballField } from '@/models/football_field';

// Đăng ký các plugin
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(customParseFormat);

const { Text, Title } = Typography;
const { TabPane } = Tabs;

const BookingHistoryPage = () => {
    const orders = useAppSelector(state => state.order.value) || [];
    const footballField = useAppSelector(state => state.footballField.detail) as FootballField;

    const [bookingFilter, setBookingFilter] = useState('upcoming');
    const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const user = useAppSelector(state => state.auth.value);
    const dispatch = useAppDispatch();

    // State cho modal chi tiết
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);

    useEffect(() => {
        const getData = async () => {
            setLoading(true);
            try {
                // Đảm bảo lấy dữ liệu mới nhất
                const result = await dispatch(getListOrdersSlice()).unwrap();
                dispatch(setBreadcrumb([
                    { name: 'Home', url: '/' },
                    { name: 'Lịch đặt sân', url: '/homepage/ranking' },
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
    }, [dispatch, user?.user?._id]);

    // Lọc đơn đặt sân dựa trên trạng thái
    useEffect(() => {
        if (!orders || !Array.isArray(orders) || orders.length === 0 || !user?.user?._id) {
            setFilteredOrders([]);
            return;
        }

        try {
            // Lấy ngày hiện tại ở đầu ngày (00:00:00)
            const today = dayjs().startOf('day');

            // Lọc đơn đặt sân của người dùng hiện tại và đã thanh toán thành công
            let filtered = orders.filter((order: Order) => {
                const isUserOrder = order.userId === user.user._id;
                const isSuccessPayment = order.paymentStatus === "success";
                return isUserOrder && isSuccessPayment;
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
            filtered.sort((a: any, b: any) => {
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
            setFilteredOrders(filtered);
        } catch (error) {
            console.error("Error filtering orders:", error);
            setFilteredOrders([]);
        }
    }, [bookingFilter, orders, user?.user?._id]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'success':
                return 'green';
            case 'pending':
                return 'orange';
            case 'failed':
                return 'red';
            default:
                return 'blue';
        }
    };

    // Hàm xử lý khi click vào đơn hàng
    const handleOrderClick = (order: any) => {
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
            <div className="bg-white rounded-none sm:rounded-xl p-4 sm:p-6">
                <Title level={3} className="mb-4 sm:mb-6 text-xl sm:text-2xl">
                    Lịch đặt sân
                </Title>

                <Tabs
                    activeKey={bookingFilter}
                    onChange={setBookingFilter}
                    className="mb-4 sm:mb-6"
                    size="large"
                >
                    <TabPane
                        tab={
                            <span className="flex items-center text-sm sm:text-base">
                                <ClockCircleOutlined className="mr-1 sm:mr-2" />
                                <span className="hidden sm:inline">Sắp tới</span>
                                <span className="sm:hidden">Sắp tới</span>
                            </span>
                        }
                        key="upcoming"
                    />
                    <TabPane
                        tab={
                            <span className="flex items-center text-sm sm:text-base">
                                <HistoryOutlined className="mr-1 sm:mr-2" />
                                <span className="hidden sm:inline">Lịch sử</span>
                                <span className="sm:hidden">Lịch sử</span>
                            </span>
                        }
                        key="history"
                    />
                </Tabs>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <Spin size="large" tip="Đang tải dữ liệu..." />
                    </div>
                ) : filteredOrders.length > 0 ? (
                    <div className="space-y-3 sm:space-y-4">
                        {filteredOrders.slice((currentPage - 1) * 5, currentPage * 5).map((order: any) => (
                            <div
                                key={order._id}
                                className="border border-gray-200 rounded-lg p-3 sm:p-4 transition-all duration-300 hover:shadow-lg hover:border-blue-300 cursor-pointer"
                                onClick={() => handleOrderClick(order)}
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
                                            <Tag color={getStatusColor(order.paymentStatus)} className="mb-2 text-xs sm:text-sm">
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
                                                handleOrderClick(order);
                                            }}
                                        >
                                            <span className="hidden sm:inline">Xem chi tiết</span>
                                            <span className="sm:hidden">Chi tiết</span>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={
                            <span className="text-gray-500">
                                {bookingFilter === 'upcoming' ? 'Không có lịch đặt sân sắp tới' :
                                    bookingFilter === 'history' ? 'Không có lịch sử đặt sân' : 'Không có đơn đặt sân nào'}
                            </span>
                        }
                        className="py-12"
                    />
                )}

                {filteredOrders.length > 5 && (
                    <div className="flex justify-center mt-4 sm:mt-6">
                        <Pagination
                            current={currentPage}
                            total={filteredOrders.length}
                            pageSize={5}
                            onChange={handlePageChange}
                            className="custom-pagination"
                            size="small"
                            showSizeChanger={false}
                            showQuickJumper={false}
                            responsive={true}
                        />
                    </div>
                )}
            </div>

            {/* Modal chi tiết đơn hàng */}
            <Modal
                title={
                    <div className="flex items-center">
                        <CalendarOutlined className="mr-2 text-blue-500" />
                        <span className="text-base sm:text-lg font-semibold">Chi tiết đặt sân</span>
                    </div>
                }
                open={isModalVisible}
                onCancel={handleCloseModal}
                footer={[
                    <Button key="close" onClick={handleCloseModal} className="w-full sm:w-auto">
                        Đóng
                    </Button>
                ]}
                width="90%"
                style={{ maxWidth: 700 }}
                centered
            >
                {selectedOrder && (
                    <div className="py-2 sm:py-4 px-1 sm:px-0">
                        <Card className="mb-4 bg-gray-50 mx-0">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
                                <div className="flex items-center">
                                    <CalendarOutlined className="text-blue-500 mr-2 flex-shrink-0" />
                                    <Text strong className="text-base sm:text-lg break-words">{selectedOrder.date} - {selectedOrder.timeStart}</Text>
                                </div>
                                <Tag color={getStatusColor(selectedOrder.paymentStatus)} className="text-xs sm:text-sm px-2 sm:px-3 py-1 self-start sm:self-center">
                                    {selectedOrder.paymentStatus === 'success' ? 'Đã thanh toán' :
                                        selectedOrder.paymentStatus === 'pending' ? 'Chờ thanh toán' : 'Thất bại'}
                                </Tag>
                            </div>

                            <Descriptions
                                bordered
                                column={1}
                                size="small"
                                labelStyle={{
                                    width: '35%',
                                    fontSize: '14px',
                                    padding: '8px 12px'
                                }}
                                contentStyle={{
                                    fontSize: '14px',
                                    padding: '8px 12px'
                                }}
                            >
                                <Descriptions.Item label="Mã đơn hàng">
                                    <span className="break-all text-xs sm:text-sm">{selectedOrder.sepayId || selectedOrder._id}</span>
                                </Descriptions.Item>
                                <Descriptions.Item label="Tên sân bóng">{footballField.name || "Không có thông tin"}</Descriptions.Item>
                                <Descriptions.Item label="Số sân">{selectedOrder.fieldName || "Không có thông tin"}</Descriptions.Item>
                                <Descriptions.Item label="Ngày đặt">{selectedOrder.date}</Descriptions.Item>
                                <Descriptions.Item label="Giờ bắt đầu">{selectedOrder.timeStart}</Descriptions.Item>
                                <Descriptions.Item label="Thời lượng">
                                    {calculateDuration(selectedOrder.timeStart)} phút
                                </Descriptions.Item>
                                <Descriptions.Item label="Số điện thoại">{footballField.phone || ""}</Descriptions.Item>
                            </Descriptions>
                        </Card>

                        <Divider orientation="left" className="text-sm sm:text-base">Thông tin thanh toán</Divider>
                        <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 mx-0">
                            <div className="flex flex-col sm:flex-row sm:justify-between mb-3 gap-1 sm:gap-0">
                                <Text className="text-sm sm:text-base">Tên đội:</Text>
                                <Text strong className="text-sm sm:text-base break-words">{selectedOrder.teamName || ""}</Text>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between mb-3 gap-1 sm:gap-0">
                                <Text className="text-sm sm:text-base">Liên hệ:</Text>
                                <Text strong className="text-sm sm:text-base break-words">{selectedOrder.phoneNumber || ""}</Text>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between mb-3 gap-1 sm:gap-0">
                                <Text className="text-sm sm:text-base">Phương thức thanh toán:</Text>
                                <Text strong className="text-sm sm:text-base">{selectedOrder.paymentMethod || "Thanh toán online"}</Text>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between mb-3 gap-1 sm:gap-0">
                                <Text className="text-sm sm:text-base">Ghi chú:</Text>
                                <Text strong className="text-sm sm:text-base break-words text-right sm:text-left">{selectedOrder.description || "Không có ghi chú"}</Text>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between mb-3 gap-1 sm:gap-0">
                                <Text className="text-sm sm:text-base">Thời gian thanh toán:</Text>
                                <Text strong className="text-xs sm:text-sm break-words">{selectedOrder.transactionDate || "Không có thông tin"}</Text>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between mb-3 gap-1 sm:gap-0">
                                <Text className="text-sm sm:text-base">Trạng thái:</Text>
                                <Tag color={getStatusColor(selectedOrder.paymentStatus)} className="self-start sm:self-center">
                                    {selectedOrder.paymentStatus === 'success' ? 'Đã thanh toán' :
                                        selectedOrder.paymentStatus === 'pending' ? 'Chờ thanh toán' : 'Thất bại'}
                                </Tag>
                            </div>
                            <Divider className="my-3" />
                            <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-2 sm:gap-0">
                                <Text strong className="text-base sm:text-lg">Tổng tiền:</Text>
                                <Text strong className="text-lg sm:text-xl text-red-500">{selectedOrder.amount?.toLocaleString()} VNĐ</Text>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default BookingHistoryPage;
