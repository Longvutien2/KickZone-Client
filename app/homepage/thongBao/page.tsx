'use client';
import { useEffect, useState } from 'react';
import { List, Badge, Typography, Tabs, Pagination } from 'antd';
import Link from 'next/link';
import { Notification } from '@/models/notification';
import { RootStateType } from '@/models/type';
import { useSelector } from 'react-redux';
import { useAppDispatch, useAppSelector } from '@/store/hook';
import { setBreadcrumb } from '@/features/breadcrumb.slice';

const { Text } = Typography;
const { TabPane } = Tabs;

interface DataProps {
    data: Notification[]
}

const NotificationPage = () => {
    const notifications = useAppSelector(state => state.notification.value)
    const [filter, setFilter] = useState('all'); // Trạng thái lọc: 'all' (tất cả) hoặc 'unread' (chưa đọc)
    const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
    const [activeNotification, setActiveNotification] = useState<string>(); // Trạng thái thông báo đang được chọn
    const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
    const user = useAppSelector(state => state.auth.value);
    const dispatch = useAppDispatch();


    useEffect(() => {
        const getData = async () => {
            // const data = await getNotifications();
            if (notifications && notifications.length > 0) {
                const data: Notification[] = notifications.filter((item: Notification) => {
                    if (filter === 'all') return true;
                    if (filter === 'unread') return item.read === false; // Lọc các thông báo chưa đọc
                });
                // Sắp xếp theo ngày (mới nhất lên đầu)
                const newData2 = data.sort((a, b) => {
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                });
                setFilteredNotifications(newData2);
            }

            dispatch(setBreadcrumb([
                { name: 'Home', url: '/' },
                { name: 'Thông báo', url: '/homepage/thongBao' },
              ]));
        }
        getData();

    }, [user, filter]);

    // Hàm thay đổi màu sắc khi click vào thông báo
    const handleNotificationClick = (id: string) => {
        setActiveNotification(id);
    };

    // Hàm để thay đổi trang
    const handlePageChange = (page: number) => {
        setCurrentPage(page); // Thay đổi trang hiện tại
    };

    // Chuyển đổi giờ UTC sang giờ Việt Nam
    const convertTime = (time: any) => {
        const vietnamTime = new Date(time).toLocaleString('vi-VN', {
            timeZone: 'Asia/Ho_Chi_Minh', // Múi giờ Việt Nam
            hour12: false // Định dạng 24h
        });
        return vietnamTime
    }

    

    return (
        <div className="flex flex-col min-h-screen">
            <h1 className="text-2xl font-semibold mb-4">Thông báo</h1>

            {/* Tùy chọn lọc, chiếm full width */}
            <Tabs
                activeKey={filter}
                onChange={setFilter}
                className="w-full mb-4"
                items={[
                    {
                        key: 'all',
                        label: 'Tất cả',
                    },
                    {
                        key: 'unread',
                        label: 'Chưa đọc',
                    },
                ]}
            />

            {/* Danh sách thông báo chiếm toàn bộ chiều rộng */}
            <List
                itemLayout="horizontal"
                dataSource={filteredNotifications.slice((currentPage - 1) * 10, currentPage * 10)} // Lọc dữ liệu theo trang
                renderItem={(item: Notification) => (
                    <Link href={`/homepage/thongBao/${item._id}`}>
                        <List.Item
                            actions={[<Text type="secondary">{convertTime(item.bookingId?.createdAt)}</Text>]}
                            className={`w-full hover:bg-gray-100 py-8 rounded-lg cursor-pointer transition-colors duration-200 
             ${activeNotification === item._id ? 'bg-blue-200' : ''}`} // Thêm màu xanh khi click
                            onClick={() => handleNotificationClick(item._id as string)} // Thêm sự kiện click
                        >
                            <List.Item.Meta
                                avatar={<Badge className='pl-4' status={item.read === false ? 'processing' : 'default'} />}
                                title={<span className="text-lg font-medium">{item.title}</span>}
                                description={item.content}
                            />
                        </List.Item>
                    </Link>
                )}
                className="w-full mb-4"
            />

            {/* Phân trang */}
            {notifications && notifications?.length > 0 &&
                <Pagination
                    current={currentPage}
                    total={filteredNotifications.length}
                    pageSize={10}
                    onChange={handlePageChange} // Xử lý sự kiện thay đổi trang
                />
            }
        </div>
    );
};

export default NotificationPage;
