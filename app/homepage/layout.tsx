
'use client';
import React, { useEffect, useState } from 'react';
import { AimOutlined, BellOutlined, HomeOutlined, LoginOutlined, LogoutOutlined, ThunderboltOutlined, TrophyOutlined, UserOutlined } from "@ant-design/icons";
import { Breadcrumb, Dropdown, Layout, Menu, theme } from 'antd';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { signout } from '@/features/auth.slice';
import { RootStateType } from '@/models/type';
import { getListNotificationSlice } from '@/features/notification.slice';
import { AppDispatch } from '@/store/store';
import { Header } from 'antd/es/layout/layout';
import CustomBreadcrumb from '@/components/Breadcrumb';

const { Content, Sider } = Layout;


const getItem = (label: string, key: string, icon: React.ReactNode, path: string) => ({
  key,
  label,
  icon,
  path
});

const LayoutHomepage = ({ children }: { children: React.ReactNode }) => {
  const user = useSelector((state: any) => state.auth)
  const notifications = useSelector((state: RootStateType) => state.notification.value)

  const [collapsed, setCollapsed] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  const handleLogout = () => {
    console.log("Đăng xuất...");
    dispatch(signout())
    // Xử lý đăng xuất tại đây (xóa token, điều hướng, v.v.)
  };

  const menu = (
    <Menu style={{ width: '150px' }}>
      <Menu.Item key="logout" onClick={handleLogout} icon={<LogoutOutlined />}>
        Đăng xuất
      </Menu.Item>
    </Menu>
  );


  const items = [
    getItem("Trang chủ", "home", <Link href="/"><HomeOutlined /></Link>, "/home"),
    getItem("Cáp kèo, tìm đội", "timDoi", <Link href="/homepage/timDoi"><ThunderboltOutlined /></Link>, "/timDoi"),
    getItem("Bảng xếp hạng", "xepHang", <Link href="/xepHang"><TrophyOutlined /></Link>, "/xepHang"),
    getItem("Đặt sân", "datSan", <Link href="/homepage"><AimOutlined /></Link>, "/datSan"),
    getItem(
      "",
      "thongBao",
      <Link href="/homepage/thongBao" className="flex items-center">
        <BellOutlined className="" />
        <span >Thông báo</span>
        {notifications.length > 0 &&
          <span className="ml-2 text-white bg-red-500 text-xs font-bold rounded-full px-2 py-1">
            {notifications.filter((item: any) => item.actor === "user").filter((item: any) => !item.read).length}
          </span>
        }
      </Link>,
      "/thongBao"
    ),
    getItem("Đội của tôi", "doiCuaToi", <Link href="/homepage/myTeam"><UserOutlined /></Link>, "/doiCuaToi"),
    user.value.user.role === 1 ?
      getItem("", "manager",
        <Link href="/manager/quanLiSanBong" className="flex items-center">
          <BellOutlined className="" />
          <span >Quản lí sân bóng</span>
          {notifications.length > 0 &&
            <span className="ml-2 text-white bg-red-500 text-xs font-bold rounded-full px-2 py-1">
              {notifications.filter((item: any) => item.actor === "manager").filter((item: any) => !item.read).length}
            </span>
          }
        </Link>,
        "/manager") :
      getItem("Tạo sân bóng", "myField/add", <Link href="/addField"><TrophyOutlined /></Link>, "/myField/add")
  ].filter(Boolean); // Lọc bỏ những phần tử null hoặc undefined

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  useEffect(() => {
    const getData = async () => {
      await dispatch( (user.value.user))
    }
    getData();
  }, [user]);  

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={"15%"} collapsible collapsed={collapsed} onCollapse={setCollapsed} style={{ backgroundColor: "white" }} className="bg-white">
        <div className="flex items-center  gap-2 py-4 px-6">
          <Link href={`/`}>  <img src="/newPts.png" alt="" className="h-12" /></Link>
        </div>
        <div className="flex flex-col h-full">
          <Menu
            theme="light"
            defaultSelectedKeys={["home"]}
            mode="inline"
            items={items}
          />
        </div>
      </Sider>
      <Layout>
        <Header className="bg-white  px-8 ">
          <div>
            {
              user.isLoggedIn ?
                <div className="my-auto  text-right text-[16px] ">
                  <div>
                    <UserOutlined /> {user?.value.user.name}
                  </div>
                  {/* </Dropdown> */}
                </div>
                :
                <div className="my-auto  text-right text-[16px]  font-semibold hover:text-blue-500 hover:cursor-pointer">
                  <Link href={`/auth/login`} className='gap-2' >
                    <LoginOutlined className="" />
                    <span> Đăng nhập</span>
                  </Link>
                </div>
            }
          </div>
        </Header>
        <Content style={{ margin: '20px' }}>
          <CustomBreadcrumb />
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <div>{children}</div>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default LayoutHomepage;