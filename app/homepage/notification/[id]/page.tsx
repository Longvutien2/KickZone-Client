'use client';
import { useEffect, useState } from 'react';
import { Typography, Button, Card, Divider, Tag, Row, Col, Skeleton } from 'antd';
import {
    ArrowLeftOutlined,
    CheckCircleOutlined,
    EnvironmentOutlined,
    ClockCircleOutlined,
    PhoneOutlined,
    TeamOutlined,
    CloseCircleOutlined,
    AppstoreOutlined,
    SearchOutlined,
    CalendarOutlined,
    AimOutlined
} from '@ant-design/icons';
import { useParams, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hook';
import { updateNotificationSlice } from '@/features/notification.slice';
import { Notification } from '@/models/notification';
import Image from 'next/image';
import { format, parse, startOfDay, isSameDay, differenceInDays } from 'date-fns';
import { vi } from 'date-fns/locale';
import { FootballField } from '@/models/football_field';

const { Title, Text } = Typography;

const NotificationDetailPage = () => {
    const [loading, setLoading] = useState(false); // Đặt false để hiển thị ngay lập tức
    const [notification, setNotification] = useState<any>(); // Sử dụng dữ liệu giả ngay từ đầu
    const notifications = useAppSelector(state => state.notification.value)
    const footballField = useAppSelector(state => state.footballField.detail) as FootballField;

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
                        ) : notification.notificationType === 'request_rejected' ? (
                            <CloseCircleOutlined className="text-xl sm:text-2xl text-red-500 flex-shrink-0" />
                        )
                            : (notification.notificationType === 'opponent_found' || notification.notificationType === 'request_accepted') ? (
                                <TeamOutlined className="text-xl sm:text-2xl text-purple-500 flex-shrink-0" />
                            ) : (notification.notificationType === 'match_request' || "request_accepted") ? (
                                <TeamOutlined className="text-xl sm:text-2xl text-blue-500 flex-shrink-0" />
                            )
                                : (
                                    <CheckCircleOutlined className="text-xl sm:text-2xl text-blue-500 flex-shrink-0" />
                                )}
                        <Title level={4} className="m-0 ml-2 sm:ml-3 text-base sm:text-lg leading-tight">
                            {notification.title || 'Chi tiết thông báo'}
                        </Title>
                    </div>

                    <div className={`p-3 sm:p-4 rounded-lg mb-4 sm:mb-6 ${notification.notificationType === 'field_booking_failed' ? 'bg-red-50' :
                        notification.notificationType === 'posted_opponent' ? 'bg-orange-50' :
                            notification.notificationType === 'field_booked' ? 'bg-green-50' :
                                notification.notificationType === 'request_rejected' ? 'bg-red-50' :
                                    (notification.notificationType === 'opponent_found' || notification.notificationType === 'request_accepted') ? 'bg-purple-50' :
                                        (notification.notificationType === 'match_request' || "request_accepted") ? 'bg-blue-50' :
                                            'bg-blue-50'
                        }`}>
                        <Text className={`text-sm sm:text-base leading-relaxed ${notification.notificationType === 'field_booking_failed' ? 'text-red-800' :
                            notification.notificationType === 'posted_opponent' ? 'text-orange-800' :
                                notification.notificationType === 'field_booked' ? 'text-green-800' :
                                    notification.notificationType === 'request_rejected' ? 'text-red-800' :
                                        (notification.notificationType === 'opponent_found' || notification.notificationType === 'request_accepted') ? 'text-purple-800' :
                                            (notification.notificationType === 'match_request' || "request_accepted") ? 'text-blue-800' :
                                                'text-blue-800'
                            }`}>
                            {notification.content}
                        </Text>
                    </div>

                    {/* Thông báo đặt sân thành công */}
                    {(notification.notificationType === 'field_booked' || notification.notificationType === 'new_order' || notification.notificationType === 'field_booking_failed') && notification.orderId && (
                        <>
                            <div className="bg-white rounded-lg p-4 mb-4 border border-green-100">
                                <Title level={5} className="mb-3 text-base sm:text-lg flex items-center">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                                    Thông tin đặt sân
                                </Title>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                    <div className="flex">
                                        <span className="font-medium text-gray-600 w-20 flex-shrink-0">Tên sân:</span>
                                        <span className="text-gray-800">{notification.footballfield?.name}</span>
                                    </div>
                                    <div className="flex">
                                        <span className="font-medium text-gray-600 w-20 flex-shrink-0">Thời gian:</span>
                                        <span className="text-gray-800">{notification.orderId.timeStart}</span>
                                    </div>
                                    <div className="flex">
                                        <span className="font-medium text-gray-600 w-20 flex-shrink-0">Sân số:</span>
                                        <span className="text-blue-600 font-semibold">{notification.orderId.fieldName}</span>
                                    </div>
                                    <div className="flex">
                                        <span className="font-medium text-gray-600 w-20 flex-shrink-0">Thanh toán:</span>
                                        <span className="text-gray-800">{notification.orderId.gateway}</span>
                                    </div>
                                    <div className="flex md:col-span-2">
                                        <span className="font-medium text-gray-600 w-20 flex-shrink-0">Địa chỉ:</span>
                                        <span className="text-gray-800">
                                            {notification.footballfield?.address?.detail || ''}
                                            {notification.footballfield?.address?.ward ? `${notification.footballfield.address.detail ? ', ' : ''}${notification.footballfield.address.ward}` : ''}
                                            {notification.footballfield?.address?.district ? `${notification.footballfield.address.ward || notification.footballfield.address.detail ? ', ' : ''}${notification.footballfield.address.district}` : ''}
                                            {notification.footballfield?.address?.province ? `${notification.footballfield.address.district || notification.footballfield.address.ward || notification.footballfield.address.detail ? ', ' : ''}${notification.footballfield.address.province}` : ''}
                                        </span>
                                    </div>
                                    <div className="flex">
                                        <span className="font-medium text-gray-600 w-20 flex-shrink-0">Giá:</span>
                                        <span className="text-red-600 font-bold">{notification.orderId.amount?.toLocaleString()} VNĐ</span>
                                    </div>
                                    <div className="flex">
                                        <span className="font-medium text-gray-600 w-20 flex-shrink-0">Thời gian đặt:</span>
                                        <span className="text-gray-800">{new Date(notification.createdAt).toLocaleString('vi-VN')}</span>
                                    </div>
                                </div>
                            </div>

                            {notification.notificationType === 'field_booking_failed' && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-4">
                                    <div className="flex items-center">
                                        <span className="font-medium text-red-600 w-24 flex-shrink-0">Lý do từ chối:</span>
                                        <span className="text-red-600">Thanh toán không hợp lệ</span>
                                    </div>
                                </div>
                            )}

                            <Divider />

                            <div className="bg-white rounded-lg p-4 border border-green-100">
                                <Title level={5} className="mb-3 text-base sm:text-lg flex items-center">
                                    <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                                    Thông tin người đặt
                                </Title>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                    <div className="flex">
                                        <span className="font-medium text-gray-600 w-24 flex-shrink-0">Tên đội:</span>
                                        <span className="text-gray-800 font-semibold">{notification.orderId.teamName}</span>
                                    </div>
                                    <div className="flex">
                                        <span className="font-medium text-gray-600 w-24 flex-shrink-0">Số điện thoại:</span>
                                        <span className="text-gray-800">{notification.orderId.phoneNumber}</span>
                                    </div>
                                    {notification.orderId.description && (
                                        <div className="flex md:col-span-2">
                                            <span className="font-medium text-gray-600 w-24 flex-shrink-0">Ghi chú:</span>
                                            <span className="text-gray-800 italic">"{notification.orderId.description}"</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Thông báo đăng tìm đối */}
                    {notification.notificationType === 'posted_opponent' && notification.footballfield && (
                        <>
                            {/* Thông tin đội bóng */}
                            <div className="mt-6 mb-6 bg-white border border-gray-200 rounded-lg sm:rounded-xl overflow-hidden">
                                <div key={notification._id}>
                                    {/* Phần trên: Thông tin 2 đội */}
                                    <div className="p-4 sm:p-6">
                                        {/* Mobile Layout */}
                                        <div className="block sm:hidden">
                                            {/* Đội A */}
                                            <div className="mb-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0">
                                                        <Image
                                                            src={notification.club_A?.teamImage || ""}
                                                            className="rounded-full object-cover"
                                                            layout="fill"
                                                            alt="bg"
                                                        />
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-base">{notification.club_A?.teamName}</div>
                                                        <div className='flex items-center flex-wrap gap-2 text-sm mt-1 text-orange-500'>
                                                            <span className="border border-orange-400 rounded-full px-2 py-0.5 text-xs">{notification.club_A?.ageGroup}</span>
                                                            <span>{notification.club_A?.level}</span>
                                                            <span>{notification.club_A?.contact}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* VS */}
                                            <div className="text-center text-2xl font-bold my-4">VS</div>

                                            {/* Đội B */}
                                            {notification.club_B ? (
                                                <div className="mb-4">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0">
                                                            <Image
                                                                src={notification?.club_B?.teamImage || ""}
                                                                className="rounded-full object-cover"
                                                                layout="fill"
                                                                alt="bg"
                                                            />
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-base">{notification.club_B?.teamName}</div>
                                                            <div className='flex items-center flex-wrap gap-2 text-sm mt-1 text-orange-500'>
                                                                <span className="border border-orange-400 rounded-full px-2 py-0.5 text-xs">{notification.club_B?.ageGroup}</span>
                                                                <span>{notification.club_B?.level}</span>
                                                                <span>{notification.club_B?.contact}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center text-center mb-4">
                                                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-100 flex items-center justify-center text-lg text-gray-500">
                                                        ?
                                                    </div>
                                                    <div className="text-xs text-gray-400 mt-1">Chưa có đối thủ</div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Desktop Layout */}
                                        <div className="hidden sm:grid sm:grid-cols-3 items-center mb-2">
                                            {/* Đội A */}
                                            <div>
                                                <div className="flex items-center space-x-3">
                                                    <div className="relative w-20 h-20">
                                                        <Image
                                                            src={notification?.club_A?.teamImage || ""}
                                                            className="rounded-full object-cover"
                                                            layout="fill"
                                                            alt="bg"
                                                        />
                                                    </div>
                                                    <div className="font-semibold text-sm">{notification.club_A?.teamName}</div>
                                                </div>
                                                <div className='flex items-center space-x-3 text-sm mt-2 text-orange-500'>
                                                    <span className="border border-orange-400 rounded-full px-2 py-0.5 text-xs">{notification.club_A?.ageGroup}</span>
                                                    <span>{notification.club_A?.level}</span>
                                                    <span>{notification.club_A?.contact}</span>
                                                </div>
                                            </div>

                                            {/* VS */}
                                            <div className="text-center text-3xl font-bold">VS</div>

                                            {/* Đội B nếu có */}
                                            <div className="flex flex-col items-end text-right">
                                                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-lg text-gray-500">
                                                    ?
                                                </div>
                                                <div className="text-xs text-gray-400 mt-1">Chưa có đối thủ</div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Phần dưới: Thông tin trận đấu với background màu cam nhẹ */}
                                    <div className="bg-orange-50 p-4 sm:p-6 text-xs sm:text-sm text-gray-700">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                                            <span className='capitalize text-sm sm:text-base font-medium'>
                                                {notification.orderId?.timeStart} | {
                                                    notification.orderId?.date ?
                                                        format(
                                                            parse(notification.orderId.date, "dd-MM-yyyy", new Date()),
                                                            'EEEE, dd-MM-yyyy',
                                                            { locale: vi }
                                                        )
                                                        : format(new Date(notification.date), 'EEEE, dd/MM/yyyy', { locale: vi })
                                                }
                                            </span>
                                            {(() => {
                                                // Kiểm tra xem match.orderId có tồn tại không
                                                if (!notification.orderId?.date) {
                                                    return (
                                                        <span className="bg-orange-100 text-orange-500 rounded-md px-2 py-1 text-xs self-start sm:self-center">
                                                            Không có thông tin ngày
                                                        </span>
                                                    );
                                                }

                                                // Chuyển đổi ngày trận đấu sang định dạng chuẩn
                                                const matchDate = startOfDay(parse(notification.orderId.date, "dd-MM-yyyy", new Date()));
                                                // Lấy ngày hiện tại ở đầu ngày (00:00:00)
                                                const today = startOfDay(new Date());

                                                // So sánh ngày
                                                const isToday = isSameDay(matchDate, today);
                                                const diffDays = differenceInDays(matchDate, today);

                                                if (isToday) {
                                                    // Nếu là ngày hôm nay và chưa có đối thủ
                                                    if (!notification.club_B) {
                                                        return (
                                                            <span className="bg-red-100 text-red-600 rounded-md px-2 py-1 text-xs font-bold flex items-center self-start sm:self-center">
                                                                <ClockCircleOutlined className="mr-1" />
                                                                <span className="hidden sm:inline">Hôm nay, {notification.orderId?.timeStart || notification.time}</span>
                                                                <span className="sm:hidden">Hôm nay</span>
                                                            </span>
                                                        );
                                                    } else {
                                                        // Nếu là ngày hôm nay nhưng đã có đối thủ
                                                        return (
                                                            <span className="bg-orange-100 text-orange-500 rounded-md px-2 py-1 text-xs self-start sm:self-center">
                                                                <span className="hidden sm:inline">Hôm nay, {notification.orderId?.timeStart || notification.time}</span>
                                                                <span className="sm:hidden">Hôm nay</span>
                                                            </span>
                                                        );
                                                    }
                                                } else if (diffDays > 0) {
                                                    // Nếu là ngày trong tương lai
                                                    return (
                                                        <span className="bg-orange-100 text-orange-500 rounded-md px-2 py-1 text-xs self-start sm:self-center">
                                                            {diffDays} ngày nữa
                                                        </span>
                                                    );
                                                } else {
                                                    // Nếu là ngày trong quá khứ
                                                    return (
                                                        <span className="bg-gray-100 text-gray-500 rounded-md px-2 py-1 text-xs self-start sm:self-center">
                                                            Đã diễn ra
                                                        </span>
                                                    );
                                                }
                                            })()}
                                        </div>
                                        <div className="mt-2 text-xs sm:text-sm text-gray-600 break-words">
                                            <Text>
                                                {notification.footballfield?.address?.detail || ''}
                                                {notification.footballfield?.address?.ward ? `${notification.footballfield.address.detail ? ', ' : ''}${notification.footballfield.address.ward}` : ''}
                                                {notification.footballfield?.address?.district ? `${notification.footballfield.address.ward || notification.footballfield.address.detail ? ', ' : ''}${notification.footballfield.address.district}` : ''}
                                                {notification.footballfield?.address?.province ? `${notification.footballfield.address.district || notification.footballfield.address.ward || notification.footballfield.address.detail ? ', ' : ''}${notification.footballfield.address.province}` : ''}
                                            </Text>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <Card className="mb-4">
                                <Title level={5} className="mb-3">Thông tin trận đấu</Title>
                                <Row gutter={[16, 12]}>
                                    <Col span={24}>
                                        <div className="flex gap-1 lg:gap-3">
                                            <div>
                                                <AimOutlined className="mr-2 text-gray-500" />
                                                <Text strong >Tên sân:</Text>
                                            </div>
                                            <Text>{notification.footballfield?.name}</Text>
                                        </div>
                                    </Col>

                                    <Col span={24}>
                                        <div className="flex gap-1 lg:gap-3">
                                            <div className=''>
                                                <EnvironmentOutlined className="mr-2 text-gray-500" />
                                                <Text strong>Địa chỉ:</Text>
                                            </div>
                                            <Text>
                                                {notification.footballfield?.address?.detail || ''}
                                                {notification.footballfield?.address?.ward ? `${notification.footballfield.address.detail ? ', ' : ''}${notification.footballfield.address.ward}` : ''}
                                                {notification.footballfield?.address?.district ? `${notification.footballfield.address.ward || notification.footballfield.address.detail ? ', ' : ''}${notification.footballfield.address.district}` : ''}
                                                {notification.footballfield?.address?.province ? `${notification.footballfield.address.district || notification.footballfield.address.ward || notification.footballfield.address.detail ? ', ' : ''}${notification.footballfield.address.province}` : ''}
                                            </Text>
                                        </div>
                                    </Col>

                                    <Col span={24}>
                                        <div className="flex gap-1 lg:gap-3">
                                            <div>
                                                <AppstoreOutlined className="mr-2 text-gray-500" />
                                                <Text strong>Số sân: </Text>
                                            </div>
                                            <Tag color="blue">{notification.orderId.fieldName}</Tag>
                                        </div>
                                    </Col>

                                    <Col span={24}>
                                        <div className="flex gap-1 lg:gap-3">
                                            <div>
                                                <CalendarOutlined className="mr-2 text-gray-500" />
                                                <Text strong>Ngày Giờ: </Text>
                                            </div>
                                            <div className='ml-1'>
                                                <Text> {notification.orderId.timeStart} </Text>
                                                <span > / </span>
                                                <Text> {notification.orderId.date}</Text>
                                            </div>
                                        </div>
                                    </Col>

                                    {/* {notification.match.contact && ( */}
                                    <Col span={24}>
                                        <div className="flex gap-1 lg:gap-3">
                                            <div>
                                                <PhoneOutlined className="mr-2 text-gray-500" />
                                                <Text strong className="w-24">Liên hệ chủ sân:</Text>
                                            </div>
                                            <Text>{notification.footballfield.phone}</Text>
                                        </div>
                                    </Col>
                                    {/* )} */}
                                </Row>

                                {/* Nút liên hệ và xem chi tiết */}
                                <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-3 sm:gap-4">
                                    <Button
                                        className="bg-orange-500 w-full sm:w-auto"
                                        type="primary"
                                        icon={<CalendarOutlined />}
                                        onClick={() => router.push(`/homepage/booking-history/`)}
                                        size="large"
                                    >
                                        <span className="hidden sm:inline">Xem chi tiết lịch thi đấu</span>
                                        <span className="sm:hidden">Xem lịch thi đấu</span>
                                    </Button>
                                </div>
                            </Card>

                        </>
                    )}

                    {/* Thông báo có đội muốn tham gia trận đấu   &&   Thông báo đã gửi yêu cầu */}
                    {((notification.notificationType === 'match_request') || (notification.notificationType === 'request_sent')) && (
                        <>
                            <div className="bg-white rounded-lg p-4 mb-4 border border-green-100">
                                <Title level={5} className="mb-3 text-base sm:text-lg flex items-center">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                                    Thông tin đặt sân
                                </Title>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                    <div className="flex">
                                        <span className="font-medium text-gray-600 w-20 flex-shrink-0">Tên sân:</span>
                                        <span className="text-gray-800">{footballField.name}</span>
                                    </div>
                                    <div className="flex">
                                        <span className="font-medium text-gray-600 w-20 flex-shrink-0">Thời gian:</span>
                                        <span className="text-gray-800">{notification.orderId?.timeStart}</span>
                                    </div>
                                    <div className="flex">
                                        <span className="font-medium text-gray-600 w-20 flex-shrink-0">Sân số:</span>
                                        <span className="text-blue-600 font-semibold">{notification.orderId?.fieldName}</span>
                                    </div>
                                    <div className="flex">
                                        <span className="font-medium text-gray-600 w-20 flex-shrink-0">Thanh toán:</span>
                                        <span className="text-gray-800">{notification.orderId?.gateway}</span>
                                    </div>
                                    <div className="flex md:col-span-2">
                                        <span className="font-medium text-gray-600 w-20 flex-shrink-0">Địa chỉ:</span>
                                        <span className="text-gray-800">
                                            {footballField.address.detail || ''}
                                            {footballField.address.ward ? `${footballField.address.detail ? ', ' : ''}${footballField.address.ward}` : ''}
                                            {footballField.address.district ? `${footballField.address.ward || footballField.address.detail ? ', ' : ''}${footballField.address.district}` : ''}
                                            {footballField.address.province ? `${footballField.address.district || footballField.address.ward || footballField.address.detail ? ', ' : ''}${footballField.address.province}` : ''}
                                        </span>
                                    </div>
                                    <div className="flex">
                                        <span className="font-medium text-gray-600 w-20 flex-shrink-0">Giá:</span>
                                        <span className="text-red-600 font-bold">{notification.orderId?.amount?.toLocaleString()} VNĐ</span>
                                    </div>
                                    <div className="flex">
                                        <span className="font-medium text-gray-600 w-20 flex-shrink-0">Thời gian đặt:</span>
                                        <span className="text-gray-800">{new Date(notification.createdAt).toLocaleString('vi-VN')}</span>
                                    </div>
                                </div>
                            </div>
                            <Divider />

                            <div className="bg-white rounded-lg p-4 border border-green-100">
                                <Title level={5} className="mb-3 text-base sm:text-lg flex items-center">
                                    <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                                    Thông tin hai đội
                                </Title>

                                {/* Mobile Layout */}
                                <div className="block sm:hidden">
                                    {/* Đội của bạn (Club A) */}
                                    <div className="mb-4">
                                        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                                            <div className="relative w-12 h-12 flex-shrink-0">
                                                <Image
                                                    src={notification.club_A?.teamImage || "/images/default-team.png"}
                                                    className="rounded-full object-cover"
                                                    layout="fill"
                                                    alt="team"
                                                    unoptimized={true}
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-semibold text-blue-700 text-sm">Đội của bạn</div>
                                                <div className="text-sm font-medium">{notification.club_A?.teamName || 'Đội chủ nhà'}</div>
                                                <div className="text-xs text-gray-600 mt-1">
                                                    Liên hệ: {notification.club_A?.contact || 'Không có thông tin'}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    Trình độ: {notification.club_A?.level || 'Chưa có'} | Độ tuổi: {notification.club_A?.ageGroup || 'Chưa có'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* VS */}
                                    <div className="text-center text-gray-500 font-bold mb-4">VS</div>

                                    {/* Đội gửi yêu cầu (Club B) */}
                                    <div>
                                        <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                                            <div className="relative w-12 h-12 flex-shrink-0">
                                                <Image
                                                    src={notification.club_B?.teamImage || "/images/default-team.png"}
                                                    className="rounded-full object-cover"
                                                    layout="fill"
                                                    alt="team"
                                                    unoptimized={true}
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-semibold text-orange-700 text-sm">Đội gửi yêu cầu</div>
                                                <div className="text-sm font-medium">{notification.club_B?.teamName || 'Đội khách'}</div>
                                                <div className="text-xs text-gray-600 mt-1">
                                                    Liên hệ: {notification.club_B?.contact || 'Không có thông tin'}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    Trình độ: {notification.club_B?.level || 'Chưa có'} | Độ tuổi: {notification.club_B?.ageGroup || 'Chưa có'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Desktop Layout */}
                                <div className="hidden sm:grid sm:grid-cols-5 gap-4 items-center">
                                    {/* Đội của bạn (Club A) */}
                                    <div className="col-span-2 flex items-center gap-4 p-3 bg-blue-50 rounded-lg">
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
                                            <div className="font-semibold text-blue-700">{notification.notificationType === 'match_request' ? 'Đội của bạn' : 'Đội chủ nhà'}</div>
                                            <div className=""><strong>Tên đội</strong>: {notification.club_A?.teamName || 'Đội chủ nhà'}</div>
                                            <div>
                                                <strong>Liên hệ</strong>: {notification.club_A?.contact || 'Không có thông tin'}
                                            </div>
                                            <div>
                                                <strong>Trình độ</strong>: {notification.club_A?.level || 'Chưa có'} | <strong>Độ tuổi</strong>: {notification.club_A?.ageGroup || 'Chưa có'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* VS */}
                                    <div className="text-center text-2xl font-bold text-gray-500">VS</div>

                                    {/* Đội gửi yêu cầu (Club B) */}
                                    <div className="col-span-2 flex items-center gap-4 p-3 bg-orange-50 rounded-lg">
                                        <div className="relative w-16 h-16 flex-shrink-0">
                                            <Image
                                                src={notification.club_B?.teamImage || "/images/default-team.png"}
                                                className="rounded-full object-cover"
                                                layout="fill"
                                                alt="team"
                                                unoptimized={true}
                                            />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-orange-700">{notification.notificationType === 'match_request' ? 'Đội gửi yêu cầu' : 'Đội của bạn'}</div>
                                            <div><strong>Tên đội</strong>: {notification.club_B?.teamName || 'Đội khách'}</div>
                                            <div>
                                                <strong>Liên hệ</strong>: {notification.club_B?.contact || 'Không có thông tin'}
                                            </div>
                                            <div>
                                                <strong>Trình độ</strong>: {notification.club_B?.level || 'Chưa có'} | <strong>Độ tuổi</strong>: {notification.club_B?.ageGroup || 'Chưa có'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Button
                                className="bg-orange-500 w-full sm:w-auto mt-6"
                                type="primary"
                                icon={<CalendarOutlined />}
                                onClick={() => router.push(`/homepage/find-opponent/${notification.match?._id}`)}
                                size="large"
                            >
                                <span className="hidden sm:inline">Xem chi trận đấu</span>
                                <span className="sm:hidden">Xem trận đấu</span>
                            </Button>
                        </>
                    )}

                    {/* Thông báo tìm đối thủ thành công */}
                    {(notification.notificationType === 'opponent_found' || notification.notificationType === 'request_accepted') && (
                        <>
                            {/* Thông tin đội bóng */}
                            <div className="mt-6 mb-6 bg-white border border-gray-200 rounded-lg sm:rounded-xl overflow-hidden">
                                <div key={notification._id}>
                                    {/* Phần trên: Thông tin 2 đội */}
                                    <div className="p-4 sm:p-6">
                                        {/* Mobile Layout */}
                                        <div className="block sm:hidden">
                                            {/* Đội A */}
                                            <div className="mb-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0">
                                                        <Image
                                                            src={notification.club_A?.teamImage || ""}
                                                            className="rounded-full object-cover"
                                                            layout="fill"
                                                            alt="bg"
                                                        />
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-base">{notification.club_A?.teamName}</div>
                                                        <div className='flex items-center flex-wrap gap-2 text-sm mt-1 text-orange-500'>
                                                            <span className="border border-orange-400 rounded-full px-2 py-0.5 text-xs">{notification.club_A?.ageGroup}</span>
                                                            <span>{notification.club_A?.level}</span>
                                                            <span>{notification.club_A?.contact}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* VS */}
                                            <div className="text-center text-2xl font-bold my-4">VS</div>

                                            {/* Đội B */}
                                            {notification.club_B ? (
                                                <div className="mb-4">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0">
                                                            <Image
                                                                src={notification?.club_B?.teamImage || ""}
                                                                className="rounded-full object-cover"
                                                                layout="fill"
                                                                alt="bg"
                                                            />
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-base">{notification.club_B?.teamName}</div>
                                                            <div className='flex items-center flex-wrap gap-2 text-sm mt-1 text-orange-500'>
                                                                <span className="border border-orange-400 rounded-full px-2 py-0.5 text-xs">{notification.club_B?.ageGroup}</span>
                                                                <span>{notification.club_B?.level}</span>
                                                                <span>{notification.club_B?.contact}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center text-center mb-4">
                                                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-100 flex items-center justify-center text-lg text-gray-500">
                                                        ?
                                                    </div>
                                                    <div className="text-xs text-gray-400 mt-1">Chưa có đối thủ</div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Desktop Layout */}
                                        <div className="hidden sm:grid sm:grid-cols-3 items-center mb-2">
                                            {/* Đội A */}
                                            <div>
                                                <div className="flex items-center space-x-3">
                                                    <div className="relative w-20 h-20">
                                                        <Image
                                                            src={notification?.club_A?.teamImage || ""}
                                                            className="rounded-full object-cover"
                                                            layout="fill"
                                                            alt="bg"
                                                        />
                                                    </div>
                                                    <div className="font-semibold text-sm">{notification.club_A?.teamName}</div>
                                                </div>
                                                <div className='flex items-center space-x-3 text-sm mt-2 text-orange-500'>
                                                    <span className="border border-orange-400 rounded-full px-2 py-0.5 text-xs">{notification.club_A?.ageGroup}</span>
                                                    <span>{notification.club_A?.level}</span>
                                                    <span>{notification.club_A?.contact}</span>
                                                </div>
                                            </div>

                                            {/* VS */}
                                            <div className="text-center text-3xl font-bold">VS</div>

                                            {/* Đội B nếu có */}
                                            <div className='flex flex-col items-end text-right'>
                                                <div className="flex items-center space-x-3">
                                                    <div className="font-semibold text-sm">{notification.club_B?.teamName}</div>
                                                    <div className="relative w-20 h-20">
                                                        <Image
                                                            src={notification?.club_B?.teamImage || ""}
                                                            className="rounded-full object-cover"
                                                            layout="fill"
                                                            alt="bg"
                                                        />
                                                    </div>
                                                </div>
                                                <div className='flex items-center space-x-3 text-sm mt-2 text-orange-500'>
                                                    <span className="border border-orange-400 rounded-full px-2 py-0.5 text-xs">{notification.club_B?.ageGroup}</span>
                                                    <span>{notification.club_B?.level}</span>
                                                    <span>{notification.club_B?.contact}</span>
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                    {/* Phần dưới: Thông tin trận đấu với background màu cam nhẹ */}
                                    <div className="bg-orange-50 p-4 sm:p-6 text-xs sm:text-sm text-gray-700">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                                            <span className='capitalize text-sm sm:text-base font-medium'>
                                                {notification.orderId?.timeStart} | {
                                                    notification.orderId?.date ?
                                                        format(
                                                            parse(notification.orderId.date, "dd-MM-yyyy", new Date()),
                                                            'EEEE, dd-MM-yyyy',
                                                            { locale: vi }
                                                        )
                                                        : format(new Date(notification.date), 'EEEE, dd/MM/yyyy', { locale: vi })
                                                }
                                            </span>
                                            {(() => {
                                                // Kiểm tra xem match.orderId có tồn tại không
                                                if (!notification.orderId?.date) {
                                                    return (
                                                        <span className="bg-orange-100 text-orange-500 rounded-md px-2 py-1 text-xs self-start sm:self-center">
                                                            Không có thông tin ngày
                                                        </span>
                                                    );
                                                }

                                                // Chuyển đổi ngày trận đấu sang định dạng chuẩn
                                                const matchDate = startOfDay(parse(notification.orderId.date, "dd-MM-yyyy", new Date()));
                                                // Lấy ngày hiện tại ở đầu ngày (00:00:00)
                                                const today = startOfDay(new Date());

                                                // So sánh ngày
                                                const isToday = isSameDay(matchDate, today);
                                                const diffDays = differenceInDays(matchDate, today);

                                                if (isToday) {
                                                    // Nếu là ngày hôm nay và chưa có đối thủ
                                                    if (!notification.club_B) {
                                                        return (
                                                            <span className="bg-red-100 text-red-600 rounded-md px-2 py-1 text-xs font-bold flex items-center self-start sm:self-center">
                                                                <ClockCircleOutlined className="mr-1" />
                                                                <span className="hidden sm:inline">Hôm nay, {notification.orderId?.timeStart || notification.time}</span>
                                                                <span className="sm:hidden">Hôm nay</span>
                                                            </span>
                                                        );
                                                    } else {
                                                        // Nếu là ngày hôm nay nhưng đã có đối thủ
                                                        return (
                                                            <span className="bg-orange-100 text-orange-500 rounded-md px-2 py-1 text-xs self-start sm:self-center">
                                                                <span className="hidden sm:inline">Hôm nay, {notification.orderId?.timeStart || notification.time}</span>
                                                                <span className="sm:hidden">Hôm nay</span>
                                                            </span>
                                                        );
                                                    }
                                                } else if (diffDays > 0) {
                                                    // Nếu là ngày trong tương lai
                                                    return (
                                                        <span className="bg-orange-100 text-orange-500 rounded-md px-2 py-1 text-xs self-start sm:self-center">
                                                            {diffDays} ngày nữa
                                                        </span>
                                                    );
                                                } else {
                                                    // Nếu là ngày trong quá khứ
                                                    return (
                                                        <span className="bg-gray-100 text-gray-500 rounded-md px-2 py-1 text-xs self-start sm:self-center">
                                                            Đã diễn ra
                                                        </span>
                                                    );
                                                }
                                            })()}
                                        </div>
                                        <div className="mt-2 text-xs sm:text-sm text-gray-600 break-words">
                                            <Text>
                                                {notification.footballfield?.address?.detail || ''}
                                                {notification.footballfield?.address?.ward ? `${notification.footballfield.address.detail ? ', ' : ''}${notification.footballfield.address.ward}` : ''}
                                                {notification.footballfield?.address?.district ? `${notification.footballfield.address.ward || notification.footballfield.address.detail ? ', ' : ''}${notification.footballfield.address.district}` : ''}
                                                {notification.footballfield?.address?.province ? `${notification.footballfield.address.district || notification.footballfield.address.ward || notification.footballfield.address.detail ? ', ' : ''}${notification.footballfield.address.province}` : ''}
                                            </Text>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Thông tin sân bóng và lịch thi đấu */}
                            <Card className="mb-4">
                                <Title level={5} className="mb-3">Thông tin trận đấu</Title>

                                <Row gutter={[16, 12]}>
                                    <Col span={24}>
                                        <div className="flex gap-1 lg:gap-3 ">
                                            <div>
                                                <AimOutlined className="mr-2 text-gray-500" />
                                                <Text strong >Tên sân:</Text>
                                            </div>
                                            <Text> {notification.footballfield?.name}</Text>
                                        </div>
                                    </Col>
                                    <Col span={24}>
                                        <div className="flex gap-1 lg:gap-3 ">
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
                                        <div className="flex gap-1 lg:gap-3 ">
                                            <div>
                                                <PhoneOutlined className="mr-2 text-gray-500" />
                                                <Text strong className="w-24">Liên hệ sân:</Text>
                                            </div>
                                            <Text>{notification.footballfield?.phone || "Chưa có thông tin"}</Text>
                                        </div>
                                    </Col>

                                    <Col span={24}>
                                        <div className="flex gap-1 lg:gap-3">
                                            <div>
                                                <AppstoreOutlined className="mr-2 text-gray-500" />
                                                <Text strong className="w-24">Số sân:</Text>
                                            </div>
                                            <Tag color="blue">{notification.orderId.fieldName}</Tag>
                                        </div>
                                    </Col>

                                    <Col span={24}>
                                        <div className="flex gap-1 lg:gap-3">
                                            <div>
                                                <CalendarOutlined className="mr-2 text-gray-500" />
                                                <Text strong className="w-24">Ngày Giờ:</Text>
                                            </div>
                                            <div>
                                                <Text>{notification?.orderId?.timeStart || notification?.match?.time} </Text>
                                                <span className='ml-2'> / </span>
                                                <Text className='ml-2'> {notification?.orderId?.date || (notification?.match?.date ? format(new Date(notification.match.date), 'dd-MM-yyyy') : '')}</Text>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                            </Card>

                            {/* Nút liên hệ và xem chi tiết */}
                            <div className="mt-4 flex flex-col sm:flex-row gap-3 sm:gap-4">
                                <Button
                                    type="primary"
                                    className="bg-orange-500 w-full sm:w-auto"
                                    icon={<PhoneOutlined />}
                                    size="large"
                                >
                                    Liên hệ ngay {notification.notificationType === 'opponent_found' ? notification.club_B?.contact : notification.club_A?.contact}
                                </Button>

                                <Button
                                    className="bg-orange-500 w-full sm:w-auto"
                                    type="primary"
                                    icon={<CalendarOutlined />}
                                    onClick={() => router.push(`/homepage/find-opponent/${notification.match?._id}`)}
                                    size="large"
                                >
                                    <span className="hidden sm:inline">Xem chi tiết lịch thi đấu</span>
                                    <span className="sm:hidden">Xem lịch thi đấu</span>
                                </Button>
                            </div>
                        </>
                    )}

                    <div className={`p-4 rounded-lg text-center mt-6 ${notification.notificationType === 'field_booking_failed' ? 'bg-red-50' :
                        notification.notificationType === 'posted_opponent' ? 'bg-orange-50' :
                            notification.notificationType === 'field_booked' ? 'bg-green-50' :
                                notification.notificationType === 'request_rejected' ? 'bg-red-50' :
                                    (notification.notificationType === 'opponent_found' || notification.notificationType === 'request_accepted') ? ' bg-purple-50' :
                                        (notification.notificationType === 'match_request' || "request_accepted") ? ' bg-blue-50' :
                                            'text-blue-800'
                        }`}>
                        <Text className={
                            notification.notificationType === 'field_booking_failed' ? 'text-red-800 ' :
                                notification.notificationType === 'posted_opponent' ? 'text-orange-800' :
                                    notification.notificationType === 'field_booked' ? 'text-green-800 ' :
                                        notification.notificationType === 'request_rejected' ? 'text-red-800 ' :
                                            (notification.notificationType === 'opponent_found' || notification.notificationType === 'request_accepted') ? 'text-purple-800 ' :
                                                (notification.notificationType === 'match_request' || "request_accepted") ? 'text-blue-800 ' :
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
