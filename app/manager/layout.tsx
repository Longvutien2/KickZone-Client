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
import { getListBookingsSlice } from "@/features/booking.slice";
import { toast } from "react-toastify";
import { io } from "socket.io-client";

const { Header, Sider } = Layout;

const LayoutManager = ({ children }: { children: React.ReactNode }) => {
    const pathname = usePathname();
    const user = useAppSelector(state => state.auth)
    const notifications = useAppSelector(state => state.notification.value);
    const bookings = useAppSelector(state => state.booking.value);
    const dispatch = useAppDispatch();
    const [notification, setNotification] = useState<any>([]);

    const socket = io(process.env.NEXT_PUBLIC_API_BACKEND_IO);
    useEffect(() => {
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
            socket.off('pushNotification');
            socket.off('updateNotification');
        };
    }, []);

    useEffect(() => {
        const getData = async () => {
            if (user.isLoggedIn) {
                const data = await dispatch(getListNotificationManagerSlice("manager"))
                await dispatch(getListBookingsSlice())
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
            key: "quanLiSanBong",
            label: <Link href="/manager/quanLiSanBong"><FieldTimeOutlined /> Lịch đặt sân</Link>,
            path: "/manager/quanLiSanBong"
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
                    <BellOutlined />
                    <span>Thông báo</span>
                    {notification?.filter((item: any) =>
                        item.actor === "manager" &&
                        !item.read
                    ).length > 0 && (
                            <span className="ml-1 text-white bg-red-500 text-xs font-bold rounded-full px-2 py-0.5">
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
        // {
        //     key: "doiCuaToi",
        //     label: <Link href="/manager/doiCuaToi"><TeamOutlined /> Quản lý nhân viên</Link>,
        //     path: "/manager/doiCuaToi"
        // },
    ];

    // Tìm key hiện tại dựa theo pathname
    const selectedKey = items.find(item => item.path === pathname || "")?.key;

    return (
        <Layout className="min-h-screen">
            <Sider width={220} className="bg-white text-gray-800 shadow-md">
                <div className="p-5 text-lg font-bold text-blue-600 border-b border-gray-100">KichZone</div>
                <Menu
                    theme="light"
                    mode="inline"
                    selectedKeys={[selectedKey || "/"]}
                    items={items}
                    className="border-r-0"
                    style={{
                        borderRight: 'none',
                    }}
                />
            </Sider>
            <Layout>
                <Header className="bg-white shadow-sm px-8">
                    <div className="text-right text-[16px]">
                        <UserOutlined className="mr-2" /> Vũ Tiến Long
                    </div>
                </Header>
                {children}
            </Layout>
        </Layout>
    );
};

export default LayoutManager;
