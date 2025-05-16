'use client';
import { useEffect, useState } from 'react';
import { Typography, Button, Card, Divider, Tag, Row, Col, Skeleton } from 'antd';
import { ArrowLeftOutlined, CheckCircleOutlined, EnvironmentOutlined, ClockCircleOutlined, DollarOutlined, CreditCardOutlined, UserOutlined, MailOutlined, PhoneOutlined, TeamOutlined, CloseCircleOutlined, ExclamationCircleOutlined, AppstoreOutlined, SearchOutlined, PlusCircleOutlined, CalendarOutlined } from '@ant-design/icons';
import { useParams, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hook';
import { updateNotificationSlice } from '@/features/notification.slice';
import { Notification } from '@/models/notification';
import Image from 'next/image';
import moment from 'moment';

const { Title, Text } = Typography;

const NotificationDetailPage = () => {
    const [loading, setLoading] = useState(false); // Đặt false để hiển thị ngay lập tức
    const [notification, setNotification] = useState<any>(); // Sử dụng dữ liệu giả ngay từ đầu
    const notifications = useAppSelector(state => state.notification.value)

    const router = useRouter();
    const dispatch = useAppDispatch();
    const { id } = useParams();

    const goBack = () => {
        router.back();
    };

    useEffect(() => {
        const data = notifications.filter((e: any) => e._id === id)[0] as Notification;
        if (!data.read) {
            const newdata = {
                ...data,
                read: true
            }
            const update = async () => {
                await dispatch(updateNotificationSlice(newdata))
            }
            update();
        }
        setNotification(data);
        setLoading(false);
    }, [id]);

    if (loading) {
        return (
            <div className="w-full pb-6">
                <Button
                    type="link"
                    icon={<ArrowLeftOutlined />}
                    onClick={goBack}
                    className="text-blue-600 mb-4 px-0"
                >
                    Quay lại
                </Button>
                <Card>
                    <Skeleton active paragraph={{ rows: 10 }} />
                </Card>
            </div>
        );
    }

    return (
        <div className="w-full pb-6">
            <Button
                type="link"
                icon={<ArrowLeftOutlined />}
                onClick={goBack}
                className="text-blue-600 mb-4 px-0"
            >
                Quay lại
            </Button>

            {notification && (
                <Card className="shadow-sm">
                    <div className="flex items-center mb-4">
                        {notification.notificationType === 'field_booking_failed' ? (
                            <CloseCircleOutlined className="text-2xl text-red-500" />
                        ) : notification.notificationType === 'posted_opponent' ? (
                            <SearchOutlined className="text-2xl text-orange-500" />
                        ) : notification.notificationType === 'field_booked' ? (
                            <CheckCircleOutlined className="text-2xl text-green-500" />
                        ) : notification.notificationType === 'opponent_found' ? (
                            <TeamOutlined className="text-2xl text-purple-500" />
                        ) : notification.notificationType === 'field_created' ? (
                            <PlusCircleOutlined className="text-2xl text-cyan-500" />
                        ) : (
                            <CheckCircleOutlined className="text-2xl text-blue-500" />
                        )}
                        <Title level={4} className="m-0 ml-3">
                            {notification.title || 'Chi tiết thông báo'}
                        </Title>
                    </div>

                    <div className={`p-4 rounded-lg mb-6 ${notification.notificationType === 'field_booking_failed' ? 'bg-red-50' :
                            notification.notificationType === 'posted_opponent' ? 'bg-orange-50' :
                                notification.notificationType === 'field_booked' ? 'bg-green-50' :
                                    notification.notificationType === 'opponent_found' ? 'bg-purple-50' :
                                        notification.notificationType === 'field_created' ? 'bg-cyan-50' :
                                            'bg-blue-50'
                        }`}>
                        <Text className={
                            notification.notificationType === 'field_booking_failed' ? 'text-red-800' :
                                notification.notificationType === 'posted_opponent' ? 'text-orange-800' :
                                    notification.notificationType === 'field_booked' ? 'text-green-800' :
                                        notification.notificationType === 'opponent_found' ? 'text-purple-800' :
                                            notification.notificationType === 'field_created' ? 'text-cyan-800' :
                                                'text-blue-800'
                        }>
                            {notification.content}
                        </Text>
                    </div>

                    {(notification.notificationType === 'field_booked' || notification.notificationType === 'new_order' || notification.notificationType === 'field_booking_failed') && notification.bookingId && (
                        <>
                            <Title level={5} className="mt-6 mb-3">Thông tin đặt sân</Title>

                            <Row gutter={[16, 12]}>
                                <Col span={24}>
                                    <div className="flex">
                                        <Text strong className="w-32">Tên sân:</Text>
                                        <Text>{notification.footballfield?.name}</Text>
                                    </div>
                                </Col>

                                <Col span={24}>
                                    <div className="flex">
                                        <EnvironmentOutlined className="mr-2 text-gray-500" />
                                        <Text strong className="w-28">Địa chỉ:</Text>
                                        <Text>{notification.bookingId.address}</Text>
                                    </div>
                                </Col>

                                <Col span={12}>
                                    <div className="flex">
                                        <AppstoreOutlined className="mr-2 text-gray-500" />
                                        <Text strong className="w-24">Số sân:</Text>
                                        <Tag color="blue">{notification.bookingId.field}</Tag>
                                    </div>
                                </Col>

                                <Col span={12}>
                                    <div className="flex">
                                        <ClockCircleOutlined className="mr-2 text-gray-500" />
                                        <Text strong className="w-20">Thời gian:</Text>
                                        <Text>{notification.bookingId.timeStart}</Text>
                                    </div>
                                </Col>

                                <Col span={12}>
                                    <div className="flex">
                                        <DollarOutlined className="mr-2 text-gray-500" />
                                        <Text strong className="w-20">Giá:</Text>
                                        <Text className="text-red-600 font-medium">
                                            {notification.bookingId.price?.toLocaleString()} VND
                                        </Text>
                                    </div>
                                </Col>

                                <Col span={12}>
                                    <div className="flex">
                                        <CreditCardOutlined className="mr-2 text-gray-500" />
                                        <Text strong className="w-20">Thanh toán:</Text>
                                        <Text>{notification.bookingId.payment_method}</Text>
                                    </div>
                                </Col>

                                {notification.notificationType === 'field_booking_failed' && (
                                    <Col span={24}>
                                        <div className="flex mt-2">
                                            <Text strong className="w-32 text-red-500">Lý do từ chối:</Text>
                                            <Text className="text-red-500">{notification.bookingId.reason}</Text>
                                        </div>
                                    </Col>
                                )}
                            </Row>

                            <Divider />

                            <Title level={5} className="mt-4 mb-3">Thông tin người đặt</Title>

                            <Row gutter={[16, 12]}>
                                <Col span={24}>
                                    <div className="flex">
                                        <UserOutlined className="mr-2 text-gray-500" />
                                        <Text strong className="w-32">Người đặt:</Text>
                                        <Text>{notification.bookingId.username}</Text>
                                    </div>
                                </Col>

                                <Col span={24}>
                                    <div className="flex">
                                        <MailOutlined className="mr-2 text-gray-500" />
                                        <Text strong className="w-32">Email:</Text>
                                        <Text>{notification.bookingId.email}</Text>
                                    </div>
                                </Col>

                                <Col span={24}>
                                    <div className="flex">
                                        <PhoneOutlined className="mr-2 text-gray-500" />
                                        <Text strong className="w-32">Số điện thoại:</Text>
                                        <Text>{notification.bookingId.phoneNumber}</Text>
                                    </div>
                                </Col>
                            </Row>
                        </>
                    )}
                    {notification.notificationType === 'posted_opponent' && notification.footballfield && (
                        <>
                            <Title level={5} className="mt-6 mb-3">Thông tin đăng tìm đối</Title>

                            {/* Thông tin đội bóng */}
                            <div className="bg-white p-4 shadow-md rounded-xl mb-4">
                                <div className="grid grid-cols-3 items-center mb-2">
                                    {/* Đội nhà */}
                                    {notification.club_A && (
                                        <div>
                                            <div className="flex items-center space-x-3">
                                                <div className="relative w-16 h-16">
                                                    <Image
                                                        src={notification.club_A?.teamImage || "/images/default-team.png"}
                                                        className="rounded-full object-cover"
                                                        layout="fill"
                                                        alt="team"
                                                        unoptimized={true}
                                                    />
                                                </div>
                                                <div className="font-semibold text-sm">{notification.club_A?.teamName}</div>
                                            </div>
                                            <div className='flex items-center space-x-3 text-sm mt-2 text-orange-500'>
                                                <span className="border border-orange-400 rounded-full px-2 py-0.5 text-xs">{notification.club_A?.ageGroup}</span>
                                                <span>⚡ 99</span>
                                                <span>⭐ ?</span>
                                                <span>👍 100</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* VS */}
                                    <div className="text-center text-3xl font-bold">VS</div>

                                    {/* Đội khách nếu có */}
                                    {notification.club_B ? (
                                        <div>
                                            <div className="flex items-center justify-end space-x-3">
                                                <div className="font-semibold text-sm">{notification.club_B?.teamName}</div>
                                                <div className="relative w-16 h-16">
                                                    <Image
                                                        src={notification.club_B?.teamImage || "/images/default-team.png"}
                                                        className="rounded-full object-cover"
                                                        layout="fill"
                                                        alt="opponent"
                                                        unoptimized={true}
                                                    />
                                                </div>
                                            </div>
                                            <div className='flex items-center justify-end space-x-3 text-sm mt-2 text-orange-500'>
                                                <span className="border border-orange-400 rounded-full px-2 py-0.5 text-xs">{notification.club_B?.ageGroup}</span>
                                                <span>⚡ 99</span>
                                                <span>⭐ ?</span>
                                                <span>👍 100</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-end text-right">
                                            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-lg text-gray-500">
                                                ?
                                            </div>
                                            <div className="text-xs text-gray-400 mt-1">Chưa có đối thủ</div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <Row gutter={[16, 12]}>
                                <Col span={24}>
                                    <div className="flex">
                                        <Text strong className="w-32">Tên sân:</Text>
                                        <Text>{notification.footballfield?.name}</Text>
                                    </div>
                                </Col>

                                <Col span={24}>
                                    <div className="flex">
                                        <EnvironmentOutlined className="mr-2 text-gray-500" />
                                        <Text strong className="w-28">Địa chỉ:</Text>
                                        <Text>
                                            {notification.footballfield?.address?.detail || ''}
                                            {notification.footballfield?.address?.ward ? `${notification.footballfield.address.detail ? ', ' : ''}${notification.footballfield.address.ward}` : ''}
                                            {notification.footballfield?.address?.district ? `${notification.footballfield.address.ward || notification.footballfield.address.detail ? ', ' : ''}${notification.footballfield.address.district}` : ''}
                                            {notification.footballfield?.address?.province ? `${notification.footballfield.address.district || notification.footballfield.address.ward || notification.footballfield.address.detail ? ', ' : ''}${notification.footballfield.address.province}` : ''}
                                        </Text>
                                    </div>
                                </Col>

                                {notification.match && (
                                    <>
                                        <Col span={12}>
                                            <div className="flex">
                                                <CalendarOutlined className="mr-2 text-gray-500" />
                                                <Text strong className="w-24">Ngày:</Text>
                                                <Text>{moment(notification.match.date).format('DD/MM/YYYY')}</Text>
                                            </div>
                                        </Col>

                                        <Col span={12}>
                                            <div className="flex">
                                                <ClockCircleOutlined className="mr-2 text-gray-500" />
                                                <Text strong className="w-24">Giờ:</Text>
                                                <Text>{notification.match.time}</Text>
                                            </div>
                                        </Col>

                                        {notification.match.duration && (
                                            <Col span={12}>
                                                <div className="flex">
                                                    <ClockCircleOutlined className="mr-2 text-gray-500" />
                                                    <Text strong className="w-24">Thời lượng:</Text>
                                                    <Text>{notification.match.duration} phút</Text>
                                                </div>
                                            </Col>
                                        )}

                                        {notification.match.contact && (
                                            <Col span={24}>
                                                <div className="flex">
                                                    <PhoneOutlined className="mr-2 text-gray-500" />
                                                    <Text strong className="w-24">Liên hệ:</Text>
                                                    <Text>{notification.match.contact}</Text>
                                                </div>
                                            </Col>
                                        )}
                                    </>
                                )}
                            </Row>

                            {/* Thêm nút liên hệ nếu có đối thủ */}
                            {notification.club_B && (
                                <div className="mt-6 flex justify-center">
                                    <Button
                                        type="primary"
                                        className="bg-orange-500"
                                        icon={<PhoneOutlined />}
                                        onClick={() => window.open(`tel:${notification.match?.contact || ''}`)}
                                    >
                                        Liên hệ ngay
                                    </Button>
                                </div>
                            )}
                        </>
                    )}

                    {notification.notificationType === 'opponent_found' && (
                        <>
                            {/* Thông tin đội bóng */}
                            <div className="bg-white p-4 shadow-md rounded-xl mb-4">
                                <div className="grid grid-cols-3 items-center mb-2">
                                    {/* Đội nhà */}
                                    {notification.club_A && (
                                        <div>
                                            <div className="flex items-center space-x-3">
                                                <div className="relative w-16 h-16">
                                                    <Image
                                                        src={notification.club_A?.teamImage || "/images/default-team.png"}
                                                        className="rounded-full object-cover"
                                                        layout="fill"
                                                        alt="team"
                                                        unoptimized={true}
                                                    />
                                                </div>
                                                <div className="font-semibold text-sm">{notification.club_A?.teamName}</div>
                                            </div>
                                            <div className='flex items-center space-x-3 text-sm mt-2 text-orange-500'>
                                                <span className="border border-orange-400 rounded-full px-2 py-0.5 text-xs">{notification.club_A?.ageGroup}</span>
                                                <span>⚡ 99</span>
                                                <span>⭐ ?</span>
                                                <span>👍 100</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* VS */}
                                    <div className="text-center text-3xl font-bold">VS</div>

                                    {/* Đội khách nếu có */}
                                    {notification.club_B ? (
                                        <div>
                                            <div className="flex items-center justify-end space-x-3">
                                                <div className="font-semibold text-sm">{notification.club_B?.teamName}</div>
                                                <div className="relative w-16 h-16">
                                                    <Image
                                                        src={notification.club_B?.teamImage || "/images/default-team.png"}
                                                        className="rounded-full object-cover"
                                                        layout="fill"
                                                        alt="opponent"
                                                        unoptimized={true}
                                                    />
                                                </div>
                                            </div>
                                            <div className='flex items-center justify-end space-x-3 text-sm mt-2 text-orange-500'>
                                                <span className="border border-orange-400 rounded-full px-2 py-0.5 text-xs">{notification.club_B?.ageGroup}</span>
                                                <span>⚡ 99</span>
                                                <span>⭐ ?</span>
                                                <span>👍 100</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-end text-right">
                                            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-lg text-gray-500">
                                                ?
                                            </div>
                                            <div className="text-xs text-gray-400 mt-1">Chưa có đối thủ</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {notification.notificationType === 'field_created' && notification.footballfield && (
                        <>
                            <Title level={5} className="mt-6 mb-3">Thông tin sân bóng</Title>

                            <Row gutter={[16, 12]}>
                                <Col span={24}>
                                    <div className="flex">
                                        <Text strong className="w-32">Tên sân:</Text>
                                        <Text>{notification.footballfield.name}</Text>
                                    </div>
                                </Col>

                                <Col span={24}>
                                    <div className="flex">
                                        <EnvironmentOutlined className="mr-2 text-gray-500" />
                                        <Text strong className="w-28">Địa chỉ:</Text>
                                        <Text>{notification.footballfield.address}</Text>
                                    </div>
                                </Col>

                                <Col span={12}>
                                    <div className="flex">
                                        <Text strong className="w-24">Trạng thái:</Text>
                                        <Tag color="orange">{notification.footballfield.status}</Tag>
                                    </div>
                                </Col>
                            </Row>
                        </>
                    )}

                    <div className={`p-4 rounded-lg text-center mt-6 ${notification.notificationType === 'field_booking_failed' ? 'bg-red-50' :
                            notification.notificationType === 'posted_opponent' ? 'bg-orange-50' :
                                notification.notificationType === 'field_booked' ? 'bg-green-50' :
                                    notification.notificationType === 'opponent_found' ? ' bg-purple-50' :
                                        notification.notificationType === 'field_created' ? ' bg-cyan-50' :
                                            'text-blue-800'
                        }`}>
                        <Text className={
                            notification.notificationType === 'field_booking_failed' ? 'text-red-800 ' :
                                notification.notificationType === 'posted_opponent' ? 'text-orange-800' :
                                    notification.notificationType === 'field_booked' ? 'text-green-800 ' :
                                        notification.notificationType === 'opponent_found' ? 'text-purple-800 ' :
                                            notification.notificationType === 'field_created' ? 'text-cyan-800 ' :
                                                'text-blue-800'
                        }>
                            {notification.notificationType === 'field_booking_failed'
                                ? 'Vui lòng liên hệ với chúng tôi nếu bạn cần hỗ trợ thêm.'
                                : 'Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.'}

                        </Text>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default NotificationDetailPage;
