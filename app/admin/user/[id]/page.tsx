'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Select, Button, message, Spin, Form, Input } from 'antd';
import axios from 'axios';
import { useAppDispatch, useAppSelector } from '@/store/hook';
import { getListBookingByIdSlice, updateBookingSlice } from '@/features/booking.slice';
import { Booking } from '@/models/booking';
import { toast } from 'react-toastify';
import { IUser } from '@/models/auth';
import { updateUserSlice } from '@/features/user.slice';

const { Option } = Select;

const roleOptions = [
    { value: 0, label: 'User' },
    { value: 1, label: 'Manager' },
    { value: 2, label: 'Admin' },
];

const roleMap: Record<number, string> = {
    0: 'User',
    1: 'Manager',
    2: 'Admin',
};

const statusMap: Record<number, string> = {
    0: 'Chưa xác nhận',
    1: 'Vô hiệu hóa',
};

// Các lựa chọn cho trạng thái
const statusOptions = [
    { value: 0, label: 'Đang hoạt động' },
    { value: 1, label: 'Vô hiệu hóa' },
];

const EditUserPage = () => {
    const users = useAppSelector((state) => state.user.value)
    const { id } = useParams();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const [form] = Form.useForm();
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);



    const user = users.filter((item: IUser) => item._id === id)[0] as IUser
    useEffect(() => {
        const fetchBooking = async () => {
            user && setLoading(false);
        };
        fetchBooking();
    }, [id]);


    const handleSubmit = async (values: IUser) => {
        console.log("values", values);

        setUpdating(true);
        // try {
        await dispatch(updateUserSlice({ _id: id, status: values.status, role: values.role })).unwrap();
        toast.success('Cập nhật thành công!');
        setUpdating(false);
        router.push('/admin/user');
    };

    if (loading) return <Spin fullscreen />;

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <Form form={form} initialValues={user} layout="vertical" onFinish={handleSubmit} className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-6">Cập nhật người dùng</h2>

                <Form.Item
                    name="name"
                    label="Tên người dùng"
                    rules={[{ required: true, message: "Vui lòng nhập tên sân!" }]}
                >
                    <Input placeholder="Nhập tên sân..." disabled />
                </Form.Item>

                <Form.Item
                    name="email"
                    label="Email"
                    rules={[{ required: true, message: "Vui lòng nhập tên sân!" }]}
                >
                    <Input placeholder="Nhập tên sân..." disabled />
                </Form.Item>

                <Form.Item
                    name="status"
                    label="Trạng thái"
                    rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
                >
                    <Select
                        placeholder="Chọn trạng thái mới"
                        onChange={setStatus}
                        defaultValue={user ? statusMap[user.status] : 'Chưa xác nhận'} // Hiển thị trạng thái mặc định
                    >
                        {statusOptions.map((item) => (
                            <Option key={item.value} value={item.value}>
                                {item.label}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    name="role"
                    label="Vai trò"
                    rules={[{ required: true, message: "Vui lòng chọn tình trạng!" }]}
                >
                    <Select
                        placeholder="Chọn trạng thái mới"
                        onChange={setStatus}
                        defaultValue={user ? roleMap[user.role] : 'User'}
                    >
                        {roleOptions.map((item) => (
                            <Option key={item.value} value={item.value}>
                                {item.label}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>
                <Button
                    type="primary"
                    htmlType="submit"
                    loading={updating}
                    className='w-50'
                >
                    Cập nhật
                </Button>
            </Form>
        </div>
    );
};

export default EditUserPage;
