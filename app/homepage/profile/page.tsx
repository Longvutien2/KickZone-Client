// pages/index.tsx
'use client'
import { getTeamByUserId } from '@/api/team'
import { setBreadcrumb } from '@/features/breadcrumb.slice'
import { signout } from '@/features/auth.slice'
import { Team } from '@/models/team'
import { useAppDispatch, useAppSelector } from '@/store/hook'
import { CalendarOutlined, ClockCircleOutlined, DownOutlined, EditOutlined, EnvironmentOutlined, FilterOutlined, PlusOutlined } from '@ant-design/icons'
import { Tabs, Select, Button, Pagination, Card, Modal } from 'antd'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import 'antd/dist/reset.css'
import moment from 'moment'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import dayjs from 'dayjs';

export default function HomeProFile() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setBreadcrumb([
      { name: 'Home', url: '/' },
      { name: 'Hồ sơ', url: '/homepage/profile' },
    ]));
  }, [])


  return (
    <div className="bg-white min-h-screen px-4 sm:px-0">
      {/* Header - time only */}
      <h1 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">Hồ sơ</h1>
      <MainContent />
      {/* <Tabs
        defaultActiveKey="1"
        centered
        className="border-gray-200"
        tabBarGutter={48}
        tabBarStyle={{ marginBottom: 0 }}
        items={[
          {
            key: "1",
            label: <span className="text-base font-medium">Cá nhân</span>,
            children: <MainContent />
          },
          {
            key: "2",
            label: <span className="text-base font-medium">Câu lạc bộ</span>,
            children: <MyTeamTab />
          }
        ]}
      /> */}
    </div>
  )
}
const { Option } = Select;


const MainContent = () => {
  const auth = useAppSelector(state => state.auth.value)
  const dispatch = useAppDispatch()
  const router = useRouter()
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false)

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('handleLogout called') // Debug log
    setIsLogoutModalVisible(true)
  }

  const confirmLogout = () => {
    console.log('Đăng xuất thành công')
    dispatch(signout())
    router.push('/')
    setIsLogoutModalVisible(false)
  }

  const cancelLogout = () => {
    console.log('Hủy đăng xuất')
    setIsLogoutModalVisible(false)
  }
  return (
    <>
      <div className="bg-white mx-auto">
        <Card className="text-left mt-6 sm:mt-8 rounded-lg sm:rounded-xl">
          <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Thông tin</h3>
          <div className='space-y-3 sm:space-y-4'>
            <div className="flex items-start sm:items-center space-x-3">
              <CalendarOutlined className="text-orange-500 mt-0.5 sm:mt-0 flex-shrink-0" />
              <span className="text-xs sm:text-sm text-gray-700 capitalize break-words">
                <strong>Họ tên: </strong>
                {auth.user.name}
              </span>
            </div>

            <div className="flex items-start sm:items-center space-x-3">
              <ClockCircleOutlined className="text-orange-500 mt-0.5 sm:mt-0 flex-shrink-0" />
              <span className="text-xs sm:text-sm text-gray-700 break-words">
                <strong>Email: </strong>{auth.user.email}
              </span>
            </div>

            <div className="flex items-start sm:items-center space-x-3">
              <EditOutlined className="text-orange-500 mt-0.5 sm:mt-0 flex-shrink-0" />
              <span className="text-xs sm:text-sm text-gray-700 break-words">
                <strong>Liên hệ: </strong> {auth.user?.contact}
              </span>
            </div>

            <div className="flex justify-center sm:justify-start">
              <img
                src={auth.user?.image || 'https://picsum.photos/200'}
                alt="avatar"
                width={150}
                height={150}
                className='rounded-xl object-cover w-20 h-20 sm:w-[100px] sm:h-[100px] shadow-md'
              />
            </div>
          </div>
        </Card>

        <div className="mt-4 sm:mt-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Button
              type="primary"
              className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600"
              size="large"
            >
              <Link href={`/homepage/profile/${auth.user._id}`} className="block w-full">
                <span className="hidden sm:inline">Chỉnh sửa cá nhân</span>
                <span className="sm:hidden">Chỉnh sửa</span>
              </Link>
            </Button>
            <Button
              type="primary"
              className="w-full sm:w-auto bg-green-500 hover:bg-green-600"
              size="large"
            >
              <Link href={`/homepage/profile/changePassword/${auth.user._id}`} className="block w-full">
                <span>Đổi mật khẩu</span>
              </Link>
            </Button>
            <Button
              type="primary"
              className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white"
              size="large"
              onClick={handleLogout}
            >
              Đăng xuất
            </Button>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <Modal
        title="Xác nhận đăng xuất"
        open={isLogoutModalVisible}
        onOk={confirmLogout}
        onCancel={cancelLogout}
        okText="Đăng xuất"
        cancelText="Hủy"
        okType="danger"
        centered
      >
        <div className="flex items-center space-x-3">
          <ExclamationCircleOutlined className="text-orange-500 text-xl" />
          <span>Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?</span>
        </div>
      </Modal>
    </>
  )
}


const MyTeamTab = () => {
  const router = useRouter()
  const auth = useAppSelector(state => state.auth)
  const [teams, setTeams] = useState<Team[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  dayjs.locale("vi");

  const handleCreateMatch = () => {
    // Chuyển đến trang tạo trận đấu mới
    router.push('/homepage/profile/myTeam/add') // /create-match là đường dẫn đến trang tạo trận đấu
  }

  useEffect(() => {
    const getData = async () => {
      const data = await getTeamByUserId(auth.value.user._id as string)
      console.log("datadatadata", data);

      setTeams(data?.data)
    }
    getData()
  }, [])

  console.log("teams", teams);

  return (
    <div className="mt-8">
      <Card className="text-left mt-8">
        <h3 className="text-xl font-bold mb-3">Danh sách câu lạc bộ</h3>
        <div>
          {
            auth.isLoggedIn &&
            <div>
              <div className="">
                {teams?.slice((currentPage - 1) * 5, currentPage * 5).map((team: any) => (
                  <div key={team._id} className="bg-white p-4 shadow-sm mb-8 rounded-xl hover:shadow-md">
                    <Link href={`/homepage/profile/myTeam/${team._id}`} className='hover:text-black '>
                      <div>
                        <div className="flex items-center space-x-3">
                          <div className="relative w-12 h-12">
                            <Image
                              src={team.teamImage || ""}
                              className="rounded-full object-cover"
                              layout="fill"  // Lấp đầy toàn bộ container
                              alt="bg"
                            />
                          </div>
                          <div className="font-semibold text-sm">{team.teamName}</div>
                        </div>
                        <div className='flex items-center space-x-3 text-sm mt-2 text-orange-500'>
                          <span className="border border-orange-400 rounded-full px-2 py-0.5 text-xs">{team?.ageGroup}</span>
                          <span>⚡ 99</span>
                          <span>⭐ ?</span>
                          <span>👍 100</span>
                        </div>
                      </div>

                      {/* Time + location */}
                      <div className="mt-4">
                        <div><strong>Thành viên: </strong>{team?.members.length}</div>
                        <div><strong>Ngày thành lập: </strong>{moment(team?.createdAt).format('DD/MM/YYYY')}</div>

                      </div>
                    </Link>
                  </div>
                ))}

                <div className="flex justify-center mt-4">
                  <Pagination
                    current={currentPage}  // Trang hiện tại
                    // total={matchs.length}  // Tổng số trận đấu
                    pageSize={5}  // Số lượng trận đấu mỗi trang
                    onChange={(page) => setCurrentPage(page)}  // Thay đổi trang
                    hideOnSinglePage={true}  // Ẩn phân trang nếu chỉ có 1 trang
                  />
                </div>
              </div>


            </div>

          }
        </div>
      </Card>
      {/* Nút tạo CLB mới */}
      <div className="flex flex-col items-center justify-center text-center">
        <Button
          type="primary"
          className="bg-orange-500 mt-4 px-6 rounded-full h-10 flex items-center"
          icon={<PlusOutlined />}
          onClick={handleCreateMatch} // Gắn sự kiện onclick
        >
          Tạo đội bóng mới
        </Button>
      </div>
    </div>
  )
}
