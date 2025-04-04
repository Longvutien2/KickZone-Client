
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
import { useAppSelector } from '@/store/hook';

const { Content, Sider } = Layout;


const LayoutHomepage = ({ children }: { children: React.ReactNode }) => {
  const user = useAppSelector(state => state.auth)
  const notifications = useSelector((state: RootStateType) => state.notification.value)
  console.log("notifications", notifications);

  const [collapsed, setCollapsed] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  const handleLogout = () => {
    console.log("Đăng xuất...");
    dispatch(signout())
    // Xử lý đăng xuất tại đây (xóa token, điều hướng, v.v.)
  };

  const convertRole = (role: number) => {
    switch (role) {
      case 0:
        return "user";
      case 1:
        return "manager";
      case 2:
        return "admin";
      default:
        return "unknown"; // Hoặc có thể trả về null nếu không xác định
    }
  };

  useEffect(() => {
    const getData = async () => {
      user.isLoggedIn && await dispatch(getListNotificationSlice({ id: user.value.user._id as string, role: "user" }))
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
        {notifications.length > 0 &&
          <div>
            <span className=" text-white bg-red-500 text-xs font-bold rounded-full px-2 py-1">
               {notifications.filter((item: any) => !item.read).length}
               </span>
          </div>
        }
      </div>,
      path: "/homepage/thongBao",
    },
    user.value.user.role === 0 && {
      key: "newField",
      label: "Tạo sân bóng",
      icon: <UserOutlined />,
      path: "/addField",
    },
    user.value.user.role === 1 || user.value.user.role === 2 && {
      key: "manager",
      label: "Quản lí sân bóng",
      icon: <UserOutlined />,
      path: "/manager/quanLiSanBong",
    },
    user.value.user.role === 2 && {
      key: "admin",
      label: "Admin",
      icon: <UserOutlined />,
      path: "/admin",
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
      key: "timDoi",
      label: "Cấp kèo, tìm đội",
      icon: <ThunderboltOutlined />,
      path: "/homepage/timDoi",
    },
    {
      key: "ranking",
      label: "Bảng xếp hạng",
      icon: <TrophyOutlined />,
      path: "/homepage/ranking",
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
      <Sider width={"15%"} collapsible collapsed={collapsed} onCollapse={setCollapsed} style={{ backgroundColor: "white" }} className="bg-white">
        <div className="flex items-center  gap-2 py-4 px-6">
          <Link href={`/`}>  <img src="/newPts.png" alt="" className="h-12" /></Link>
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
              icon: item.icon, // Lưu lại icon trong items
            }))}
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