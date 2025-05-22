'use client';
import { useEffect, useState } from 'react';
import { List, Badge, Typography, Tabs, Pagination, Empty, Avatar } from 'antd';
import Link from 'next/link';
import { Notification } from '@/models/notification';
import { useAppSelector } from '@/store/hook';
import { 
    CheckCircleOutlined, 
    CloseCircleOutlined, 
    TeamOutlined, 
    SearchOutlined,
    PlusCircleOutlined
} from '@ant-design/icons';

const { Text, Title } = Typography;

const NotificationManager = () => {
    const notifications = useAppSelector(state => state.notification.value)
    const [filter, setFilter] = useState('all'); // Trạng thái lọc: 'all' (tất cả) hoặc 'unread' (chưa đọc)
    const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
    const [activeNotification, setActiveNotification] = useState<string>(); // Trạng thái thông báo đang được chọn
    const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
    const user = useAppSelector(state => state.auth.value);
    
    useEffect(() => {
        const getData = async () => {
            if (notifications && notifications.length > 0) {
                const data: Notification[] = notifications
                    .filter((item:Notification) => item.actor === "manager")
                    .filter((item: Notification) => {
                        if (filter === 'all') return true;
                        if (filter === 'unread') return item.read === false; // Lọc các thông báo chưa đọc
                    });
                
                // Sắp xếp theo ngày (mới nhất lên đầu)
                const sortedData = data.sort((a, b) => {
                    const timeA = new Date(a.createdAt).getTime();
                    const timeB = new Date(b.createdAt).getTime();
                    return timeB - timeA;
                });
                
                setFilteredNotifications(sortedData);
            }
        }
        getData();
    }, [notifications, filter]);

    // Hàm thay đổi màu sắc khi click vào thông báo
    const handleNotificationClick = (id: string) => {
        setActiveNotification(id);
    };

    // Hàm để thay đổi trang
    const handlePageChange = (page: number) => {
        setCurrentPage(page); // Thay đổi trang hiện tại
    };

    // Hàm lấy icon phù hợp với loại thông báo
    const getNotificationIcon = (item: Notification) => {
        // Dựa vào notificationType để xác định icon phù hợp
        if (item.notificationType === 'field_booked' || item.notificationType === 'new_order') {
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
            return <CheckCircleOutlined style={{ color: '#1890ff', fontSize: '20px' }} />;
        }
    };

    const convertTime = (time: any) => {
        if (!time) return '';
        const vietnamTime = new Date(time).toLocaleString('vi-VN', {
            timeZone: 'Asia/Ho_Chi_Minh',
            hour12: false
        });
        return vietnamTime;
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen w-full">
            <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex flex-col min-h-screen">
                    <Title level={3} className="mb-6 flex items-center">
                        Thông báo
                    </Title>

                    <Tabs
                        activeKey={filter}
                        onChange={setFilter}
                        className="custom-tabs"
                        items={[
                            {
                                key: 'all',
                                label: <span className="px-4 py-2 font-medium">Tất cả</span>,
                            },
                            {
                                key: 'unread',
                                label: (
                                    <span className="px-4 py-2 font-medium flex items-center">
                                        Chưa đọc
                                        {notifications?.filter((n: Notification) => n.actor === "manager" && !n.read).length > 0 && (
                                            <span className="ml-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                                {notifications.filter((n: Notification) => n.actor === "manager" && !n.read).length}
                                            </span>
                                        )}
                                    </span>
                                ),
                            },
                        ]}
                    />

                    <div className="mt-6 bg-white rounded-xl overflow-hidden border border-gray-100">
                        <List
                            itemLayout="horizontal"
                            dataSource={filteredNotifications.slice((currentPage - 1) * 10, currentPage * 10)}
                            renderItem={(item: Notification) => (
                                <Link href={`/manager/notification/${item._id}`}>
                                    <List.Item
                                        className={`border-b border-gray-100 hover:bg-gray-50 transition-all duration-300 ${activeNotification === item._id ? 'bg-gray-50' : ''}`}
                                        onClick={() => handleNotificationClick(item._id as string)}
                                    >
                                        <div className="flex w-full p-4">
                                        <div className="mr-4">
                                            <Avatar
                                                icon={getNotificationIcon(item)}
                                                size={40}
                                                className={`${!item.read ? 'bg-blue-100' : 'bg-gray-100'}`}
                                            />
                                        </div>
                                        <div className="flex-grow">
                                            <div className="flex justify-between items-start">
                                                <div className={`text-base ${item.read === false ? 'font-semibold text-gray-900' : 'font-normal text-gray-500'}`}>
                                                    {item.title}
                                                    {!item.read && (
                                                        <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                                                            Mới
                                                        </span>
                                                    )}
                                                </div>
                                                <div className={`text-xs whitespace-nowrap ml-4 ${item.read ? 'text-gray-400' : 'text-gray-500'}`}>
                                                    {convertTime(item?.createdAt).split(',')[0]}
                                                    <br />
                                                    {convertTime(item?.createdAt).split(',')[1]}
                                                </div>
                                            </div>
                                            <div className={`mt-1 text-sm line-clamp-2 ${item.read ? 'text-gray-400' : 'text-gray-600'}`}>
                                                {item.content}
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
                                            <span className="text-gray-500">Không có thông báo nào</span>
                                        }
                                        className="py-12"
                                    />
                                )
                            }}
                        />
                    </div>

                    {filteredNotifications.length > 0 && (
                        <div className="flex justify-center mt-6">
                            <Pagination
                                current={currentPage}
                                total={filteredNotifications.length}
                                pageSize={10}
                                onChange={handlePageChange}
                                className="custom-pagination"
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationManager;
