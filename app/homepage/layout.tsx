
'use client';
import React, { useEffect, useState } from 'react';
import { AimOutlined, BellOutlined, CalendarOutlined, HomeOutlined, LoginOutlined, LogoutOutlined, ThunderboltOutlined, TrophyOutlined, UserOutlined, MenuOutlined, CloseOutlined } from "@ant-design/icons";
import { Breadcrumb, Dropdown, Layout, Menu, theme, Drawer, Button } from 'antd';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { signout } from '@/features/auth.slice';
import { RootStateType } from '@/models/type';
import { getListNotificationSlice } from '@/features/notification.slice';
import { AppDispatch } from '@/store/store';
import { Header } from 'antd/es/layout/layout';
import CustomBreadcrumb from '@/components/Breadcrumb';
import { useAppSelector } from '@/store/hook';
import { getListBookingsSlice } from '@/features/booking.slice';
import io from 'socket.io-client';
import { toast } from 'react-toastify';

const { Content, Sider } = Layout;


const LayoutHomepage = ({ children }: { children: React.ReactNode }) => {
  const user = useAppSelector(state => state.auth)
  const notifications = useSelector((state: RootStateType) => state.notification.value)
  const [notification, setNotification] = useState<any>([]);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  const handleLogout = () => {
    console.log("Đăng xuất...");
    dispatch(signout())
    // Xử lý đăng xuất tại đây (xóa token, điều hướng, v.v.)
  };

  const socket = io("http://localhost:8000");
  useEffect(() => {
    socket.on('pushNotification', (data: any) => {
      notifications.filter((item: any) => item.targetUser === data.targetUser).length > 0 && setNotification((prev: any) => [...prev, data]);
    });
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
        const data = await dispatch(getListNotificationSlice({ id: user.value.user._id as string, role: "user" }))
        await dispatch(getListBookingsSlice())
        setNotification(data.payload);
      }
    }
    getData();
  }, [user]);

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();


  const menuUser = [
    {
      key: "thongBao",
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
      path: "/homepage/thongBao",
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
      path: "/manager/quanLiSanBong",
      className: 'bg-red-50 border-l-4 border-red-500 hover:bg-red-100'
    },
    // user.value.user?.role === 2 && {
    //   key: "admin",
    //   label: "Admin",
    //   icon: <UserOutlined />,
    //   path: "/admin",
    // },
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
      key: "timDoi",
      label: "Cáp kèo, tìm đội",
      icon: <ThunderboltOutlined />,
      path: "/homepage/timDoi",
    },
    {
      key: "lichDatSan",
      label: "Lịch đặt sân",
      icon: <CalendarOutlined />,
      path: "/homepage/lichDatSan",
    },
    {
      key: "datSan",
      label: "Đặt sân",
      icon: <AimOutlined />,
      path: "/homepage/datSan",
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
        <div className="flex items-center gap-2 py-4 px-6">
          <Link href={`/`}>
            <img src="/newPts.png" alt="" className="h-12" />
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
        bodyStyle={{ padding: 0 }}
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
