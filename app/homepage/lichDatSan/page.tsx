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
            <div className="bg-white rounded-xl">
                <Title level={3} className="mb-6">
                    Lịch đặt sân
                </Title>

                <Tabs
                    activeKey={bookingFilter}
                    onChange={setBookingFilter}
                    className="mb-6"
                >
                    <TabPane
                        tab={
                            <span className="flex items-center">
                                <ClockCircleOutlined className="mr-2" />
                                Sắp tới
                            </span>
                        }
                        key="upcoming"
                    />
                    <TabPane
                        tab={
                            <span className="flex items-center">
                                <HistoryOutlined className="mr-2" />
                                Lịch sử
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
                    <div className="space-y-4">
                        {filteredOrders.slice((currentPage - 1) * 5, currentPage * 5).map((order: any) => (
                            <div
                                key={order._id}
                                className="border border-gray-200 rounded-lg p-4 transition-all duration-300 hover:shadow-lg hover:border-blue-300 cursor-pointer"
                                onClick={() => handleOrderClick(order)}
                            >
                                <div className="flex items-center mb-2">
                                    <CalendarOutlined className="mr-2 text-blue-500" />
                                    <Text strong className="text-lg">{order.date} - {order.timeStart}</Text>
                                    {bookingFilter === 'upcoming' && (
                                        <Tag color="blue" className="ml-2">Sắp tới</Tag>
                                    )}
                                    {bookingFilter === 'history' && (
                                        <Tag color="gray" className="ml-2">Đã qua</Tag>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center">
                                            <TeamOutlined className="mr-2" />
                                            <Text>Số sân: {order.fieldName || 'Chưa có thông tin'}</Text>
                                        </div>
                                        <div className="flex items-center">
                                            <PhoneOutlined className="mr-2" />
                                            <Text>Liên hệ: {order.phoneNumber || 'Chưa có thông tin'}</Text>
                                        </div>
                                        <div className="flex items-center">
                                            <FileTextOutlined className="mr-2" />
                                            <Text>Ghi chú: {order.description || "Không có ghi chú"} </Text>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <Tag color={getStatusColor(order.paymentStatus)}>
                                            {order.paymentStatus === 'success' ? 'Đã thanh toán' :
                                                order.paymentStatus === 'pending' ? 'Chờ thanh toán' : 'Thất bại'}
                                        </Tag>
                                        <div className="mt-2 text-lg font-semibold text-red-500">
                                            {order.amount?.toLocaleString()} VNĐ
                                        </div>
                                        <Button
                                            type="link"
                                            icon={<InfoCircleOutlined />}
                                            className="mt-1 text-blue-500"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleOrderClick(order);
                                            }}
                                        >
                                            Xem chi tiết
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
                    <div className="flex justify-center mt-6">
                        <Pagination
                            current={currentPage}
                            total={filteredOrders.length}
                            pageSize={5}
                            onChange={handlePageChange}
                            className="custom-pagination"
                        />
                    </div>
                )}
            </div>

            {/* Modal chi tiết đơn hàng */}
            <Modal
                title={
                    <div className="flex items-center">
                        <CalendarOutlined className="mr-2 text-blue-500" />
                        <span className="text-lg font-semibold">Chi tiết đặt sân</span>
                    </div>
                }
                open={isModalVisible}
                onCancel={handleCloseModal}
                footer={[
                    <Button key="close" onClick={handleCloseModal}>
                        Đóng
                    </Button>
                ]}
                width={700}
            >
                {selectedOrder && (
                    <div className="py-4">
                        <Card className="mb-4 bg-gray-50">
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center">
                                    <CalendarOutlined className="text-blue-500 mr-2" />
                                    <Text strong className="text-lg">{selectedOrder.date} - {selectedOrder.timeStart}</Text>
                                </div>
                                <Tag color={getStatusColor(selectedOrder.paymentStatus)} className="text-sm px-3 py-1">
                                    {selectedOrder.paymentStatus === 'success' ? 'Đã thanh toán' :
                                        selectedOrder.paymentStatus === 'pending' ? 'Chờ thanh toán' : 'Thất bại'}
                                </Tag>
                            </div>

                            <Descriptions bordered column={1} size="small">
                                <Descriptions.Item label="Mã đơn hàng">{selectedOrder.sepayId || selectedOrder._id}</Descriptions.Item>
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

                        <Divider orientation="left">Thông tin thanh toán</Divider>
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <div className="flex justify-between mb-2">
                                <Text>Tên đội:</Text>
                                <Text strong>{selectedOrder.teamName || ""}</Text>
                            </div>
                               <div className="flex justify-between mb-2">
                                <Text>Liên hệ:</Text>
                                <Text strong>{selectedOrder.phoneNumber || ""}</Text>
                            </div>
                            <div className="flex justify-between mb-2">
                                <Text>Phương thức thanh toán:</Text>
                                <Text strong>{selectedOrder.paymentMethod || "Thanh toán online"}</Text>
                            </div>
                            <div className="flex justify-between mb-2">
                                <Text>Ghi chú:</Text>
                                <Text strong>{selectedOrder.description || "Không có ghi chú"}</Text>
                            </div>
                            <div className="flex justify-between mb-2">
                                <Text>Thời gian thanh toán:</Text>
                                <Text strong>{selectedOrder.transactionDate || "Không có thông tin"}</Text>
                            </div>
                            <div className="flex justify-between mb-2">
                                <Text>Trạng thái:</Text>
                                <Tag color={getStatusColor(selectedOrder.paymentStatus)}>
                                    {selectedOrder.paymentStatus === 'success' ? 'Đã thanh toán' :
                                        selectedOrder.paymentStatus === 'pending' ? 'Chờ thanh toán' : 'Thất bại'}
                                </Tag>
                            </div>
                            <Divider className="my-2" />
                            <div className="flex justify-between">
                                <Text strong>Tổng tiền:</Text>
                                <Text strong className="text-xl text-red-500">{selectedOrder.amount?.toLocaleString()} VNĐ</Text>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default BookingHistoryPage;
