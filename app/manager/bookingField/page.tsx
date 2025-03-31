'use client';

import React, { useEffect, useState } from 'react';
import { Table, Badge, Input, Space, Popconfirm, Button } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { useAppDispatch, useAppSelector } from '@/store/hook';
import { getListBookingsSlice, removeBookingSlice } from '@/features/booking.slice';
import { Booking } from '@/models/booking';

const statusMap: Record<string, { text: string; status: 'processing' | 'success' | 'error' | 'warning' }> = {
    'Chờ xác nhận': { text: 'Chờ xác nhận', status: 'processing' },
    'Đã xác nhận': { text: 'Đã xác nhận', status: 'success' },
    'Đã huỷ': { text: 'Đã huỷ', status: 'error' },
    'Thất bại': { text: 'Thất bại', status: 'warning' },
};



// const data = [
//     {
//         key: '1',
//         customerName: 'Nguyễn Văn A',
//         bookingDate: '2025-03-29T10:30:00Z',
//         fieldNumber: 1,
//         timeSlot: '8:00 - 9:30',
//         price: 150000,
//         paymentMethod: 'Tiền mặt',
//         phone: '0912345678',
//         status: 'pending',
//     },
//     {
//         key: '2',
//         customerName: 'Trần Thị B',
//         bookingDate: '2025-03-28T14:15:00Z',
//         fieldNumber: 3,
//         timeSlot: '10:00 - 11:30',
//         price: 200000,
//         paymentMethod: 'Chuyển khoản',
//         phone: '0987654321',
//         status: 'confirmed',
//     },
//     {
//         key: '3',
//         customerName: 'Lê Văn C',
//         bookingDate: '2025-03-27T18:00:00Z',
//         fieldNumber: 2,
//         timeSlot: '18:00 - 19:30',
//         price: 250000,
//         paymentMethod: 'Momo',
//         phone: '0909123456',
//         status: 'cancelled',
//     },
// ];

const BookingTable = () => {
    const bookings = useAppSelector((state) => state.booking.value)
    const [searchText, setSearchText] = useState("");
    const dispath = useAppDispatch();

    const handleDelete = async (id: string) => {
        const data = await dispath(removeBookingSlice(id))
        toast.success("Xóa thành công!");
    };
    console.log("bookings", bookings);

    const columns = [
        {
            title: '#',
            key: 'index',
            render: (_: any, __: any, index: number) => index + 1,
        },
        {
            title: 'Người đặt',
            dataIndex: 'username',
            key: 'username',
        },
        {
            title: 'Ngày đặt',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (value: string) => new Date(value).toLocaleDateString('vi-VN'),
        },
        {
            title: 'Sân số',
            dataIndex: 'fieldName',
            key: 'fieldName',
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
            render: (value: number) => `${value.toLocaleString()} VNĐ`,
        },
        {
            title: 'Phương thức thanh toán',
            dataIndex: 'payment_method',
            key: 'payment_method',
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phoneNumber',
            key: 'phoneNumber',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => {
                const badge = statusMap[status];
                return <Badge status={badge.status} text={badge.text} />;
            },
        },
        {
            title: "Hành động",
            key: "action",
            render: (_: string, record: any) => (
                <Space>
                    <Link href={`/manager/bookingField/${record._id}`}> <Button type="primary" icon={<EditOutlined />} /></Link>
                    <Popconfirm
                        title="Bạn có chắc muốn xóa?"
                        description="Hành động này không thể hoàn tác."
                        onConfirm={() => handleDelete(record._id)}
                        okText="Xác nhận"
                        cancelText="Hủy"
                    >
                        <Button type="primary" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    useEffect(() => {
        const getData = async () => {
            const data = await dispath(getListBookingsSlice())
        }
        getData();
    }, [])

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <div className="bg-white p-6 rounded-lg shadow">
                <h1 className="text-xl font-semibold mb-4">Quản lý yêu cầu đặt sân</h1>
                <div className="flex justify-between mb-4 ">
                    <div className='mt-auto text-[#1677FF]'>
                        Bạn có <strong>{bookings.filter((e:Booking) => e.status === "Chờ xác nhận").length}</strong> yêu cầu mới đang chờ được xác nhận !
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
                    dataSource={bookings}
                    pagination={{ pageSize: 5 }}
                />
            </div>
        </div>
    );
};

export default BookingTable;
