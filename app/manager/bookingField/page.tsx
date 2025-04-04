'use client';

import React, { useEffect, useState } from 'react';
import { Table, Badge, Input, Space, Popconfirm, Button, Tag } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';
import { useAppDispatch, useAppSelector } from '@/store/hook';
import { getListBookingsSlice, removeBookingSlice, updateBookingSlice } from '@/features/booking.slice';
import { Booking } from '@/models/booking';
import { Notification } from '@/models/notification';
import { addNotificationSlice } from '@/features/notification.slice';

const statusMap: Record<string, { text: string, status: string }> = {
    'Chờ xác nhận': { text: 'Chờ xác nhận', status: 'processing' },
    'Đã xác nhận': { text: 'Đã xác nhận', status: 'success' },
    'Đã huỷ': { text: 'Đã huỷ', status: 'error' },
    'Thất bại': { text: 'Thất bại', status: 'warning' },
};

const BookingTable = () => {
    const bookings = useAppSelector((state) => state.booking.value);
    const [searchText, setSearchText] = useState("");
    const dispath = useAppDispatch();
    const [groupedBookings, setGroupedBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const dispatch = useAppDispatch();

    const handleDelete = async (id: string) => {
        await dispath(removeBookingSlice(id));
        toast.success("Xóa thành công!");
    };

    const handleApprove = async (book: any, bookings: any) => {
        const userNotification: Notification = {
            actor: 'user',
            notificationType: 'field_booked',
            title: 'Đặt sân thành công!',
            content: `Chúc mừng bạn đã đặt sân thành công tại Sân bóng ${book.fieldName}.`,
            bookingId: book._id,
            footballfield: book.footballField,
            targetUser: book.user,
        }
        await dispatch(addNotificationSlice(userNotification));
        await dispatch(updateBookingSlice({ _id: book._id, status: "Đã xác nhận" })).unwrap();
        toast.success('Cập nhật thành công!');
    }

    const groupBookings = () => {
        const grouped: any = {};
        bookings.forEach((booking: Booking) => {
            const key = `${booking.date}-${booking.timeStart}-${booking.field}`;
            if (!grouped[key]) {
                grouped[key] = {
                    date: booking.date,
                    timeStart: booking.timeStart,
                    field: booking.field,
                    price: booking.price,
                    status: booking.status,  // Trạng thái ban đầu
                    bookings: [booking],
                };
            } else {
                grouped[key].bookings.push(booking);
            }

            // Kiểm tra trạng thái của các booking trong mảng
            if (grouped[key].bookings.some((b: Booking) => b.status === 'Đã xác nhận')) {
                grouped[key].status = 'Đã xác nhận'; // Nếu có booking đã xác nhận, cập nhật trạng thái của nhóm
            }
        });
        setGroupedBookings(Object.values(grouped)); // Lưu nhóm bookings vào state
    };


    const columns = [
        {
            title: '#',
            key: 'index',
            render: (_: any, __: any, index: number) => index + 1,
        },
        {
            title: 'Ngày đặt',
            dataIndex: 'date',
            key: 'date'
        },
        {
            title: 'Sân số',
            dataIndex: 'field',
            key: 'field',
        },
        {
            title: 'Ca giờ',
            dataIndex: 'timeStart',
            key: 'timeStart',
        },
        {
            title: 'Giá tiền',
            dataIndex: 'price',
            key: 'price',
            render: (value: string) => `${value.toLocaleString()} VNĐ`,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => {
                const badge = statusMap[status];
                return <Tag color={badge.status}>
                    {badge.text}
                </Tag>
            },
        },
    ];

    const expandedRowRender = (record: any,) => {
        const confirmedBookings = record.status === 'Đã xác nhận' ? record.bookings.filter((booking: any) => booking.status === 'Đã xác nhận') : record.bookings;
        console.log("confirmedBookings", confirmedBookings);

        const expandedColumns = [
            {
                title: 'Người đặt',
                dataIndex: 'username',
                key: 'username',
            },
            {
                title: 'Số điện thoại',
                dataIndex: 'phoneNumber',
                key: 'phoneNumber',
            },
            {
                title: 'Phương thức thanh toán',
                dataIndex: 'payment_method',
                key: 'payment_method',
            },
            {
                title: 'Ngày đặt',
                dataIndex: 'createdAt',
                key: 'createdAt',
                render: (value: string) => new Date(value).toLocaleDateString('vi-VN', {
                    weekday: 'long',  // Thêm ngày trong tuần
                    year: 'numeric',
                    month: 'numeric',
                    day: 'numeric',
                    hour: '2-digit',  // Thêm giờ
                    minute: '2-digit' // Thêm phút
                }),
            },
            {
                title: "Trạng thái",
                key: "action",
                render: (item: any) => (
                    <Space>
                        {
                            record.status === "Đã xác nhận" ?
                                <Tag color={'green'}>
                                    Đã Duyệt
                                </Tag>
                                :
                                <>
                                    <Button
                                        type="primary"
                                        icon={<CheckCircleOutlined />}
                                        onClick={() => handleApprove(item, record)}
                                        loading={loading}
                                        style={{ marginRight: 8 }}
                                    >
                                        Duyệt
                                    </Button>
                                    {/* <Button
                                        type="dashed"
                                        icon={<CloseCircleOutlined />}
                                        // onClick={() => handleReject(record.key)}
                                        loading={loading}
                                    >
                                        Từ chối
                                    </Button> */}
                                </>
                        }
                    </Space>
                ),
            },

        ];

        return <Table columns={expandedColumns} dataSource={confirmedBookings} bordered pagination={false} />;
    };

    useEffect(() => {
        const getData = async () => {
            await dispath(getListBookingsSlice());
        };
        getData();
    }, []);

    useEffect(() => {
        groupBookings();
    }, [bookings]);
    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <div className="bg-white p-6 rounded-lg shadow">
                <h1 className="text-xl font-semibold mb-4">Quản lý yêu cầu đặt sân</h1>
                <div className="flex justify-between mb-4 ">
                    <div className='mt-auto text-[#1677FF]'>
                        Bạn có <strong>{bookings.filter((e: Booking) => e.status === "Chờ xác nhận").length}</strong> yêu cầu mới đang chờ được xác nhận!
                    </div>
                    <Input
                        placeholder="Tìm kiếm..."
                        onChange={(e) => setSearchText(e.target.value)}
                        className="w-64"
                    />
                </div>
                <Table
                    className="border border-gray-200"
                    columns={columns}
                    dataSource={groupedBookings
                        .map((item: any, index: number) => ({
                            ...item,
                            key: (index + 1).toString(), // 🛠 Tạo key tự động từ index
                        })) || []
                    }
                    pagination={{ pageSize: 5 }}
                    expandable={{
                        expandedRowRender,
                    }}
                />
            </div>
        </div>
    );
};

export default BookingTable;
