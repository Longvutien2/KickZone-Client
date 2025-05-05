// pages/index.tsx
'use client'
import { getTeamByUserId } from '@/api/team'
import { setBreadcrumb } from '@/features/breadcrumb.slice'
import { Team } from '@/models/team'
import { useAppDispatch, useAppSelector } from '@/store/hook'
import { CalendarOutlined, ClockCircleOutlined, DownOutlined, EditOutlined, EnvironmentOutlined, FilterOutlined, PlusOutlined } from '@ant-design/icons'
import { Tabs, Select, Button, Pagination, Card } from 'antd'
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
    <div className="bg-white min-h-screen">
      {/* Header - time only */}
      <h1 className="text-2xl font-semibold mb-4">Hồ sơ</h1>
      <Tabs
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
      />
    </div>
  )
}
const { Option } = Select;


const MainContent = () => {
  const auth = useAppSelector(state => state.auth.value)

  return (
    <>
      <div className="bg-white mx-auto">
        <Card className="text-left mt-8">
          <h3 className="text-xl font-bold mb-3">Thông tin</h3>
          <div className='space-y-2'>
            <div className="flex items-center space-x-3">
              <CalendarOutlined className="text-orange-500" />
              <span className="text-sm text-gray-700 capitalize">
                <strong>Họ tên: </strong>
                {auth.user.name}
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <ClockCircleOutlined className="text-orange-500" />
              <span className="text-sm text-gray-700">
                <strong>Email: </strong>{auth.user.email}
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <EditOutlined className="text-orange-500" />
              <span className="text-sm text-gray-700"><strong>Liên hệ: </strong> {auth.user?.contact}</span>
            </div>

            <div >
              <img
                src={auth.user?.image || 'https://picsum.photos/200'}
                alt="avatar"
                width={150}
                height={150}
                className='rounded-xl object-cover w-[100px] h-[100px] shadow-md'
              />
            </div>
          </div>
        </Card>

        <div className="mt-6">
          <div className="flex items-center space-x-2 gap-4">
            <Button type="primary" className="bg-orange-500 text-white" >
              <Link href={`/homepage/profile/${auth.user._id}`} >Chỉnh sửa cá nhân</Link>
            </Button>
            <Button type="primary" className="bg-orange-500 text-white" >
              <Link href={`/homepage/profile/changePassword/${auth.user._id}`} >Đổi mật khẩu</Link>
            </Button>
          </div>
        </div>
      </div>
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
