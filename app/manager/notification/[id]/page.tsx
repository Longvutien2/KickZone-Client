'use client';
import { useEffect, useState } from 'react';
import { Typography, Button, Card, Divider, Tag, Space, Avatar } from 'antd';
import { ArrowLeftOutlined, CheckCircleOutlined, CloseCircleOutlined, TeamOutlined, SearchOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { getNotificationsById } from '@/api/notification';
import { Notification } from '@/models/notification';
import { useAppDispatch } from '@/store/hook';
import { updateNotificationSlice } from '@/features/notification.slice';
import { useParams, useRouter } from 'next/navigation';
import moment from 'moment';

const { Title, Text, Paragraph } = Typography;

const NotificationDetailManager = () => {
    const [data, setData] = useState<Notification>();
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { id } = useParams();

    // Quay lại trang trước
    const goBack = () => {
        router.back();
    };

    // Lấy icon phù hợp với loại thông báo
    const getNotificationIcon = (item: Notification) => {
        // Dựa vào notificationType để xác định icon phù hợp
        if (item.notificationType === 'field_booked' || item.notificationType === 'new_order') {
            return <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '24px' }} />;
        } else if (item.notificationType === 'field_booking_failed') {
            return <CloseCircleOutlined style={{ color: '#f5222d', fontSize: '24px' }} />;
        } else if (item.notificationType === 'opponent_found') {
            return <TeamOutlined style={{ color: '#722ed1', fontSize: '24px' }} />;
        } else if (item.notificationType === 'posted_opponent') {
            return <SearchOutlined style={{ color: '#fa8c16', fontSize: '24px' }} />;
        } else if (item.notificationType === 'field_created') {
            return <PlusCircleOutlined style={{ color: '#13c2c2', fontSize: '24px' }} />;
        } else {
            return <CheckCircleOutlined style={{ color: '#1890ff', fontSize: '24px' }} />;
        }
    };

    // Format thời gian
    const formatTime = (time: any) => {
        if (!time) return '';
        return moment(time).format('DD/MM/YYYY HH:mm');
    };

    useEffect(() => {
        const update = async () => {
            setLoading(true);
            try {
                const response = await getNotificationsById(id as string);
                setData(response.data);
                if (response.data && !response.data.read) {
                    const newdata = {
                        ...response.data,
                        read: true
                    };
                    await dispatch(updateNotificationSlice(newdata));
                }
            } catch (error) {
                console.error("Error fetching notification:", error);
            } finally {
                setLoading(false);
            }
        };
        update();
    }, [id, dispatch]);

    return (
        <div className="p-6 bg-gray-100 min-h-screen w-full">
            <Card loading={loading} className="shadow-md rounded-lg">
                <Button
                    type="link"
                    icon={<ArrowLeftOutlined />}
                    onClick={goBack}
                    className="text-blue-600 mb-4 mx-0 px-0"
                >
                    Quay lại danh sách thông báo
                </Button>

                {data && (
                    <div className="space-y-6">
                        <div className="flex items-center space-x-4">
                            <Avatar
                                size={64}
                                icon={getNotificationIcon(data)}
                                className="bg-blue-50"
                            />
                            <div>
                                <Title level={3} className="mb-1 ml-2">{data.title}</Title>
                            </div>
                        </div>

                        <Divider />

                        <div className="bg-gray-50 p-5 rounded-lg">
                            <Paragraph className="text-lg">{data.content}</Paragraph>
                        </div>

                        {data.orderId && (
                            <div className="mt-6">
                                <Title level={4} className="mb-4">Chi tiết đặt sân</Title>
                                <div className="bg-white p-5 rounded-lg border border-gray-200 space-y-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Text strong className="block text-gray-500">Tên sân:</Text>
                                            <Text className="text-lg">{data.footballfield?.name || "Không có thông tin"}</Text>
                                        </div>
                                        <div>
                                            <Text strong className="block text-gray-500">Địa chỉ:</Text>
                                            <Text className="text-lg">{data.footballfield?.address &&
                                                `${data.footballfield.address.detail ? `${data.footballfield.address.detail}, ` : ""}
                                             ${data.footballfield.address.ward}, ${data.footballfield.address.district},
                                              ${data.footballfield.address.province}` || "Không có thông tin"}</Text>
                                        </div>
                                        <div>
                                            <Text strong className="block text-gray-500">Số sân:</Text>
                                            <Text className="text-lg">{data.orderId?.fieldName || "Không có thông tin"}</Text>
                                        </div>
                                        <div>
                                            <Text strong className="block text-gray-500">Thời gian đặt:</Text>
                                            <Text className="text-lg">{data.orderId?.timeStart || "Không có thông tin"}</Text>
                                        </div>
                                        <div>
                                            <Text strong className="block text-gray-500">Giá:</Text>
                                            <Text className="text-lg">{data.orderId?.amount ? `${data.orderId.amount.toLocaleString()} VND` : "Không có thông tin"}</Text>
                                        </div>
                                        <div>
                                            <Text strong className="block text-gray-500">Phương thức thanh toán:</Text>
                                            <Text className="text-lg">{data.orderId?.payment_method || "QR"}</Text>
                                        </div>
                                    </div>

                                    <Divider />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Text strong className="block text-gray-500">Người đặt (Tên đội bóng):</Text>
                                            <Text className="text-lg">{data.orderId?.teamName || "Không có thông tin"}</Text>
                                        </div>
                                     
                                        <div>
                                            <Text strong className="block text-gray-500">Số điện thoại:</Text>
                                            <Text className="text-lg">{data.orderId?.phoneNumber || "Không có thông tin"}</Text>
                                        </div>
                                        <div>
                                            <Text strong className="block text-gray-500">Ghi chú:</Text>
                                            <Text className="text-lg">{data.orderId?.description || "Không có thông tin"}</Text>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Card>
        </div>
    );
};

export default NotificationDetailManager;
