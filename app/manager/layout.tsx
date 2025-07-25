'use client';

import { Layout, Menu } from "antd";
import "dayjs/locale/vi";
import Link from "next/link";
import {
    HomeOutlined,
    AppstoreOutlined,
    FieldTimeOutlined,
    ShoppingCartOutlined,
    BellOutlined,
    TeamOutlined,
    FileSearchOutlined,
    EnvironmentOutlined,
    UserOutlined,
    PieChartOutlined
} from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getListNotificationManagerSlice, getListNotificationSlice } from "@/features/notification.slice";
import { getListOrdersSlice } from "@/features/order.slice";
import { toast } from "react-toastify";
import { io } from "socket.io-client";
import { playNotificationSound } from '@/utils/notificationSound';

const { Header, Sider } = Layout;

const LayoutManager = ({ children }: { children: React.ReactNode }) => {
    const pathname = usePathname();
    const user = useAppSelector(state => state.auth)
    const notifications = useAppSelector(state => state.notification.value);
    const dispatch = useAppDispatch();
    const [notification, setNotification] = useState<any>([]);

    useEffect(() => {
        if (!user.isLoggedIn) return;

        const socket = io(process.env.NEXT_PUBLIC_API_BACKEND_IO);

        // Lắng nghe thông báo đặt sân mới giống như phần tìm đối
        socket.on('newBookingNotification', (data: any) => {

            if (data.targetUserId === user.value.user._id) {
                // Phát âm thanh thông báo
                playNotificationSound();
                toast.success(data.message);
                // Refresh orders data để cập nhật trang orders-schedule
                dispatch(getListOrdersSlice());

            }
        });

        socket.on('pushNotification', (data: any) => {
            data && setNotification((prev: any) => [...prev, data]);
        });

        // Lắng nghe sự kiện cập nhật thông báo
        socket.on('updateNotification', (data: any) => {
            setNotification((prev: any) =>
                prev.map((item: any) =>
                    item._id === data._id ? data : item
                )
            );
        });

        return () => {
            socket.off('newBookingNotification');
            socket.off('pushNotification');
            socket.off('updateNotification');
            socket.disconnect();
        };
    }, [user.isLoggedIn, user.value.user._id]);

    useEffect(() => {
        const getData = async () => {
            if (user.isLoggedIn) {
                const data = await dispatch(getListNotificationManagerSlice("manager"))
                setNotification(data.payload);
            }
        }
        getData();
    }, [user]);

    const items = [
        {
            key: "home",
            label: <Link href="/"><HomeOutlined /> Trang chủ</Link>,
            path: "/"
        },
        {
            key: "statistics",
            label: <Link href="/manager/statistics">< PieChartOutlined /> Thống kê</Link>,
            path: "/manager/statistics"
        },
        {
            key: "listField",
            label: <Link href="/manager/field"><AppstoreOutlined /> Quản lý loại sân</Link>,
            path: "/manager/field"
        },
        {
            key: "myField",
            label: <Link href="/manager/myField"><EnvironmentOutlined /> Sân bóng của tôi</Link>,
            path: "/manager/myField"
        },
        {
            key: "orders-schedule",
            label: <Link href="/manager/orders-schedule"><FieldTimeOutlined /> Lịch đặt sân</Link>,
            path: "/manager/orders-schedule"
        },
        {
            key: "matches",
            label: <Link href="/manager/matches"><TeamOutlined /> Quản lý trận đấu</Link>,
            path: "/manager/matches"
        },
        {
            key: "orders",
            label: <Link href="/manager/orders"><ShoppingCartOutlined /> Quản lý đơn hàng</Link>,
            path: "/manager/orders"
        },
        {
            key: "notification",
            label: (
                <Link href="/manager/notification" className="flex items-center gap-2">
                    <div className="flex">
                        <BellOutlined />
                        <div className="ml-1">Thông báo</div>
                    </div>
                    {notification?.filter((item: any) =>
                        item.actor === "manager" &&
                        !item.read
                    ).length > 0 && (
                            <span className=" text-white bg-red-500 text-xs font-bold rounded-full px-2 py-0.5">
                                {notification.filter((item: any) =>
                                    item.actor === "manager" &&
                                    !item.read
                                ).length}
                            </span>
                        )}
                </Link>
            ),
            path: "/manager/notification"
        },
    ];

    // Tìm key hiện tại dựa theo pathname
    const selectedKey = items.find(item => item.path === pathname || "")?.key;

    return (
        <Layout className="min-h-screen">
            <Sider width={220} className="bg-white text-gray-800 shadow-md">
                <Link href="/">
                    <div className="p-5 text-lg font-bold text-blue-600 border-b border-gray-100 hover:text-[#FE6900]">KichZone</div>
                </Link>
                <Menu
                    theme="light"
                    mode="inline"
                    selectedKeys={[selectedKey || "/"]}
                    items={items}
                    className="border-r-0 custom-menu"
                    style={{
                        borderRight: 'none',
                    }}
                />
            </Sider>
            <Layout>
                <Header className="bg-white shadow-sm px-8 text-right">
                    <Link href="/homepage/profile">
                        <UserOutlined className="mr-2" />
                        {user.value.user?.name}
                    </Link>
                </Header>
                {children}
            </Layout>
        </Layout>
    );
};

export default LayoutManager;
