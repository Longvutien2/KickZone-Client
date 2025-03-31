// pages/index.tsx
'use client'
import { getFootballFieldAddress } from '@/api/football_fields'
import { getTeamByUserId } from '@/api/team'
import { setBreadcrumb } from '@/features/breadcrumb.slice'
import { getListMatchesSlice } from '@/features/match.slice'
import { getTeamByUserIdSlice } from '@/features/team.slice'
import { FootballField } from '@/models/football_field'
import { Match } from '@/models/match'
import { Team } from '@/models/team'
import { useAppDispatch, useAppSelector } from '@/store/hook'
import { DownOutlined, FilterOutlined, PlusOutlined } from '@ant-design/icons'
import { Tabs, Select, Button, Pagination } from 'antd'
import 'antd/dist/reset.css'
import moment from 'moment'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

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
const { Option } = Select;


const MainContent = () => {
    const matchs = useAppSelector(state => state.match.value)
    const footballFields = useAppSelector(state => state.footballField.value)
    const [groupedByAddress, setGroupedByAddress] = useState<any>([]);
    const [filteredMatches, setFilteredMatches] = useState<Match[]>([]);
    const [currentPage, setCurrentPage] = useState(1);

    moment.locale('vi');
    const dispatch = useAppDispatch();
    const [value, setValue] = useState<string>(''); // State lưu giá trị được chọn
    // const khuVucData = useAppSelector((state: any) => state.khuVuc.data); // Giả sử khu vực được lưu trong Redux

    const handleChange = (value: string) => {
        setValue(value);
    };

    useEffect(() => {
        const getData = async () => {
            const data = await dispatch(getListMatchesSlice())
            const data2 = await getFootballFieldAddress()
            setGroupedByAddress(data2.data)

        }

        if (value) {
            // Lọc danh sách trận đấu dựa trên địa chỉ sân bóng
            const filtered = matchs.filter((match: Match) => match.footballField?.address === value);
            setFilteredMatches(filtered);
        } else {
            setFilteredMatches(matchs); // Nếu không có địa chỉ nào được chọn, hiển thị tất cả trận đấu
        }
        getData();
    }, [footballFields, value])


    return (
        <>
            {/* Bộ lọc và thống kê */}
            <div className="bg-white shadow rounded-xl px-4 py-3 mx-4 mt-4">
                <div className="flex justify-between items-center w-full">
                    {/* Trái: Khu vực */}
                    <div className="w-70 mb-4">
                        <label className="block text-sm font-medium text-gray-700">Khu vực</label>
                        <Select
                            showSearch
                            value={value}
                            onChange={handleChange}
                            placeholder="Chọn khu vực"
                            className="w-full mt-1"
                            filterOption={(input, option: any) => {
                                return option?.children.toLowerCase().includes(input.toLowerCase());
                            }}
                        >
                            {groupedByAddress.map((item: any, index: number) => (
                                <Select.Option key={index + 1} value={item}>
                                    {item}
                                </Select.Option>
                            ))}
                        </Select>
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
                {filteredMatches.slice((currentPage - 1) * 5, currentPage * 5).map((match: Match) => (
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

            {/* Phân trang với Ant Design */}
            <div className="flex justify-center mt-4">
                <Pagination
                    current={currentPage}  // Trang hiện tại
                    total={filteredMatches.length}  // Tổng số trận đấu
                    pageSize={5}  // Số lượng trận đấu mỗi trang
                    onChange={(page) => setCurrentPage(page)}  // Thay đổi trang
                    hideOnSinglePage={true}  // Ẩn phân trang nếu chỉ có 1 trang
                />
            </div>

        </>
    )
}


const MyTeamTab = () => {
    const router = useRouter()
    const matchs = useAppSelector(state => state.match.value)
    const auth = useAppSelector(state => state.auth)
    const [myTeam, setmyTeam] = useState<Team>();
    const [currentPage, setCurrentPage] = useState(1);

    const handleCreateMatch = () => {
        // Chuyển đến trang tạo trận đấu mới
        router.push('/homepage/timDoi/add') // /create-match là đường dẫn đến trang tạo trận đấu
    }

    useEffect(() => {
        const getData = async () => {
            const data = await getTeamByUserId(auth.value.user._id as string)
            setmyTeam(data.data[0])
        }
        getData()
    }, [])

    console.log("matchs", matchs);
    console.log("myTeam", myTeam);
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
                            <div>
                                {/* Match list */}
                                {
                                    auth.isLoggedIn ?
                                        <div>
                                            <div className="mt-8 px-4 space-y-4 pb-10">
                                                {matchs.slice((currentPage - 1) * 5, currentPage * 5).filter((item: Match) => item.club_A._id === myTeam?._id).map((match: Match) => (
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

                                                <div className="flex justify-center mt-4">
                                                    <Pagination
                                                        current={currentPage}  // Trang hiện tại
                                                        total={matchs.length}  // Tổng số trận đấu
                                                        pageSize={5}  // Số lượng trận đấu mỗi trang
                                                        onChange={(page) => setCurrentPage(page)}  // Thay đổi trang
                                                        hideOnSinglePage={true}  // Ẩn phân trang nếu chỉ có 1 trang
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-center justify-center text-center">
                                                <Button
                                                    type="primary"
                                                    className="bg-orange-500 mt-4 px-6 rounded-full h-10 flex items-center"
                                                    icon={<PlusOutlined className="text-xl mr-1" />}
                                                    onClick={handleCreateMatch} // Gắn sự kiện onclick
                                                >
                                                    Tạo Trận Đấu Mới
                                                </Button>
                                            </div>
                                        </div>
                                        :
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
                                }
                            </div>

                        )
                    },
                    {
                        key: 'away',
                        label: <span className="text-sm font-medium">Vai Trò Đội Khách</span>,
                        children:
                            <div>
                                {/* Match list */}
                                {
                                    <div>
                                        <div className="mt-8 px-4 space-y-4 pb-10">
                                            {
                                                auth.isLoggedIn &&
                                                    matchs.filter((item: Match) => item.club_B?._id === myTeam?._id).length > 0 ?
                                                    matchs.filter((item: Match) => item.club_B?._id === myTeam?._id).map((match: Match) => (
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
                                                    ))
                                                    :
                                                    <div className="flex flex-col items-center justify-center text-center mt-10">
                                                        <p className="text-gray-500 text-sm px-4">
                                                            Bạn chưa được đội nào mời hoặc chưa tham gia vào đội nào.
                                                            <br />
                                                            Hãy tìm kiếm đội để tham gia ngay!
                                                        </p>
                                                    </div>
                                            }
                                        </div>

                                    </div>
                                }
                            </div>
                    }
                ]}
            />
        </div>
    )
}
