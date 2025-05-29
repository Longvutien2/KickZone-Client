'use client';
import { useEffect, useState } from 'react';
import { Typography, Button, Card, Divider, Tag, Row, Col, Skeleton } from 'antd';
import {
    ArrowLeftOutlined,
    CheckCircleOutlined,
    EnvironmentOutlined,
    ClockCircleOutlined,
    DollarOutlined,
    CreditCardOutlined,
    UserOutlined,
    MailOutlined,
    PhoneOutlined,
    TeamOutlined,
    CloseCircleOutlined,
    ExclamationCircleOutlined,
    AppstoreOutlined,
    SearchOutlined,
    PlusCircleOutlined,
    CalendarOutlined,
    TrophyOutlined,
    FileTextOutlined,
    AimOutlined
} from '@ant-design/icons';
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
        <div className="w-full pb-4 sm:pb-6 px-4 sm:px-0">
            <Button
                type="link"
                icon={<ArrowLeftOutlined />}
                onClick={goBack}
                className="text-blue-600 mb-3 sm:mb-4 px-0 text-sm sm:text-base"
            >
                Quay lại
            </Button>

            {notification && (
                <Card className="shadow-sm rounded-lg sm:rounded-xl">
                    <div className="flex items-center mb-3 sm:mb-4">
                        {notification.notificationType === 'field_booking_failed' ? (
                            <CloseCircleOutlined className="text-xl sm:text-2xl text-red-500 flex-shrink-0" />
                        ) : notification.notificationType === 'posted_opponent' ? (
                            <SearchOutlined className="text-xl sm:text-2xl text-orange-500 flex-shrink-0" />
                        ) : notification.notificationType === 'field_booked' ? (
                            <CheckCircleOutlined className="text-xl sm:text-2xl text-green-500 flex-shrink-0" />
                        ) : notification.notificationType === 'opponent_found' ? (
                            <TeamOutlined className="text-xl sm:text-2xl text-purple-500 flex-shrink-0" />
                        ) : notification.notificationType === 'field_created' ? (
                            <PlusCircleOutlined className="text-xl sm:text-2xl text-cyan-500 flex-shrink-0" />
                        ) : (
                            <CheckCircleOutlined className="text-xl sm:text-2xl text-blue-500 flex-shrink-0" />
                        )}
                        <Title level={4} className="m-0 ml-2 sm:ml-3 text-base sm:text-lg leading-tight">
                            {notification.title || 'Chi tiết thông báo'}
                        </Title>
                    </div>

                    <div className={`p-3 sm:p-4 rounded-lg mb-4 sm:mb-6 ${notification.notificationType === 'field_booking_failed' ? 'bg-red-50' :
                        notification.notificationType === 'posted_opponent' ? 'bg-orange-50' :
                            notification.notificationType === 'field_booked' ? 'bg-green-50' :
                                notification.notificationType === 'opponent_found' ? 'bg-purple-50' :
                                    notification.notificationType === 'field_created' ? 'bg-cyan-50' :
                                        'bg-blue-50'
                        }`}>
                        <Text className={`text-sm sm:text-base leading-relaxed ${notification.notificationType === 'field_booking_failed' ? 'text-red-800' :
                            notification.notificationType === 'posted_opponent' ? 'text-orange-800' :
                                notification.notificationType === 'field_booked' ? 'text-green-800' :
                                    notification.notificationType === 'opponent_found' ? 'text-purple-800' :
                                        notification.notificationType === 'field_created' ? 'text-cyan-800' :
                                            'text-blue-800'
                            }`}>
                            {notification.content}
                        </Text>
                    </div>

                    {(notification.notificationType === 'field_booked' || notification.notificationType === 'new_order' || notification.notificationType === 'field_booking_failed') && notification.orderId && (
                        <>
                            <Title level={5} className="mt-4 sm:mt-6 mb-3 text-base sm:text-lg">Thông tin đặt sân</Title>

                            <div className="space-y-3 sm:space-y-4">
                                <div className="flex sm:flex-row sm:items-center gap-1 sm:gap-2">
                                    <div>
                                        <Text strong className="text-sm sm:text-base w-full sm:w-32 flex-shrink-0"> Tên sân:</Text>
                                    </div>
                                    <Text className="text-sm sm:text-base break-words">{notification.footballfield?.name}</Text>
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
                                    <div className="flex items-center">
                                        <EnvironmentOutlined className="mr-2 text-gray-500 flex-shrink-0" />
                                        <Text strong className="text-sm sm:text-base w-full sm:w-24 flex-shrink-0">Địa chỉ:</Text>
                                    </div>
                                    <Text className="text-sm sm:text-base break-words leading-relaxed">
                                        {notification.footballfield?.address?.detail || ''}
                                        {notification.footballfield?.address?.ward ? `${notification.footballfield.address.detail ? ', ' : ''}${notification.footballfield.address.ward}` : ''}
                                        {notification.footballfield?.address?.district ? `${notification.footballfield.address.ward || notification.footballfield.address.detail ? ', ' : ''}${notification.footballfield.address.district}` : ''}
                                        {notification.footballfield?.address?.province ? `${notification.footballfield.address.district || notification.footballfield.address.ward || notification.footballfield.address.detail ? ', ' : ''}${notification.footballfield.address.province}` : ''}
                                    </Text>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                    <div className="flex  sm:flex-row sm:items-center gap-1 sm:gap-2">
                                        <div className="flex items-center">
                                            <AppstoreOutlined className="mr-2 text-gray-500 flex-shrink-0" />
                                            <Text strong className="text-sm sm:text-base flex-shrink-0">Số sân:</Text>
                                        </div>
                                        <Tag color="blue" className="self-start sm:self-center"> {notification.orderId.fieldName}</Tag>
                                    </div>

                                    <div className="flex  sm:flex-row sm:items-center gap-1 sm:gap-2">
                                        <div className="flex items-center">
                                            <ClockCircleOutlined className="mr-2 text-gray-500 flex-shrink-0" />
                                            <Text strong className="text-sm sm:text-base flex-shrink-0">Thời gian:</Text>
                                        </div>
                                        <Text className="text-sm sm:text-base">{notification.orderId.timeStart}</Text>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                    <div className="flex  sm:flex-row sm:items-center gap-1 sm:gap-2">
                                        <div className="flex items-center">
                                            <DollarOutlined className="mr-2 text-gray-500 flex-shrink-0" />
                                            <Text strong className="text-sm sm:text-base flex-shrink-0">Giá:</Text>
                                        </div>
                                        <Text className="text-red-600 font-medium text-sm sm:text-base">
                                            {notification.orderId.amount?.toLocaleString()} VND
                                        </Text>
                                    </div>

                                    <div className="flex sm:flex-row sm:items-center gap-1 sm:gap-2">
                                        <div className="flex items-center">
                                            <CreditCardOutlined className="mr-2 text-gray-500 flex-shrink-0" />
                                            <Text strong className="text-sm sm:text-base flex-shrink-0">Thanh toán:</Text>
                                        </div>
                                        <Text className="text-sm sm:text-base">{notification.orderId.gateway}</Text>
                                    </div>
                                </div>

                                {notification.notificationType === 'field_booking_failed' && (
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-2">
                                        <Text strong className="text-red-500 text-sm sm:text-base w-full sm:w-32 flex-shrink-0">Lý do từ chối:</Text>
                                        <Text className="text-red-500 text-sm sm:text-base">Thanh toán không hợp lệ</Text>
                                    </div>
                                )}
                            </div>

                            <Divider />

                            <Title level={5} className="mt-4 mb-3 text-base sm:text-lg">Thông tin người đặt</Title>

                            <div className="space-y-3 sm:space-y-4">
                                <div className="flex sm:flex-row sm:items-center gap-1 sm:gap-2">
                                    <div className="flex items-center">
                                        <UserOutlined className="mr-2 text-gray-500 flex-shrink-0" />
                                        <Text strong className="text-sm sm:text-base w-full sm:w-32 flex-shrink-0">Tên đội:</Text>
                                    </div>
                                    <div>
                                        <Text className="text-sm sm:text-base break-words">{notification.orderId.teamName}</Text>
                                    </div>
                                </div>

                                <div className="flex sm:flex-row sm:items-center gap-1 sm:gap-2">
                                    <div className="flex items-center">
                                        <PhoneOutlined className="mr-2 text-gray-500 flex-shrink-0" />
                                        <Text strong className="text-sm sm:text-base w-full sm:w-32 flex-shrink-0">Số điện thoại:</Text>
                                    </div>
                                    <Text className="text-sm sm:text-base break-words">{notification.orderId.phoneNumber}</Text>
                                </div>
                            </div>
                        </>
                    )}
                    {notification.notificationType === 'posted_opponent' && notification.footballfield && (
                        <>
                            {/* Thông tin đội bóng */}
                            <div className="bg-white p-4 shadow-md rounded-xl mb-4">
                                {/* Mobile Layout */}
                                <div className="block sm:hidden">
                                    {/* Đội nhà */}
                                    {notification.club_A && (
                                        <div className="mb-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="relative w-16 h-16 flex-shrink-0">
                                                    <Image
                                                        src={notification.club_A?.teamImage || "/images/default-team.png"}
                                                        className="rounded-full object-cover"
                                                        layout="fill"
                                                        alt="team"
                                                        unoptimized={true}
                                                    />
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-base">{notification.club_A?.teamName}</div>
                                                    <div className='flex items-center flex-wrap gap-2 text-sm mt-1 text-orange-500'>
                                                        <span className="border border-orange-400 rounded-full px-2 py-0.5 text-xs">{notification.club_A?.ageGroup}</span>
                                                        <span>⚡ 99</span>
                                                        <span>⭐ {notification.club_A?.rating || "?"}</span>
                                                        <span>👍 {notification.club_A?.likes || "100"}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mt-3 text-xs text-gray-600 space-y-1">
                                                <p><PhoneOutlined className="mr-1" /> Liên hệ: {notification.club_A?.contact || "Chưa có SĐT"}</p>
                                                <p><TrophyOutlined className="mr-1" /> Trình độ: {notification.club_A?.level || "Trung bình yếu"}</p>
                                                <p><FileTextOutlined className="mr-1" /> Ghi chú: {notification.club_A?.description || "(Mô tả)"}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* VS */}
                                    <div className="text-center text-2xl font-bold my-4">VS</div>

                                    {/* Đội khách */}
                                    {notification.club_B ? (
                                        <div className="mb-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="relative w-16 h-16 flex-shrink-0">
                                                    <Image
                                                        src={notification.club_B?.teamImage || "/images/default-team.png"}
                                                        className="rounded-full object-cover"
                                                        layout="fill"
                                                        alt="opponent"
                                                        unoptimized={true}
                                                    />
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-base">{notification.club_B?.teamName}</div>
                                                    <div className='flex items-center flex-wrap gap-2 text-sm mt-1 text-orange-500'>
                                                        <span className="border border-orange-400 rounded-full px-2 py-0.5 text-xs">{notification.club_B?.ageGroup}</span>
                                                        <span>⚡ 99</span>
                                                        <span>⭐ {notification.club_B?.rating || "?"}</span>
                                                        <span>👍 {notification.club_B?.likes || "100"}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mt-3 text-xs text-gray-600 space-y-1">
                                                <p><PhoneOutlined className="mr-1" /> {notification.club_B?.contact || "Chưa có SĐT"}</p>
                                                <p><EnvironmentOutlined className="mr-1" /> {notification.club_B?.location || "Chưa có địa chỉ"}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center text-center">
                                            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-lg text-gray-500">
                                                ?
                                            </div>
                                            <div className="text-xs text-gray-400 mt-1">Chưa có đối thủ</div>
                                        </div>
                                    )}
                                </div>

                                {/* Desktop Layout */}
                                <div className="hidden sm:grid sm:grid-cols-3 gap-4 items-center">
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
                                                <span>⭐ {notification.club_A?.rating || "?"}</span>
                                                <span>👍 {notification.club_A?.likes || "100"}</span>
                                            </div>
                                            <div className="mt-2 text-xs text-gray-600">
                                                <p><PhoneOutlined className="mr-1" /> Liên hệ: {notification.club_A?.contact || "Chưa có SĐT"}</p>
                                                <p><TrophyOutlined className="mr-1" /> Trình độ: {notification.club_A?.level || "Trung bình yếu"}</p>
                                                <p><FileTextOutlined className="mr-1" /> Ghi chú: {notification.club_A?.description || "(Mô tả)"}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* VS */}
                                    <div className="text-center text-3xl font-bold">VS</div>

                                    {/* Đội khách */}
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
                                                <span>⭐ {notification.club_B?.rating || "?"}</span>
                                                <span>👍 {notification.club_B?.likes || "100"}</span>
                                            </div>
                                            <div className="mt-2 text-xs text-gray-600 text-right">
                                                <p><PhoneOutlined className="mr-1" /> {notification.club_B?.contact || "Chưa có SĐT"}</p>
                                                <p><EnvironmentOutlined className="mr-1" /> {notification.club_B?.location || "Chưa có địa chỉ"}</p>
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
                            <Card className="mb-4">
                                <Title level={5} className="mb-3">Thông tin trận đấu</Title>
                                <Row gutter={[16, 12]}>
                                    <Col span={24}>
                                        <div className="flex">
                                            <AimOutlined className="mr-2 text-gray-500" />
                                            <Text strong className="w-24">Tên sân:</Text>
                                            <Text>{notification.footballfield?.name}</Text>
                                        </div>
                                    </Col>

                                    <Col span={24}>
                                        <div className="flex">
                                            <div className='w-24'>
                                                <EnvironmentOutlined className="mr-2 text-gray-500" />
                                                <Text strong>Địa chỉ:</Text>
                                            </div>
                                            <div>
                                                <Text>
                                                    {notification.footballfield?.address?.detail || ''}
                                                    {notification.footballfield?.address?.ward ? `${notification.footballfield.address.detail ? ', ' : ''}${notification.footballfield.address.ward}` : ''}
                                                    {notification.footballfield?.address?.district ? `${notification.footballfield.address.ward || notification.footballfield.address.detail ? ', ' : ''}${notification.footballfield.address.district}` : ''}
                                                    {notification.footballfield?.address?.province ? `${notification.footballfield.address.district || notification.footballfield.address.ward || notification.footballfield.address.detail ? ', ' : ''}${notification.footballfield.address.province}` : ''}
                                                </Text>
                                            </div>
                                        </div>
                                    </Col>

                                    <Col span={24}>
                                        <div className="flex">
                                            <AppstoreOutlined className="mr-2 text-gray-500" />
                                            <Text strong className="w-24">Số sân:</Text>
                                            <Tag color="blue">{notification.orderId.fieldName}</Tag>
                                        </div>
                                    </Col>

                                    <Col span={24}>
                                        <div className="flex gap-1">
                                            <div>
                                                <CalendarOutlined className="mr-2 text-gray-500" />
                                                <Text strong className="w-24">Ngày Giờ: </Text>
                                            </div>
                                            <div className='ml-1'>
                                                <Text> {notification.orderId.timeStart} </Text>
                                                <span > / </span>
                                                <Text> {notification.orderId.date}</Text>
                                            </div>
                                        </div>
                                    </Col>

                                    {notification.match.contact && (
                                        <Col span={24}>
                                            <div className="flex">
                                                <PhoneOutlined className="mr-2 text-gray-500" />
                                                <Text strong className="w-24">Liên hệ:</Text>
                                                <Text>{notification.footballfield.phone}</Text>
                                            </div>
                                        </Col>
                                    )}
                                </Row>

                                {/* Nút liên hệ và xem chi tiết */}
                                <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-3 sm:gap-4">
                                    <Button
                                        className="bg-orange-500 w-full sm:w-auto"
                                        type="primary"
                                        icon={<CalendarOutlined />}
                                        onClick={() => router.push(`/homepage/profile/`)}
                                        size="large"
                                    >
                                        <span className="hidden sm:inline">Xem chi tiết lịch thi đấu</span>
                                        <span className="sm:hidden">Xem lịch thi đấu</span>
                                    </Button>
                                </div>
                            </Card>

                        </>
                    )}

                    {notification.notificationType === 'opponent_found' && (
                        <>
                            {/* Thông tin đội bóng */}
                            <div className="bg-white p-4 shadow-md rounded-xl mb-4">
                                {/* Mobile Layout */}
                                <div className="block sm:hidden">
                                    {/* Đội nhà */}
                                    {notification.club_A && (
                                        <div className="mb-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="relative w-16 h-16 flex-shrink-0">
                                                    <Image
                                                        src={notification.club_A?.teamImage || "/images/default-team.png"}
                                                        className="rounded-full object-cover"
                                                        layout="fill"
                                                        alt="team"
                                                        unoptimized={true}
                                                    />
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-base">{notification.club_A?.teamName}</div>
                                                    <div className='flex items-center flex-wrap gap-2 text-sm mt-1 text-orange-500'>
                                                        <span className="border border-orange-400 rounded-full px-2 py-0.5 text-xs">{notification.club_A?.ageGroup}</span>
                                                        <span>⚡ 99</span>
                                                        <span>⭐ {notification.club_A?.rating || "?"}</span>
                                                        <span>👍 {notification.club_A?.likes || "100"}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mt-3 text-xs text-gray-600 space-y-1">
                                                <p><PhoneOutlined className="mr-1" /> Liên hệ: {notification.club_A?.contact || "Chưa có SĐT"}</p>
                                                <p><TrophyOutlined className="mr-1" /> Trình độ: {notification.club_A?.level || "Trung bình yếu"}</p>
                                                <p><FileTextOutlined className="mr-1" /> Ghi chú: {notification.club_A?.description || "(Mô tả)"}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* VS */}
                                    <div className="text-center text-2xl font-bold my-4">VS</div>

                                    {/* Đội khách */}
                                    {notification.club_B ? (
                                        <div className="mb-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="relative w-16 h-16 flex-shrink-0">
                                                    <Image
                                                        src={notification.club_B?.teamImage || "/images/default-team.png"}
                                                        className="rounded-full object-cover"
                                                        layout="fill"
                                                        alt="opponent"
                                                        unoptimized={true}
                                                    />
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-base">{notification.club_B?.teamName}</div>
                                                    <div className='flex items-center flex-wrap gap-2 text-sm mt-1 text-orange-500'>
                                                        <span className="border border-orange-400 rounded-full px-2 py-0.5 text-xs">{notification.club_B?.ageGroup}</span>
                                                        <span>⚡ 99</span>
                                                        <span>⭐ {notification.club_B?.rating || "?"}</span>
                                                        <span>👍 {notification.club_B?.likes || "100"}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mt-3 text-xs text-gray-600 space-y-1">
                                                <p><PhoneOutlined className="mr-1" /> {notification.club_B?.contact || "Chưa có SĐT"}</p>
                                                <p><TrophyOutlined className="mr-1" /> Trình độ: {notification.club_B?.level || "Trung bình yếu"}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center text-center">
                                            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-lg text-gray-500">
                                                ?
                                            </div>
                                            <div className="text-xs text-gray-400 mt-1">Chưa có đối thủ</div>
                                        </div>
                                    )}
                                </div>

                                {/* Desktop Layout */}
                                <div className="hidden sm:grid sm:grid-cols-3 gap-4 items-center">
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
                                                <span>⭐ {notification.club_A?.rating || "?"}</span>
                                                <span>👍 {notification.club_A?.likes || "100"}</span>
                                            </div>
                                            <div className="mt-2 text-xs text-gray-600">
                                                <p><PhoneOutlined className="mr-1" /> Liên hệ: {notification.club_A?.contact || "Chưa có SĐT"}</p>
                                                <p><TrophyOutlined className="mr-1" /> Trình độ: {notification.club_A?.level || "Trung bình yếu"}</p>
                                                <p><FileTextOutlined className="mr-1" /> Ghi chú: {notification.club_A?.description || "(Mô tả)"}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* VS */}
                                    <div className="text-center text-3xl font-bold">VS</div>

                                    {/* Đội khách */}
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
                                                <span>⭐ {notification.club_B?.rating || "?"}</span>
                                                <span>👍 {notification.club_B?.likes || "100"}</span>
                                            </div>
                                            <div className="mt-2 text-xs text-gray-600 text-right">
                                                <p><PhoneOutlined className="mr-1" /> {notification.club_B?.contact || "Chưa có SĐT"}</p>
                                                <p><TrophyOutlined className="mr-1" /> Trình độ: {notification.club_B?.level || "Trung bình yếu"}</p>
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

                            {/* Thông tin sân bóng và lịch thi đấu */}
                            <Card className="mb-4">
                                <Title level={5} className="mb-3">Thông tin trận đấu</Title>

                                <Row gutter={[16, 12]}>
                                    <Col span={24}>
                                        <div className="flex">
                                            <AimOutlined className="mr-2 text-gray-500" />
                                            <Text strong className="w-24">Tên sân:</Text>
                                            <Text> {notification.footballfield?.name}</Text>
                                        </div>
                                    </Col>

                                    <Col span={24}>
                                        <div className="flex">
                                            <div>
                                                <EnvironmentOutlined className="mr-2 text-gray-500" />
                                                <Text strong className="w-24">Địa chỉ sân:</Text>
                                            </div>
                                            <div>
                                                <Text>
                                                    {notification.footballfield?.address?.detail || ''}
                                                    {notification.footballfield?.address?.ward ? `${notification.footballfield.address.detail ? ', ' : ''}${notification.footballfield.address.ward}` : ''}
                                                    {notification.footballfield?.address?.district ? `${notification.footballfield.address.ward || notification.footballfield.address.detail ? ', ' : ''}${notification.footballfield.address.district}` : ''}
                                                    {notification.footballfield?.address?.province ? `${notification.footballfield.address.district || notification.footballfield.address.ward || notification.footballfield.address.detail ? ', ' : ''}${notification.footballfield.address.province}` : ''}
                                                </Text>
                                            </div>
                                        </div>
                                    </Col>

                                    <Col span={24}>
                                        <div className="flex">
                                            <PhoneOutlined className="mr-2 text-gray-500" />
                                            <Text strong className="w-24">Liên hệ sân:</Text>
                                            <Text>{notification.footballfield?.phone || "Chưa có thông tin"}</Text>
                                        </div>
                                    </Col>

                                    <Col span={24}>
                                        <div className="flex">
                                            <AppstoreOutlined className="mr-2 text-gray-500" />
                                            <Text strong className="w-24">Số sân:</Text>
                                            <Tag color="blue">{notification.orderId.fieldName}</Tag>
                                        </div>
                                    </Col>

                                    <Col span={24}>
                                        <div className="flex">
                                            <div>
                                                <CalendarOutlined className="mr-2 text-gray-500" />
                                                <Text strong className="w-24">Ngày Giờ:</Text>
                                            </div>
                                            <div>
                                                <Text>{notification?.orderId?.timeStart || notification?.match?.time} </Text>
                                                <span className='ml-2'> / </span>
                                                <Text className='ml-2'> {notification?.orderId?.date || (notification?.match?.date ? moment(notification.match.date).format('DD-MM-YYYY') : '')}</Text>
                                            </div>
                                        </div>
                                    </Col>

                                    {(notification.match?.duration || notification.orderId?.duration) && (
                                        <Col span={12}>
                                            <div className="flex">
                                                <ClockCircleOutlined className="mr-2 text-gray-500" />
                                                <Text strong className="w-24">Thời lượng:</Text>
                                                <Text>{notification.match?.duration || notification.orderId?.duration || "90"} phút</Text>
                                            </div>
                                        </Col>
                                    )}
                                </Row>
                            </Card>

                            {/* Nút liên hệ và xem chi tiết */}
                            <div className="mt-4 flex flex-col sm:flex-row gap-3 sm:gap-4">
                                <Button
                                    type="primary"
                                    className="bg-orange-500 w-full sm:w-auto"
                                    icon={<PhoneOutlined />}
                                    size="large"
                                // onClick={() => window.open(`tel:${notification.match?.contact || notification.club_B?.contact || notification.club_A?.contact || ''}`)}
                                >
                                    Liên hệ ngay
                                </Button>

                                <Button
                                    className="bg-orange-500 w-full sm:w-auto"
                                    type="primary"
                                    icon={<CalendarOutlined />}
                                    onClick={() => router.push(`/homepage/profile/`)}
                                    size="large"
                                >
                                    <span className="hidden sm:inline">Xem chi tiết lịch thi đấu</span>
                                    <span className="sm:hidden">Xem lịch thi đấu</span>
                                </Button>
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
                                        <Text>
                                            {notification.footballfield?.address?.detail || ''}
                                            {notification.footballfield?.address?.ward ? `${notification.footballfield.address.detail ? ', ' : ''}${notification.footballfield.address.ward}` : ''}
                                            {notification.footballfield?.address?.district ? `${notification.footballfield.address.ward || notification.footballfield.address.detail ? ', ' : ''}${notification.footballfield.address.district}` : ''}
                                            {notification.footballfield?.address?.province ? `${notification.footballfield.address.district || notification.footballfield.address.ward || notification.footballfield.address.detail ? ', ' : ''}${notification.footballfield.address.province}` : ''}
                                        </Text>
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
