'use client';
import { useEffect, useState } from 'react';
import { Typography, Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { getNotificationsById, updateNotification } from '@/api/notification';
import { Notification } from '@/models/notification';
import { useAppDispatch } from '@/store/hook';
import { updateNotificationSlice } from '@/features/notification.slice';
import { useParams, useRouter } from 'next/navigation';

const { Title, Text } = Typography;

interface DataProps {
    data: Notification
}

// const fakeNotification = {
//     id: 1,
//     title: 'Đặt sân bóng thành công!', // Tiêu đề thông báo
//     time: '5 phút trước',
//     status: 'unread',
//     // Nội dung tổng quan thông báo
//     content: 'Chúc mừng bạn đã đặt sân thành công! Dưới đây là thông tin về đặt sân',
//     // Thông tin chi tiết đặt sân
//     details: {
//         fieldName: 'Sân bóng Cộng Hòa',
//         address: '123 Đường Cộng Hòa, Quận Tân Bình, TP.HCM',
//         fieldNumber: 'Sân 1',
//         bookingTime: '2025-03-20 08:00 - 10:00',
//         price: 500000,
//         paymentMethod: 'Chuyển khoản ngân hàng',
//         username: 'Long Vu',
//         phoneNumber: '0378923745',
//         email: 'longvu@example.com',
//     },
//     // Phần nội dung bên dưới thông báo
//     closingMessage: 'Bạn có thể đến sân đúng giờ để trải nghiệm! Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.',
// };

const NotificationDetailPage = () => {
    const [data, setData] = useState<Notification>();
    // const user = useAppSelector((state) => state.auth.value.user)
    const router = useRouter();
    const dispatch = useAppDispatch();
    // Giả sử lấy thông báo dựa trên id từ dữ liệu fakeNotification
    // const notification = fakeNotification;
    const { id } = useParams();
    // Quay lại trang trước
    const goBack = () => {
        router.back(); // Quay lại trang trước
    };
    console.log("data",data);
    
    useEffect(() => {

        const update = async () => {
            const data = await getNotificationsById(id as string);
            setData(data.data)
            if (data) {
                const newdata = {
                    ...data.data,
                    read: true
                }
                await dispatch(updateNotificationSlice(newdata))

            }
        }
        update();
    }, [id])

    return (
        <div className="">
            {/* Dấu mũi tên quay lại */}
            <Button
                type="link"
                icon={<ArrowLeftOutlined />}
                onClick={goBack}
                className="text-blue-600 mb-2 mx-0 px-0"
            >
                Quay lại
            </Button>

            {data &&
                <>
                    {/* Tiêu đề thông báo */}
                    <h1 className="text-2xl font-semibold mb-4">{data.title || 'Chi tiết thông báo'}</h1>
                    {/* Nội dung thông báo */}
                    <div className="text-sm text-gray-700 p-4">
                        <p className='text-lg font-semibold'>{data.content} </p>
                        <br />
                        <Text strong>Tên sân: </Text>{data.footballfield?.name}
                        <br />
                        <Text strong>Địa chỉ: </Text>{data.bookingId?.address}
                        <br />
                        <Text strong>Số sân: </Text>{data.bookingId.field}
                        <br />
                        <Text strong>Thời gian đặt: </Text>{data.bookingId.timeStart}
                        <br />
                        <Text strong>Giá: </Text>{data.bookingId.price} VND
                        <br />
                        <Text strong>Phương thức thanh toán: </Text>{data.bookingId.payment_method}
                        <br />
                        <Text strong>Người đặt: </Text>{data.bookingId.username}
                        <br />
                        <Text strong>Email: </Text>{data.bookingId.email}
                        <br />
                        <Text strong>Số điện thoại: </Text>{data.bookingId.phoneNumber}
                        <br />
                        <br />

                        {/* Phần nội dung kết thúc thông báo */}
                        <Text strong>Bạn có thể đến sân đúng giờ để trải nghiệm! Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.</Text>
                    </div>
                </>}
        </div>
    );
};

export default NotificationDetailPage;
