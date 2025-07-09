'use client';
import { useState, useEffect, useMemo } from 'react';
import { List, Typography, Tabs, Avatar, Empty, message, Skeleton, Button, Pagination } from 'antd';
import Link from 'next/link';
import { Notification } from '@/models/notification';
import { BellOutlined, CheckCircleOutlined, CloseCircleOutlined, TeamOutlined, SearchOutlined, PlusCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '@/store/hook';
import { setBreadcrumb } from '@/features/breadcrumb.slice';
import { getListNotificationSlice } from '@/features/notification.slice';
import { deleteNotificationsByUserId } from '@/api/notification';
import { API_NodeJS } from '@/api/utils/axios';

const { Title } = Typography;

const NotificationPage = () => {
    const [filter, setFilter] = useState<'all' | 'unread'>('all');
    const [activeNotification, setActiveNotification] = useState<string>();
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10); // Tối đa 10 items mỗi page

    const user = useAppSelector(state => state.auth.value);
    const notifications = useAppSelector(state => state.notification.value);
    const dispatch = useAppDispatch();

    // 🚀 EXACT SAME PATTERN AS BOOKING-HISTORY
    useEffect(() => {
        const getData = async () => {
            setLoading(true);
            try {
                // 🔧 KEY: Chỉ fetch nếu chưa có data hoặc data cũ
                if (!notifications || notifications.length === 0) {
                // Sử dụng API tối ưu chỉ lấy notifications của user hiện tại
                if (user?.user?._id) {
                    await dispatch(getListNotificationSlice({
                        id: user.user._id,
                        role: "user"
                    })).unwrap();
                }
                }
                dispatch(setBreadcrumb([
                    { name: 'Home', url: '/' },
                    { name: 'Thông báo', url: '/homepage/notification' },
                ]));
            } catch (error) {
                console.error("Error fetching notifications:", error);
                message.error("Không thể tải dữ liệu thông báo. Vui lòng thử lại sau.");
            } finally {
                setLoading(false);
            }
        };

        if (user?.user?._id) {
            getData();
        } else {
            setLoading(false);
        }
    }, [dispatch, user?.user?._id]); // 🔧 KEY: Bỏ notifications khỏi dependency để tránh infinite loop

    // 🚀 EXACT SAME PATTERN: Memoized filtering logic để tối ưu performance
    const allFilteredNotifications = useMemo(() => {
        if (!notifications || !Array.isArray(notifications) || notifications.length === 0) {
            return [];
        }

        try {
            // Lọc notifications của user hiện tại (API đã filter theo userId)
            let filtered = notifications.filter((notification: Notification) => {
                return notification.actor === "user" && notification.targetUser === user.user._id;
            });

            // Lọc theo tab đang chọn
            switch (filter) {
                case 'all':
                    // Tất cả notifications
                    break;
                case 'unread':
                    // Chỉ notifications chưa đọc
                    filtered = filtered.filter((notification: Notification) => {
                        return notification.read === false;
                    });
                    break;
            }

            // Sắp xếp theo thời gian, mới nhất lên đầu
            return filtered.sort((a: Notification, b: Notification) => {
                const timeA = new Date(a.createdAt || 0).getTime();
                const timeB = new Date(b.createdAt || 0).getTime();
                return timeB - timeA;
            });
        } catch (error) {
            console.error("Error filtering notifications:", error);
            return [];
        }
    }, [filter, notifications, user?.user?._id]);

    // 📄 Pagination logic
    const totalItems = allFilteredNotifications.length;
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedNotifications = allFilteredNotifications.slice(startIndex, endIndex);

    // 🚀 MEMOIZED: Unread count
    const unreadCount = useMemo(() => {
        return notifications && notifications?.filter((n: Notification) =>
            n.actor === "user" &&
            n.targetUser === user.user._id &&
            !n.read
        ).length || 0;
    }, [notifications, user?.user?._id]);

    // Reset pagination khi filter thay đổi
    useEffect(() => {
        setCurrentPage(1);
    }, [filter]);

    const handleNotificationClick = (id: string) => {
        setActiveNotification(id);
    };

    const handleFilterChange = (newFilter: string) => {
        setFilter(newFilter as 'all' | 'unread');
        setCurrentPage(1); // Reset về trang đầu khi đổi filter
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const convertTime = (time: Date | string | undefined) => {
        if (!time) return '';
        try {
            const vietnamTime = new Date(time).toLocaleString('vi-VN', {
                timeZone: 'Asia/Ho_Chi_Minh',
                hour12: false
            });
            return vietnamTime;
        } catch (error) {
            console.error('Error converting time:', error);
            return '';
        }
    };

    const getNotificationIcon = (item: Notification) => {
        if (item.notificationType === 'field_booked') {
            return <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '20px' }} />;
        } else if (item.notificationType === 'field_booking_failed') {
            return <CloseCircleOutlined style={{ color: '#f5222d', fontSize: '20px' }} />;
        } else if (item.notificationType === 'opponent_found' || item.notificationType === "request_accepted") {
            return <TeamOutlined style={{ color: '#722ed1', fontSize: '20px' }} />;
        } else if (item.notificationType === 'posted_opponent') {
            return <SearchOutlined style={{ color: '#fa8c16', fontSize: '20px' }} />;
        } else if (item.notificationType === 'field_created') {
            return <PlusCircleOutlined style={{ color: '#13c2c2', fontSize: '20px' }} />;
        } else if ((item.notificationType === 'match_request' || item.notificationType === 'request_sent')) {
            return <TeamOutlined style={{ color: '#1890ff', fontSize: '20px' }} />;
        }else if (item.notificationType === 'request_rejected') {
            return <CloseCircleOutlined style={{ color: '#f5222d', fontSize: '20px' }} />;
        }
        else {
            return <BellOutlined style={{ color: '#1890ff', fontSize: '20px' }} />;
        }
    };

    // 🚀 EXACT SAME PATTERN: Early return for no user
    if (!user?.user) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Empty description="Vui lòng đăng nhập để xem thông báo" />
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen">
            <div className="bg-white rounded-none sm:rounded-xl">
                <Title level={3} className="mb-4 sm:mb-6 flex items-center text-xl sm:text-2xl">
                    Thông báo
                </Title>
                {/* 🗑️ TEMP: Buttons để xóa notifications */}
                {/* <div className="mb-4 flex gap-2 flex-wrap">
                    <Button
                        type="default"
                        size="small"
                        icon={<BellOutlined />}
                        onClick={refreshNotifications}
                        loading={loading}
                    >
                        Refresh Data
                    </Button>
                    <Button
                        type="primary"
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={deleteAllNotifications}
                        loading={loading}
                    >
                        Xóa tất cả
                    </Button>
                    <Button
                        type="primary"
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={deleteOldNotifications}
                        loading={loading}
                    >
                        Xóa cũ (giữ 5)
                    </Button>
                </div> */}
                <Tabs
                    activeKey={filter}
                    onChange={handleFilterChange}
                    className="custom-tabs mb-4 sm:mb-6"
                    size="large"
                    items={[
                        {
                            key: 'all',
                            label: <span className="px-2 sm:px-4 py-1 sm:py-2 font-medium text-sm sm:text-base">Tất cả</span>,
                        },
                        {
                            key: 'unread',
                            label: (
                                <span className="px-2 sm:px-4 py-1 sm:py-2 font-medium flex items-center text-sm sm:text-base">
                                    <span className="hidden sm:inline">Chưa đọc</span>
                                    <span className="sm:hidden">Chưa đọc</span>
                                    {unreadCount > 0 && (
                                        <span className="ml-1 sm:ml-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                                            {unreadCount}
                                        </span>
                                    )}
                                </span>
                            ),
                        },
                    ]}
                />

                <div className="mt-4 sm:mt-6 bg-white rounded-lg sm:rounded-xl overflow-hidden border border-gray-100">
                    {/* 🚀 EXACT SAME PATTERN: Loading skeleton */}
                    {loading ? (
                        // Simple skeleton loading
                        <div className="p-4 space-y-4">
                            {Array.from({ length: 5 }).map((_, index) => (
                                <div key={index} className="flex items-start space-x-4 p-4 border-b border-gray-100">
                                    <Skeleton.Avatar size={40} />
                                    <div className="flex-1">
                                        <Skeleton.Input style={{ width: '60%', height: 16 }} active />
                                        <div className="mt-2">
                                            <Skeleton.Input style={{ width: '100%', height: 14 }} active />
                                            <Skeleton.Input style={{ width: '80%', height: 14, marginTop: 4 }} active />
                                        </div>
                                    </div>
                                    <Skeleton.Input style={{ width: 60, height: 12 }} active />
                                </div>
                            ))}
                        </div>
                    ) : paginatedNotifications.length > 0 ? (
                        <List
                            itemLayout="horizontal"
                            dataSource={paginatedNotifications}
                            renderItem={(item: Notification) => (
                                <Link href={`/homepage/notification/${item._id}`}>
                                    <List.Item
                                        className={`border-b border-gray-100 hover:bg-gray-50 transition-all duration-300 ${activeNotification === item._id ? 'bg-gray-50' : ''
                                            }`}
                                        onClick={() => handleNotificationClick(item._id as string)}
                                    >
                                        <div className="flex w-full p-3 sm:p-4">
                                            <div className="mr-3 sm:mr-4 flex-shrink-0">
                                                <Avatar
                                                    icon={getNotificationIcon(item)}
                                                    size={32}
                                                    className={`sm:w-10 sm:h-10 ${!item.read ? 'bg-blue-100' : 'bg-gray-100'}`}
                                                />
                                            </div>
                                            <div className="flex-grow min-w-0">
                                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-4">
                                                    <div className="flex-grow min-w-0">
                                                        <div className={`text-sm sm:text-base leading-tight ${item.read === false ? 'font-semibold text-gray-900' : 'font-normal text-gray-500'}`}>
                                                            <span className="break-words">{item.title}</span>
                                                            {!item.read && (
                                                                <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full whitespace-nowrap">
                                                                    Mới
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className={`mt-1 text-xs sm:text-sm line-clamp-2 ${item.read ? 'text-gray-400' : 'text-gray-600'}`}>
                                                            {item.content}
                                                        </div>
                                                    </div>
                                                    <div className={`text-xs whitespace-nowrap flex-shrink-0 text-right sm:text-left ${item.read ? 'text-gray-400' : 'text-gray-500'}`}>
                                                        <div className="sm:hidden">
                                                            {convertTime(item?.createdAt).split(',')[0]}
                                                        </div>
                                                        <div className="hidden sm:block">
                                                            {convertTime(item?.createdAt).split(',')[0]}
                                                            <br />
                                                            {convertTime(item?.createdAt).split(',')[1]}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </List.Item>
                                </Link>
                            )}
                        />
                    ) : (
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description={
                                <span className="text-gray-500 text-sm sm:text-base">Không có thông báo nào</span>
                            }
                            className="py-8 sm:py-12"
                        />
                    )}
                </div>

                {/* 📄 Pagination */}
                {totalItems > pageSize && (
                    <div className="mt-6 flex justify-center">
                        <Pagination
                            current={currentPage}
                            total={totalItems}
                            pageSize={pageSize}
                            onChange={handlePageChange}
                            showSizeChanger={false}
                            showQuickJumper={false}
                            className="text-center"
                        />
                    </div>
                )}
            </div>
        </div>
    );

};

export default NotificationPage;
