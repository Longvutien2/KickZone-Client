'use client';

import { Layout, Menu } from "antd";
import "dayjs/locale/vi";
import Link from "next/link";
import {
    AimOutlined,
    BellOutlined,
    HomeOutlined,
    ThunderboltOutlined,
    TrophyOutlined,
    UserOutlined
} from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { getListNotificationSlice } from "@/features/notification.slice";
import { getListBookingsSlice } from "@/features/booking.slice";

const { Header, Sider } = Layout;

const LayoutManager = ({ children }: { children: React.ReactNode }) => {
    const pathname = usePathname();
    const user = useAppSelector(state => state.auth)
    const notifications = useAppSelector(state => state.notification.value);
    const bookings = useAppSelector(state => state.booking.value);
    const dispatch = useAppDispatch();

    const items = [
        {
            key: "home",
            label: <Link href="/"><HomeOutlined /> Trang chủ</Link>,
            path: "/"
        },
        {
            key: "listField",
            label: <Link href="/manager/field"><ThunderboltOutlined /> Quản lý loại sân</Link>,
            path: "/manager/field"
        },
        {
            key: "myField",
            label: <Link href="/manager/myField"><ThunderboltOutlined /> Sân bóng của tôi</Link>,
            path: "/manager/myField"
        },
        {
            key: "quanLiSanBong",
            label: <Link href="/manager/quanLiSanBong"><TrophyOutlined /> Quản lý sân bóng</Link>,
            path: "/manager/quanLiSanBong"
        },
        {
            key: "bookingField",
            label: <Link href="/manager/bookingField"><AimOutlined />
                <span>Quản lý yêu cầu</span>
                {bookings.filter((item: any) => {
                    // Lọc booking có trạng thái "Chờ xác nhận"
                    if (item.status === "Chờ xác nhận") {
                        // Kiểm tra ngày đặt
                        if (item.date) {
                            // Chuyển đổi định dạng ngày từ DD-MM-YYYY sang Date object
                            const bookingDate = item.date.split('-').reverse().join('-');
                            const bookingDateTime = new Date(bookingDate);
                            const today = new Date();
                            today.setHours(0, 0, 0, 0); // Đặt thời gian về 00:00:00

                            // Chỉ lấy các đơn từ ngày hôm nay trở đi
                            return bookingDateTime >= today;
                        }
                    }
                    return false;
                }).length > 0 && (
                        <span className="ml-1 text-white bg-red-500 text-xs font-bold rounded-full px-2 py-0.5">
                            {bookings.filter((item: any) => {
                                if (item.status === "Chờ xác nhận") {
                                    if (item.date) {
                                        const bookingDate = item.date.split('-').reverse().join('-');
                                        const bookingDateTime = new Date(bookingDate);
                                        const today = new Date();
                                        today.setHours(0, 0, 0, 0);
                                        return bookingDateTime >= today;
                                    }
                                }
                                return false;
                            }).length}
                        </span>
                    )}
            </Link>,
            path: "/manager/bookingField"
        },
        {
            key: "thongBao",
            label: (
                <Link href="/manager/notification" className="flex items-center gap-2">
                    <BellOutlined />
                    <span>Thông báo</span>
                    {notifications.filter((item: any) => !item.read).length > 0 && (
                        <span className="ml-1 text-white bg-red-500 text-xs font-bold rounded-full px-2 py-0.5">
                            {notifications.filter((item: any) => !item.read).length}
                        </span>
                    )}
                </Link>
            ),
            path: "/manager/notification"
        },
        {
            key: "doiCuaToi",
            label: <Link href="/manager/doiCuaToi"><UserOutlined /> Quản lý nhân viên</Link>,
            path: "/manager/doiCuaToi"
        },
    ];

    useEffect(() => {
        const getData = async () => {
            if (user.isLoggedIn) {
                await dispatch(getListNotificationSlice({ id: user.value.user._id as string, role: "manager" }))
                await dispatch(getListBookingsSlice())
            }
        }
        getData();
    }, [user]);

    // Tìm key hiện tại dựa theo pathname
    const selectedKey = items.find(item => item.path === pathname || "")?.key;

    return (
        <Layout className="min-h-screen">
            <Sider width={220} className="bg-gray-900 text-white">
                <div className="p-5 text-lg font-bold">KichZone</div>
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[selectedKey || "/"]}
                    items={items}
                />
            </Sider>
            <Layout>
                <Header className="bg-white shadow-md px-8">
                    <div className="text-right text-[16px]">
                        <UserOutlined /> Vũ Tiến Long
                    </div>
                </Header>
                {children}
            </Layout>
        </Layout>
    );
};

export default LayoutManager;
