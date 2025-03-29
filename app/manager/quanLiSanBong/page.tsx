'use client';
import { useEffect } from 'react'
import { useState } from "react";
import { Layout, Menu, Calendar, Modal, Badge, ConfigProvider } from "antd";
import { format } from "date-fns";
import dayjs, { Dayjs } from "dayjs";
import viVN from "antd/lib/locale/vi_VN";
import "dayjs/locale/vi";
import { useAppDispatch, useAppSelector } from '@/store/hook';
import { getFootballFieldByIdUserSlice } from '@/features/footballField.slice';

const { Sider, Content } = Layout;

interface Booking {
    id: string;
    name: string;
    date: string;
    time: string;
    user: {
        username: string,
        phone: string,
        email: string
    };
    deposit: number,
    note: string
}

const bookingsData: Booking[] = [
    {
        id: "1",
        name: "Sân 2",
        date: "2025-03-05",
        time: "9:00 - 7:30",
        user: {
            username: "Nguyễn Văn A", phone: "0987654321", email: "nguyenvana@email.com"
        },
        deposit: 200000,
        note: "Ghi chú A"
    },
    {
        id: "2",
        name: "Sân 2",
        date: "2025-03-05",
        time: "19:00 - 20:30",
        user: {
            username: "Đào đức minh", phone: "0987654321", email: "nguyenvana@email.com"
        },
        deposit: 200000,
        note: "Ghi chú A"
    },
    {
        id: "3",
        name: "Sân 1",
        date: "2025-03-07",
        time: "19:00 - 20:30",
        user: {
            username: "Vũ chí thanh", phone: "0987654321", email: "nguyenvana@email.com"
        },
        deposit: 200000,
        note: "Ghi chú A"
    },
]

const QuanLiSanBong = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
    const user = useAppSelector((state) => state.auth.value.user)
    const dispatch = useAppDispatch();

    dayjs.locale("vi"); // Chuyển Ant Design sang Tiếng Việt

    const handleDateChange = (date: dayjs.Dayjs) => {
        if (!date) return;
        const formattedDate = format(date.toDate(), "yyyy-MM-dd"); // Chuyển dayjs thành Date
        setSelectedDate(formattedDate);
    };

    const handleViewBooking = (id: string) => {
        if (!id) return; // Kiểm tra xem booking có hợp lệ không
        const newBooking = bookingsData.filter((booking: Booking) => booking.id === id);
        setSelectedBooking(newBooking[0]);
        setModalVisible(true);
    };

    const dateCellRender = (date: Dayjs) => {
        const formattedDate = date.format("YYYY-MM-DD")
        // Lọc danh sách đặt sân theo ngày được chọn
        const totalBookings = bookingsData.filter((booking) => booking.date === formattedDate).length;

        return totalBookings > 0 ? (
            <div className="text-right">
                <Badge status="error" text={`${totalBookings} ca đã đặt`} />
            </div>
        ) : null;
    };

    // Lọc danh sách đặt sân theo ngày
    const filteredBookings = bookingsData.filter((booking) => booking.date === selectedDate);

    // Nhóm ca đá theo sân
    const groupedBookings: Record<string, typeof bookingsData> = filteredBookings.reduce((acc, booking) => {
        if (!acc[booking.name]) acc[booking.name] = [];
        acc[booking.name].push(booking);
        return acc;
    }, {} as Record<string, typeof bookingsData>);

    useEffect(() => {
        const getData = async () => {
            const data = await dispatch(getFootballFieldByIdUserSlice(user._id as string))
            console.log("data:", data);
        }
        getData();
    }, [user]);
    return (
        <Layout className="flex">
            {/* Menu Danh sách sân */}
            <Sider width={250} className="bg-gray-200 p-4">
                <h2 className="text-lg font-medium mb-3">Sân đã được đặt</h2>
                <h3 className="text-base font-medium mb-3">Ngày: {selectedDate}</h3>
                <Menu mode="inline" className="border-0" items={Object.keys(groupedBookings).length > 0 ? Object.entries(groupedBookings).map(([field, bookings]) => ({
                    key: field,
                    label: <span className="font-semibold">{field}</span>,
                    children: bookings.map((booking) => ({
                        key: booking.id,
                        label: booking.time,
                        onClick: () => handleViewBooking(booking.id),
                        className: "text-red-500 hover:text-red-700",
                    }))
                })) : [{ key: "noData", label: "Không có ca đá nào trong ngày", disabled: true }]} />

            </Sider>

            {/* Lịch */}
            <Content className="p-5 flex-1 w-full">
                <ConfigProvider locale={viVN}>
                    <Calendar className="mt-5" cellRender={dateCellRender} onSelect={handleDateChange} />

                </ConfigProvider>
                {/* Modal hiển thị chi tiết đặt sân */}
                <Modal
                    title="Thông tin đặt sân"
                    open={modalVisible}
                    onCancel={() => setModalVisible(false)}
                    footer={null}
                >
                    {selectedBooking ? (
                        <div className="space-y-3">
                            <p><strong>Người đặt:</strong> {selectedBooking.user?.username || "Không có thông tin"}</p>
                            <p><strong>Số điện thoại:</strong> {selectedBooking.user?.phone || "Không có thông tin"}</p>
                            <p><strong>Email:</strong> {selectedBooking.user?.email || "Không có thông tin"}</p>
                            <p><strong>Thời gian:</strong> {selectedBooking.time}</p>
                            <p><strong>Tiền cọc:</strong> {selectedBooking.deposit ? selectedBooking.deposit.toLocaleString() + " VND" : "Không có thông tin"}</p>
                            <p><strong>Ghi chú:</strong> {selectedBooking.note || "Không có ghi chú"}</p>
                        </div>
                    ) : (
                        <p>Không có dữ liệu đặt sân.</p>
                    )}
                </Modal>

            </Content>
        </Layout>
    )
}

export default QuanLiSanBong