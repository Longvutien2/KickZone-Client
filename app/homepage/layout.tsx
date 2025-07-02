
'use client';
import React, { useEffect, useState } from 'react';
import { AimOutlined, BellOutlined, CalendarOutlined, HomeOutlined, LoginOutlined, LogoutOutlined, ThunderboltOutlined, TrophyOutlined, UserOutlined, MenuOutlined, CloseOutlined } from "@ant-design/icons";
import { Breadcrumb, Dropdown, Layout, Menu, theme, Drawer, Button } from 'antd';
import Link from 'next/link';
import Image from 'next/image';
import { useDispatch, useSelector } from 'react-redux';
import { signout } from '@/features/auth.slice';
import { RootStateType } from '@/models/type';
import { getListNotificationSlice } from '@/features/notification.slice';
import { AppDispatch } from '@/store/store';
import { Header } from 'antd/es/layout/layout';
import CustomBreadcrumb from '@/components/Breadcrumb';
import { useAppSelector } from '@/store/hook';
import useRealtimeNotifications from '@/hooks/useRealtimeNotifications';

const { Content, Sider } = Layout;


const LayoutHomepage = ({ children }: { children: React.ReactNode }) => {
  const user = useAppSelector(state => state.auth)
  const notifications = useSelector((state: RootStateType) => state.notification.value)
  const [notification, setNotification] = useState<any>([]);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dispatch = useDispatch<AppDispatch>();


  // Sử dụng hook realtime notifications cho tất cả các loại thông báo (chỉ âm thanh + toast, không có dropdown)
  useRealtimeNotifications({
    userId: user.isLoggedIn ? user.value.user._id : undefined,
    onNewMatchRequest: (data) => {
      // Dispatch custom event để các page có thể lắng nghe và refresh data
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('newMatchRequest', { detail: data }));
      }
    },
    onMatchRequestStatusUpdate: (data) => {
      // Dispatch custom event để các page có thể lắng nghe và refresh data
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('matchRequestStatusUpdate', { detail: data }));
      }
    },
    onMatchRequestUpdate: (data) => {
      // Dispatch custom event để các page có thể lắng nghe và refresh data
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('matchRequestUpdate', { detail: data }));
      }
    },
    onMatchRequestDeleted: (data) => {
      // Dispatch custom event để các page có thể lắng nghe và refresh data
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('matchRequestDeleted', { detail: data }));
      }
    },
  });


  useEffect(() => {
    const getData = async () => {
      if (user.isLoggedIn && user.value.user._id) {
        const data = await dispatch(getListNotificationSlice({ id: user.value.user._id as string, role: "user" }))
        setNotification(data.payload);
      }
    }
    getData();
  }, [user.isLoggedIn, user.value.user._id]); // ✅ Chỉ depend vào login status và user ID

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();


  const menuUser = [
    {
      key: "notification",
      label: "",
      icon: <div className='flex items-center gap-2'>
        <BellOutlined />
        <span>
          Thông báo
        </span>
        {notification.length > 0 &&
          <div>
            <span className=" text-white bg-red-500 text-xs font-bold rounded-full px-2 py-1">
              {notification.filter((item: any) => !item.read).length}
            </span>
          </div>
        }
      </div>,
      path: "/homepage/notification",
    },
    user.value.user?.role === 0 && {
      key: "newField",
      label: "Tạo sân bóng",
      icon: <UserOutlined />,
      path: "/addField",
    },
    (user.value.user?.role === 1 || user.value.user?.role === 2) && {
      key: "manager",
      label: <div className='font-semibold text-red-500 flex items-center gap-2'>
        Quản lý sân bóng
      </div>,
      icon: <UserOutlined />,
      path: "/manager/orders-schedule",
      className: 'bg-red-50 border-l-4 border-red-500 hover:bg-red-100'
    },
  ]
  // Tạo mảng items chứa thông tin menu
  const items = [
    {
      key: "home",
      label: "Trang chủ",
      icon: <HomeOutlined />,
      path: "/",
    },
    {
      key: "find-opponent",
      label: "Cáp kèo, tìm đội",
      icon: <ThunderboltOutlined />,
      path: "/homepage/find-opponent",
    },
    {
      key: "booking-history",
      label: "Lịch đặt sân",
      icon: <CalendarOutlined />,
      path: "/homepage/booking-history",
    },
    {
      key: "book-field",
      label: "Đặt sân",
      icon: <AimOutlined />,
      path: "/homepage/book-field",
    },
    ...user.isLoggedIn ? menuUser : [],
  ].filter(Boolean);


  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Desktop Sidebar */}
      <Sider
        width={"15%"}
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        style={{ backgroundColor: "white" }}
        className="bg-white hidden lg:block"
      >
        <div className={`py-4 ${collapsed ? 'px-2 flex justify-center' : 'px-6'}`}>
          <Link href={`/`}>
            {collapsed ?
              <Image
                src="/logo.jpg"
                alt="KichZone Logo"
                width={32}
                height={32}
              />
              :
              <Image
                src="/newPts.png"
                alt="KichZone Logo"
                width={150}
                height={150}
              />

            }
          </Link>
        </div>
        <div className="flex flex-col h-full">
          <Menu
            theme="light"
            defaultSelectedKeys={["home"]}
            mode="inline"
            items={items.map((item: any) => ({
              key: item.key,
              label: (
                <Link href={item.path} className="flex items-center">
                  <span className="ml-2">{item.label}</span>
                </Link>
              ),
              icon: item.icon,
              className: item.className || '',
            }))}
          />
        </div>
      </Sider>

      {/* Mobile Drawer */}
      <Drawer
        title={
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src="/newPts.png" alt="" className="h-8" />
            </div>
          </div>
        }
        placement="left"
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        width={280}
        className="lg:hidden"
        styles={{ body: { padding: 0 } }}
      >
        <div className="flex flex-col h-full">
          <Menu
            theme="light"
            defaultSelectedKeys={["home"]}
            mode="inline"
            items={items.map((item: any) => ({
              key: item.key,
              label: (
                <Link
                  href={item.path}
                  className="flex items-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="ml-2">{item.label}</span>
                </Link>
              ),
              icon: item.icon,
              className: item.className || '',
            }))}
            style={{ border: 'none' }}
          />

          {/* User section in mobile menu */}
          {user.isLoggedIn && (
            <div className="mt-auto p-4 border-t border-gray-200">
              <div
                onClick={() => {
                  setMobileMenuOpen(false);
                }}
              >
                <Link href={`/homepage/profile`} className="flex items-center gap-3 mb-4">
                  <UserOutlined className="text-lg" />
                  <span className="font-medium">{user?.value.user?.name}</span>
                </Link>
              </div>

              {/* <Button
                type="primary"
                danger
                block
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
              >
                Đăng xuất
              </Button> */}
            </div>
          )}
        </div>
      </Drawer>

      <Layout>
        <style dangerouslySetInnerHTML={{
          __html: `
            /* Đổi màu trigger button của Sider thành cam */
            .ant-layout-sider-trigger {
              background-color: #E5E7EB !important;
              color: black !important;
            }
            .ant-layout-sider-trigger:hover {
              background-color: #D1D5DC !important;
            }
          `
        }} />
        <Header className="bg-white px-4 lg:px-8 flex items-center justify-between">
          {/* Mobile Menu Button */}
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden text-lg"
          />

          {/* Logo for mobile */}
          <div className="lg:hidden flex items-center gap-2">
            <img src="/newPts.png" alt="" className="h-8" />
          </div>

          {/* User section */}
          <div className="ml-auto">
            {user.isLoggedIn ? (
              <div className="hidden lg:block text-right text-[16px]">
                <Link href={`/homepage/profile`}>
                  <UserOutlined /> {user?.value.user?.name}
                </Link>
              </div>
            ) : (
              <div className="text-right text-[16px] font-semibold hover:text-blue-500 hover:cursor-pointer">
                <Link href={`/auth/login`} className="gap-2">
                  <LoginOutlined className="" />
                  <span className="hidden sm:inline"> Đăng nhập</span>
                </Link>
              </div>
            )}
          </div>
        </Header>
        <Content className="m-0 sm:m-4 lg:m-5">
          <div className="hidden sm:block">
            <CustomBreadcrumb />
          </div>
          <div
            className="p-2 sm:p-4 lg:p-6 min-h-[360px] bg-white rounded-none sm:rounded-lg"
            style={{
              background: colorBgContainer,
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
