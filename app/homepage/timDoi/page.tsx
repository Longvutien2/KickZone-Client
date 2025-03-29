// pages/index.tsx
'use client'
import { setBreadcrumb } from '@/features/breadcrumb.slice'
import { getListMatchesSlice } from '@/features/match.slice'
import { Match } from '@/models/match'
import { useAppDispatch, useAppSelector } from '@/store/hook'
import { DownOutlined, FilterOutlined, PlusOutlined } from '@ant-design/icons'
import { Tabs, Select, Button } from 'antd'
import 'antd/dist/reset.css'
import moment from 'moment'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Home() {
    const dispatch = useAppDispatch();
    useEffect(() => {
        dispatch(setBreadcrumb([
            { name: 'Home', url: '/' },
            { name: 'Tìm đối', url: '/homepage/timDoi' },
        ]));
    }, [])

    return (
        <div className="bg-white min-h-screen">
            {/* Header - time only */}
            <h1 className="text-2xl font-semibold mb-4">Tìm đối</h1>
            <Tabs
                defaultActiveKey="1"
                centered
                className="border-gray-200"
                tabBarGutter={48}
                tabBarStyle={{ marginBottom: 0 }}
                items={[
                    {
                        key: "1",
                        label: <span className="text-base font-medium">Cộng Đồng</span>,
                        children: <MainContent />
                    },
                    {
                        key: "2",
                        label: <span className="text-base font-medium">Của Tôi</span>,
                        children: <MyTeamTab />
                    }
                ]}
            />
        </div>
    )
}

const MainContent = () => {
    const matchs = useAppSelector(state => state.match.value)
    moment.locale('vi');
    const dispatch = useAppDispatch();

    useEffect(() => {
        const getData = async () => {
            const data = await dispatch(getListMatchesSlice())
        }
        getData();
    }, [])

    return (
        <>
            {/* Khu vực + Bộ lọc */}
            {/* Bộ lọc và thống kê */}
            <div className="bg-white shadow rounded-xl px-4 py-3 mx-4 mt-4">
                <div className="flex justify-between items-center">
                    {/* Trái: Khu vực */}
                    <div>
                        <div className="text-xs text-gray-500 mb-1">Khu vực</div>
                        <Select
                            defaultValue="Hà Nội"
                            suffixIcon={<DownOutlined />}
                            className="w-36"
                            size="middle"
                        />
                    </div>

                    {/* Phải: Thống kê */}
                    <div className="flex space-x-4">
                        <div className="text-right">
                            <div className="text-orange-500 text-lg font-bold leading-none">683</div>
                            <div className="text-xs text-gray-500">Người chơi</div>
                        </div>
                        <div className="text-right">
                            <div className="text-orange-500 text-lg font-bold leading-none">1055</div>
                            <div className="text-xs text-gray-500">Câu lạc bộ</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Match list */}
            <div className="mt-8 px-4 space-y-4 pb-10">
                {matchs.map((match: Match) => (
                    <div key={match._id} className="bg-white p-4 shadow-md rounded-xl">
                        <Link href={`/homepage/timDoi/${match._id}`}>
                            {/* 3 phần: Đội A - VS - Đội B */}
                            <div className="grid grid-cols-3 items-center mb-2">
                                {/* Đội A */}
                                <div>
                                    <div className="flex items-center space-x-3">
                                        <div className="relative w-12 h-12">
                                            <Image
                                                src={match.club_A?.teamImage || ""}
                                                className="rounded-full object-cover"
                                                layout="fill"  // Lấp đầy toàn bộ container
                                                alt="bg"
                                            />
                                        </div>
                                        <div className="font-semibold text-sm">{match.club_A?.teamName}</div>
                                    </div>
                                    <div className='flex items-center space-x-3 text-sm mt-2 text-orange-500'>
                                        <span className="border border-orange-400 rounded-full px-2 py-0.5 text-xs">{match.club_A?.ageGroup}</span>
                                        <span>⚡ 99</span>
                                        <span>⭐ ?</span>
                                        <span>👍 100</span>
                                    </div>
                                </div>

                                {/* VS */}
                                <div className="text-center text-3xl font-bold">VS</div>

                                {/* Đội B nếu có */}
                                {match.club_B ? (
                                    <div>
                                        <div className="flex items-center justify-end space-x-3">
                                            <div className="font-semibold text-sm">{match.club_B?.teamName}</div>
                                            <div className="relative w-12 h-12">
                                                <Image
                                                    src={match.club_B?.teamImage || ""}
                                                    className="rounded-full object-cover"
                                                    layout="fill"  // Lấp đầy toàn bộ container
                                                    alt="bg"
                                                />
                                            </div>
                                        </div>
                                        <div className='flex items-center justify-end space-x-3 text-sm mt-2 text-orange-500'>
                                            <span className="border border-orange-400 rounded-full px-2 py-0.5 text-xs">{match.club_B?.ageGroup}</span>
                                            <span>⚡ 99</span>
                                            <span>⭐ ?</span>
                                            <span>👍 100</span>
                                        </div>
                                    </div>

                                ) : (
                                    <div className="flex flex-col items-end text-right">
                                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-lg text-gray-500">
                                            ?
                                        </div>
                                        <div className="text-xs text-gray-400 mt-1">Chưa có đối thủ</div>
                                    </div>
                                )}
                            </div>

                            {/* Time + location */}
                            <div className="mt-3 text-sm text-gray-700">
                                <div className="flex items-center justify-between">
                                    <span className='capitalize'>{match.time} | {moment(match.date).format('dddd, DD/MM/YYYY')}</span>
                                    <span className="bg-orange-100 text-orange-500 rounded-md px-2 text-xs">
                                        {match.time} ngày nữa
                                    </span>
                                </div>
                                <div>{match.footballField?.name}, {match.footballField?.address}</div>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>

        </>
    )
}


const MyTeamTab = () => {
    const router = useRouter()

    const handleCreateMatch = () => {
        // Chuyển đến trang tạo trận đấu mới
        router.push('/homepage/timDoi/add') // /create-match là đường dẫn đến trang tạo trận đấu
    }

    return (
        <div className="mt-6 px-4">
            <Tabs
                defaultActiveKey="home"
                centered
                tabBarGutter={40}
                items={[
                    {
                        key: 'home',
                        label: <span className="text-sm font-medium">Vai Trò Đội Nhà</span>,
                        children: (
                            <div className="flex flex-col items-center justify-center text-center mt-10">
                                <p className="text-gray-500 mb-2 text-sm">Chưa có trận đấu nào? Bắt đầu tạo trận đấu mới để tham gia vào bảng xếp hạng của Sporta ngay!</p>
                                <Button
                                    type="primary"
                                    className="bg-orange-500 mt-4 px-6 rounded-full h-10 flex items-center"
                                    icon={<PlusOutlined className="text-xl mr-1" />}
                                    onClick={handleCreateMatch} // Gắn sự kiện onclick
                                >
                                    Tạo Trận Đấu Mới
                                </Button>
                            </div>
                        )
                    },
                    {
                        key: 'away',
                        label: <span className="text-sm font-medium">Vai Trò Đội Khách</span>,
                        children: <div className="flex flex-col items-center justify-center text-center mt-10">
                            <p className="text-gray-500 text-sm px-4">
                                Bạn chưa được đội nào mời hoặc chưa tham gia vào đội nào.
                                <br />
                                Hãy tìm kiếm đội để tham gia ngay!
                            </p>
                        </div>
                    }
                ]}
            />
        </div>
    )
}
