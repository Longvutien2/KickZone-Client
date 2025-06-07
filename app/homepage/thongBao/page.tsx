'use client';
import { useEffect, useState } from 'react';
import { List, Badge, Typography, Tabs, Pagination, Avatar, Empty } from 'antd';
import Link from 'next/link';
import { Notification } from '@/models/notification';
import { BellOutlined, CheckCircleOutlined, CloseCircleOutlined, TeamOutlined, SearchOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '@/store/hook';
import { setBreadcrumb } from '@/features/breadcrumb.slice';
import { getListNotificationSlice } from '@/features/notification.slice';
import { io } from 'socket.io-client';

const { Text, Title } = Typography;

const NotificationPage = () => {
    const notifications = useAppSelector(state => state.notification.value)
    const [filter, setFilter] = useState('all');
    const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
    const [activeNotification, setActiveNotification] = useState<string>();
    const [currentPage, setCurrentPage] = useState(1);
    const user = useAppSelector(state => state.auth.value);
    const dispatch = useAppDispatch();

    const socket = io(process.env.NEXT_PUBLIC_API_BACKEND_IO);
    useEffect(() => {
        socket.on('pushNotification', (data: any) => {
            notifications.filter((item: any) => item.targetUser === data.targetUser).length > 0 && setFilteredNotifications((prev: any) => [...prev, data]);
        });
        socket.on('updateNotification', (data: any) => {
            setFilteredNotifications((prev: any) =>
                prev.map((item: any) =>
                    item._id === data._id ? data : item
                )
            );
        });
        return () => {
            socket.off('pushNotification');
            socket.off('updateNotification');
        };
    }, []);

    useEffect(() => {
        const getData = async () => {
            await dispatch(getListNotificationSlice({ id: user.user._id as string, role: "user" }));
            let data: Notification[] = [];

            if (notifications && notifications.length > 0) {
                // Sử dụng dữ liệu thật từ Redux store
                data = notifications
                    .filter((item: Notification) => item.actor === "user" && item.targetUser === user.user._id)
                    .filter((item: Notification) => {
                        if (filter === 'all') return true;
                        if (filter === 'unread') return item.read === false;
                    });
            }

            // Sắp xếp theo thời gian tạo, mới nhất lên đầu
            const sortedData = data.sort((a, b) => {
                const timeA = new Date(a.createdAt || 0).getTime();
                const timeB = new Date(b.createdAt || 0).getTime();
                return timeB - timeA;
            });
            setFilteredNotifications(sortedData);

            dispatch(setBreadcrumb([
                { name: 'Home', url: '/' },
                { name: 'Thông báo', url: '/homepage/thongBao' },
            ]));
        }
        getData();
    }, [user, filter]);

    const handleNotificationClick = (id: string) => {
        setActiveNotification(id);
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
        // Dựa vào notificationType để xác định icon phù hợp
        if (item.notificationType === 'field_booked') {
            return <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '20px' }} />;
        } else if (item.notificationType === 'field_booking_failed') {
            return <CloseCircleOutlined style={{ color: '#f5222d', fontSize: '20px' }} />;
        } else if (item.notificationType === 'opponent_found') {
            return <TeamOutlined style={{ color: '#722ed1', fontSize: '20px' }} />;
        } else if (item.notificationType === 'posted_opponent') {
            return <SearchOutlined style={{ color: '#fa8c16', fontSize: '20px' }} />;
        } else if (item.notificationType === 'field_created') {
            return <PlusCircleOutlined style={{ color: '#13c2c2', fontSize: '20px' }} />;
        } else {
            return <BellOutlined style={{ color: '#1890ff', fontSize: '20px' }} />;
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
            <div className="bg-white rounded-none sm:rounded-xl p-4 sm:p-0">
                <Title level={3} className="mb-4 sm:mb-6 flex items-center text-xl sm:text-2xl">
                    Thông báo
                </Title>

                <Tabs
                    activeKey={filter}
                    onChange={setFilter}
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
                                    {notifications?.filter((n: Notification) => !n.read).length > 0 && (
                                        <span className="ml-1 sm:ml-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                                            {notifications.filter((n: Notification) => !n.read).length}
                                        </span>
                                    )}
                                </span>
                            ),
                        },
                    ]}
                />

                <div className="mt-4 sm:mt-6 bg-white rounded-lg sm:rounded-xl overflow-hidden border border-gray-100">
                    <List
                        itemLayout="horizontal"
                        dataSource={filteredNotifications.slice((currentPage - 1) * 10, currentPage * 10)}
                        renderItem={(item: Notification) => (
                            <Link href={`/homepage/thongBao/${item._id}`}>
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
                        locale={{
                            emptyText: (
                                <Empty
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    description={
                                        <span className="text-gray-500 text-sm sm:text-base">Không có thông báo nào</span>
                                    }
                                    className="py-8 sm:py-12"
                                />
                            )
                        }}
                    />
                </div>

                {filteredNotifications.length > 0 && (
                    <div className="flex justify-center mt-4 sm:mt-6">
                        <Pagination
                            current={currentPage}
                            total={filteredNotifications.length}
                            pageSize={10}
                            onChange={handlePageChange}
                            className="custom-pagination"
                            size="small"
                            showSizeChanger={false}
                            showQuickJumper={false}
                            responsive={true}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationPage;
