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
import { useAppSelector } from "@/store/hook";
import { usePathname } from "next/navigation";

const { Header, Sider } = Layout;

const LayoutManager = ({ children }: { children: React.ReactNode }) => {
    const pathname = usePathname();
    const notifications = useAppSelector(state => state.notification.value);

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
            label: <Link href="/manager/bookingField"><AimOutlined /> Quản lý yêu cầu</Link>,
            path: "/manager/bookingField"
        },
        {
            key: "thongBao",
            label: (
                <Link href="/manager/notification" className="flex items-center gap-2">
                    <BellOutlined />
                    <span>Thông báo</span>
                    {notifications.filter((item: any) => item.actor === "manager" && !item.read).length > 0 && (
                        <span className="ml-1 text-white bg-red-500 text-xs font-bold rounded-full px-2 py-0.5">
                            {notifications.filter((item: any) => item.actor === "manager" && !item.read).length}
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

    // Tìm key hiện tại dựa theo pathname
    const selectedKey = items.find(item => item.path === pathname || "")?.key;

    return (
        <Layout className="min-h-screen">
            <Sider width={200} className="bg-gray-900 text-white">
                <div className="p-5 text-lg font-bold">STBall</div>
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
