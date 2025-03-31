'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Select, Button, message, Spin } from 'antd';
import axios from 'axios';
import { useAppDispatch, useAppSelector } from '@/store/hook';
import { getListBookingByIdSlice, updateBookingSlice } from '@/features/booking.slice';
import { Booking } from '@/models/booking';
import { toast } from 'react-toastify';

const { Option } = Select;

const BookingUpdatePage = () => {
    const booking = useAppSelector((state) => state.booking.detail) as Booking
    const { id } = useParams();
    const router = useRouter();
    const dispatch = useAppDispatch();

    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    const statusOptions = [
        { value: 'pending', label: 'Chờ xác nhận' },
        { value: 'confirmed', label: 'Đã xác nhận' },
        { value: 'cancelled', label: 'Đã huỷ' },
        { value: 'failed', label: 'Thất bại' },
    ];
    console.log("booking", booking);

    useEffect(() => {
        const fetchBooking = async () => {
            const res = await dispatch(getListBookingByIdSlice(id as string));
            res.payload && setLoading(false);
        };
        fetchBooking();
    }, [id]);

    const handleSubmit = async () => {
        if (!status) return message.warning('Vui lòng chọn trạng thái mới');
        setUpdating(true);
        // try {
        await dispatch(updateBookingSlice({ _id: id, status })).unwrap();
        toast.success('Cập nhật thành công!');
        setUpdating(false);
        router.push('/manager/bookingField');
    };

    if (loading) return <Spin fullscreen />;

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-6">Cập nhật trạng thái yêu cầu</h2>

                {booking && (
                    <div className="space-y-2 mb-6 text-sm text-gray-700">
                        <div><strong>Người đặt:</strong> {booking.username}</div>
                        <div><strong>Ngày đặt:</strong> {booking.createdAt ? new Date(booking.createdAt).toLocaleDateString('vi-VN') : ""}</div>
                        <div><strong>Sân bóng:</strong> {booking.fieldName}</div>
                        <div><strong>Số sân:</strong> {booking.field}</div>
                        <div><strong>Ca giờ:</strong> {booking.timeStart}</div>
                        <div><strong>Giá tiền:</strong> {Number(booking.price).toLocaleString()} VNĐ</div>
                        <div><strong>Phương thức thanh toán:</strong> {booking.payment_method}</div>
                        <div><strong>Số điện thoại:</strong> {booking.phoneNumber}</div>
                    </div>
                )}


                <Select
                    className="w-50 mb-4"
                    placeholder="Chọn trạng thái mới"
                    onChange={setStatus}
                    defaultValue={booking.status}
                >
                    {statusOptions.map((item) => (
                        <Option key={item.value} value={item.label}>
                            {item.label}
                        </Option>
                    ))}
                </Select>
                <br />
                <Button
                    type="primary"
                    onClick={handleSubmit}
                    loading={updating}
                    className='w-50'
                >
                    Cập nhật
                </Button>
            </div>
        </div>
    );
};

export default BookingUpdatePage;
