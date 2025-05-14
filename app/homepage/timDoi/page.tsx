// pages/index.tsx
'use client'
import { getFootballFieldAddress } from '@/api/football_fields'
import { getTeamByUserId } from '@/api/team'
import { setBreadcrumb } from '@/features/breadcrumb.slice'
import { getListMatchByFootballFieldIdSlice, getListMatchesSlice } from '@/features/match.slice'
import { Match } from '@/models/match'
import { Team } from '@/models/team'
import { useAppDispatch, useAppSelector } from '@/store/hook'
import { CalendarOutlined, ClockCircleOutlined, DownOutlined, EnvironmentOutlined, FilterOutlined, PlusOutlined } from '@ant-design/icons'
import { Tabs, Select, Button, Pagination, DatePicker, TimePicker, Dropdown, Menu, Space } from 'antd'
import 'antd/dist/reset.css'
import moment from 'moment'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import dayjs from 'dayjs';
import { FootballField } from '@/models/football_field'
import { getListTimeSlotsByFootballFieldId } from "@/features/timeSlot.slice";
import { TimeSlot } from "@/models/field";

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
    const footballFields = useAppSelector(state => state.footballField.detail) as FootballField
    const [groupedByAddress, setGroupedByAddress] = useState<any>([]);
    const [filteredMatches, setFilteredMatches] = useState<Match[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedDate, setSelectedDate] = useState<any>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [filtersVisible, setFiltersVisible] = useState(false);
    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

    moment.locale('vi');
    const dispatch = useAppDispatch();
    const [value, setValue] = useState<string>(''); // State lưu giá trị khu vực được chọn

    const handleDateChange = (date: any) => {
        setSelectedDate(date);
    };

    const handleTimeChange = (time: string) => {
        setSelectedTime(time);
    };

    const toggleFilters = () => {
        setFiltersVisible(!filtersVisible);
    };

    const clearFilters = () => {
        setValue('');
        setSelectedDate(null);
        setSelectedTime(null);
    };

    // Lấy danh sách timeslot khi component mount hoặc khi footballField thay đổi
    useEffect(() => {
        const getTimeSlots = async () => {
            if (footballFields?._id) {
                try {
                    const response = await dispatch(getListTimeSlotsByFootballFieldId(footballFields._id as string));
                    if (response.payload) {
                        setTimeSlots(response.payload as TimeSlot[]);
                    }
                } catch (error) {
                    console.error("Error fetching time slots:", error);
                }
            }
        };

        getTimeSlots();
    }, [footballFields, dispatch]);

    useEffect(() => {
        const getData = async () => {
            const data = await dispatch(getListMatchByFootballFieldIdSlice(footballFields?._id as string))
            const data2 = await getFootballFieldAddress()
            setGroupedByAddress(data2.data)
        }

        // Lấy ngày hiện tại ở đầu ngày (00:00:00)
        const today = moment().startOf('day');

        // Áp dụng tất cả các bộ lọc
        let filtered = [...matchs];

        // Lọc bỏ các trận đấu trong quá khứ
        filtered = filtered.filter((match: Match) => {
            const matchDate = moment(match.date).startOf('day');
            return matchDate.isSameOrAfter(today);
        });

        // Lọc theo khu vực
        if (value) {
            filtered = filtered.filter((match: Match) =>
                match.footballField?.address.province === value
            );
        }

        // Lọc theo ngày
        if (selectedDate) {
            const selectedDateStr = moment(selectedDate).format('DD/MM/YYYY');
            console.log("selectedDateStr", selectedDateStr);
            filtered = filtered.filter((match: Match) =>
                moment(match.date).format('DD/MM/YYYY') === selectedDateStr
            );
        }

        // Lọc theo giờ
        if (selectedTime) {
            filtered = filtered.filter((match: Match) =>
                match.time === selectedTime
            );
        }

        // Sắp xếp theo ngày gần nhất
        filtered.sort((a: Match, b: Match) => {
            const dateA = moment(a.date);
            const dateB = moment(b.date);

            // Nếu cùng ngày, sắp xếp theo giờ
            if (dateA.isSame(dateB, 'day')) {
                return a.time.localeCompare(b.time);
            }

            return dateA.diff(dateB);
        });

        setFilteredMatches(filtered);
        footballFields && getData();
    }, [footballFields,selectedDate, selectedTime]);

    // Lọc các timeslot duy nhất để hiển thị trong dropdown
    const uniqueTimeSlots = [...new Set(timeSlots.map(slot => slot.time))].sort();

    return (
        <>
            {/* Bộ lọc và thống kê */}
            <div className="bg-white shadow rounded-xl px-4 py-3 mx-4 mt-4">
                <div className="flex justify-between items-center w-full mb-2">
                    <div className="flex items-center">
                        <Button
                            icon={<FilterOutlined />}
                            onClick={toggleFilters}
                            className="mr-2"
                        >
                            Bộ lọc
                        </Button>
                        {(value || selectedDate || selectedTime) && (
                            <Button type="link" onClick={clearFilters} className="text-orange-500">
                                Xóa bộ lọc
                            </Button>
                        )}
                    </div>

                    {/* Phải: Thống kê */}
                    <div className="flex space-x-6">
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

                {/* Mở rộng bộ lọc */}
                {filtersVisible && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3 pt-3 border-t border-gray-200">
                        {/* Khu vực */}
                        {/* <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Khu vực</label>
                            <Select
                                showSearch
                                value={value}
                                onChange={handleChange}
                                placeholder="Chọn khu vực"
                                className="w-full"
                                style={{ width: '100%' }}
                                optionFilterProp="children"
                                filterOption={(input, option) => 
                                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                }
                                options={groupedByAddress.map((province: string) => ({
                                    value: province,
                                    label: province
                                }))}
                                suffixIcon={<EnvironmentOutlined style={{ color: '#f97316' }} />}
                                allowClear
                            />
                        </div> */}

                        {/* Ngày */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ngày thi đấu</label>
                            <DatePicker
                                className="w-full"
                                format="DD/MM/YYYY"
                                placeholder="Chọn ngày"
                                value={selectedDate}
                                onChange={handleDateChange}
                                suffixIcon={<CalendarOutlined style={{ color: '#f97316' }} />}
                                allowClear
                            />
                        </div>

                        {/* Giờ - Sử dụng Select thay vì TimePicker */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Khung giờ</label>
                            <Select
                                showSearch
                                value={selectedTime}
                                onChange={handleTimeChange}
                                placeholder="Chọn khung giờ"
                                className="w-full"
                                style={{ width: '100%' }}
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                }
                                options={uniqueTimeSlots.map((time: string) => ({
                                    value: time,
                                    label: time
                                }))}
                                suffixIcon={<ClockCircleOutlined style={{ color: '#f97316' }} />}
                                allowClear
                                notFoundContent="Không có khung giờ nào"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Hiển thị kết quả lọc */}
            <div className="px-4 mt-4 text-sm text-gray-500">
                {filtersVisible && (
                    filteredMatches.length > 0 ? (
                        <p>Tìm thấy {filteredMatches.length} trận đấu sắp tới</p>
                    ) : (
                        <p>Không tìm thấy trận đấu nào sắp tới phù hợp với bộ lọc</p>
                    )
                )}
            </div>

            {/* Match list */}
            <div className="mt-4 px-4 space-y-4 pb-10">
                {filteredMatches.slice((currentPage - 1) * 5, currentPage * 5).map((match: Match) => (
                    <div key={match._id} className="bg-white p-4 shadow-md rounded-xl">
                        <Link href={`/homepage/timDoi/${match._id}`}>
                            {/* Nội dung match giữ nguyên */}
                            {/* 3 phần: Đội A - VS - Đội B */}
                            <div className="grid grid-cols-3 items-center mb-2">
                                {/* Đội A */}
                                <div>
                                    <div className="flex items-center space-x-3">
                                        <div className="relative w-12 h-12">
                                            <Image
                                                src={match.club_A?.teamImage || ""}
                                                className="rounded-full object-cover"
                                                layout="fill"
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
                                                    layout="fill"
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
                                        {dayjs(match.date).diff(dayjs(), 'day')} ngày nữa
                                    </span>
                                </div>
                                <div>{match.footballField?.name},
                                    {` ${match.footballField?.address.detail ? `${match.footballField?.address.detail}, ` : ""} ${match.footballField?.address.ward}, ${match.footballField?.address.district}, ${match.footballField?.address.province}`}
                                </div>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>

            {/* Phân trang với Ant Design */}
            <div className="flex justify-center mt-4">
                <Pagination
                    current={currentPage}
                    total={filteredMatches.length}
                    pageSize={5}
                    onChange={(page) => setCurrentPage(page)}
                    hideOnSinglePage={true}
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
    dayjs.locale("vi");

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
                                                                        {dayjs(match.date).diff(dayjs(), 'day')} ngày nữa
                                                                    </span>
                                                                </div>
                                                                <div>{match.footballField?.name},
                                                                    {` ${match.footballField?.address.detail ? `${match.footballField?.address.detail}, ` : ""} ${match.footballField?.address.ward}, ${match.footballField?.address.district}, ${match.footballField?.address.province}`}
                                                                </div>
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
