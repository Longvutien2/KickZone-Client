'use client';
import { Layout, Menu } from "antd";
import "dayjs/locale/vi";
import Link from "next/link";
import { AimOutlined, BellFilled, BellOutlined, HomeOutlined, ThunderboltOutlined, TrophyOutlined, UserOutlined } from '@ant-design/icons';
import { useAppSelector } from "@/store/hook";

const { Header, Sider, } = Layout;

const getItem = (label: string, key: string, icon: React.ReactNode, path: string) => ({
    key,
    label,
    icon,
    path
});



const LayoutManager = ({ children }: { children: React.ReactNode }) => {
    const notifications = useAppSelector(state => state.notification.value)

    const items = [
        getItem("Trang chủ", "home", <Link href="/"> <HomeOutlined /></Link>, "/timDoi"),
        getItem("Quản lý loại sân", "listField", <Link href="/manager/field"> <ThunderboltOutlined /></Link>, "/listField"),
        getItem("Sân bóng của tôi", "myField", <Link href="/manager/myField"> <ThunderboltOutlined /></Link>, "/myField"),
        getItem("Quản lý sân bóng", "quanLiSanBong", <Link href="/manager/quanLiSanBong"> <TrophyOutlined /></Link>, "/quanLiSanBong"),
        getItem("Quản lý yêu cầu", "datSan", <Link href="/datSan"> <AimOutlined /></Link>, "/datSan"),
        getItem(
            "",
            "thongBao",
            <Link href="/manager/notification" className="flex items-center">
                <BellOutlined />
                <span>Thông báo</span>
                {notifications.length > 0 &&
                    <span className="ml-2 text-white bg-red-500 text-xs font-bold rounded-full px-2 py-1">
                        {notifications.filter((item:any) => item.actor === "manager").filter((item: any) => !item.read).length}
                    </span>
                }
            </Link>,
            "/thongBao"
        ),
        getItem("Quản lý nhân viên", "doiCuaToi", <UserOutlined />, "/doiCuaToi"),
    ];


    return (
        <Layout className="min-h-screen">
            <Sider width={200} className="bg-gray-900 text-white">
                <div className="p-5 text-lg font-bold">STBall</div>
                <Menu
                    theme="dark"
                    defaultSelectedKeys={["quanLiSanBong"]}
                    mode="inline"
                    items={items}
                />
            </Sider>
            <Layout>
                <Header className="bg-white shadow-md px-8 ">
                    <div className="my-auto  text-right text-[16px] "><UserOutlined /> Vũ Tiến Long</div>
                </Header>
                {children}
            </Layout>
        </Layout>
    );
}

export default LayoutManager;
