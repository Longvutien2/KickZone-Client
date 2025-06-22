'use client'
import { getFootballFieldAddress } from '@/api/football_fields'
import { getListMatchByFootballFieldIdSlice, getListMatchesSlice } from '@/features/match.slice'
import { getListTimeSlotsByFootballFieldId } from '@/features/timeSlot.slice'
import { FootballField } from '@/models/football_field'
import { Match } from '@/models/match'
import { TimeSlot } from '@/models/field'
import { useAppDispatch, useAppSelector } from '@/store/hook'
import { Pagination } from 'antd'
import { startOfDay, parse, isAfter, isSameDay } from 'date-fns'
import { useEffect, useState, useMemo, memo } from 'react'
import FilterSection from './FilterSection'
import MatchCard from './MatchCard'

const MainContent = memo(() => {
    // Khởi tạo state với mảng rỗng
    const [filteredMatches, setFilteredMatches] = useState<Match[]>([]);
    const [groupedByAddress, setGroupedByAddress] = useState<any>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedDate, setSelectedDate] = useState<any>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [filtersVisible, setFiltersVisible] = useState(false);
    // const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const dispatch = useAppDispatch();
    const [value, setValue] = useState<string>(''); // State lưu giá trị khu vực được chọn

    // Lấy dữ liệu từ Redux store một cách an toàn
    const matchState = useAppSelector(state => state.match);
    const footballFields = useAppSelector(state => state.footballField.detail) as FootballField;
    const timeSlots = useAppSelector(state => state.timeSlot.value) as TimeSlot[];

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

    // Hàm fetch data chung
    const fetchAllData = async () => {
        setIsLoading(true);
        try {
            // Luôn fetch data mới để đảm bảo cập nhật real-time
            const [, , addressData] = await Promise.all([
                await dispatch(getListMatchesSlice()),
                await dispatch(getListTimeSlotsByFootballFieldId(footballFields._id as string)),
                await getFootballFieldAddress()
            ]);

            if (addressData) {
                // setTimeSlots(timeSlotData.payload as TimeSlot[]);
                setGroupedByAddress(addressData.data || []);
            }

        } catch (error) {
            console.error("Error fetching data:", error);
            setGroupedByAddress([]);
        } finally {
            setIsLoading(false);
        }
    };

    // ✅ Fetch data với debouncing để tránh spam calls
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchAllData();
        }, 300); // Debounce 300ms

        return () => clearTimeout(timeoutId);
    }, [footballFields._id]); // Chỉ depend vào ID, không phải toàn bộ object


    // Lọc trận đấu dựa trên các bộ lọc - Optimized with useMemo
    const filteredMatchesMemo = useMemo(() => {
        // Lấy ngày hiện tại ở đầu ngày (00:00:00)
        const today = startOfDay(new Date());

        // Lấy danh sách trận đấu từ Redux store
        const matchs = matchState.value;

        try {
            // Áp dụng tất cả các bộ lọc
            let filtered = [...matchs];

            // Lọc bỏ các trận đấu trong quá khứ - chỉ lấy từ ngày hiện tại trở đi
            filtered = filtered.filter((match: Match) => {
                // Nếu có orderId.date, sử dụng nó
                if (match?.orderId?.date) {
                    const matchDate = startOfDay(parse(match.orderId.date, "dd-MM-yyyy", new Date()));
                    return isAfter(matchDate, today) || isSameDay(matchDate, today);
                }
                return false; // Nếu không có ngày, loại bỏ
            });

            // Lọc theo ngày được chọn
            if (selectedDate) {
                filtered = filtered.filter((match: Match) => {
                    const selectedDateParsed = startOfDay(selectedDate.$d || selectedDate);

                    // Nếu có orderId.date, sử dụng nó
                    if (match?.orderId?.date) {
                        const matchDate = startOfDay(parse(match.orderId.date, "dd-MM-yyyy", new Date()));
                        return isSameDay(matchDate, selectedDateParsed);
                    }
                    return false; // Nếu không có ngày, loại bỏ
                });
            }

            // Lọc theo giờ
            if (selectedTime) {
                filtered = filtered.filter((match: Match) => {
                    // Nếu có orderId.timeStart, sử dụng nó
                    if (match?.orderId?.timeStart) {
                        return match.orderId.timeStart === selectedTime;
                    }
                    // Nếu không có orderId.timeStart, sử dụng match.time
                    return match.time === selectedTime;
                });
            }

            return filtered;
        } catch (error) {
            console.error("Error filtering matches:", error);
            return [];
        }
    }, [matchState.value, selectedDate, selectedTime]);

    // Update filteredMatches when memo changes
    useEffect(() => {
        setFilteredMatches(filteredMatchesMemo);
    }, [filteredMatchesMemo]);

    // Lọc các timeslot duy nhất để hiển thị trong dropdown - Optimized with useMemo
    const uniqueTimeSlots = useMemo(() => {
        return [...new Set(timeSlots.map(slot => slot.time))].sort();
    }, [timeSlots]);

    // Paginated matches - Optimized with useMemo
    const paginatedMatches = useMemo(() => {
        return filteredMatches.slice((currentPage - 1) * 5, currentPage * 5);
    }, [filteredMatches, currentPage]);

    return (
        <>
            <FilterSection
                filtersVisible={filtersVisible}
                toggleFilters={toggleFilters}
                clearFilters={clearFilters}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                handleDateChange={handleDateChange}
                handleTimeChange={handleTimeChange}
                uniqueTimeSlots={uniqueTimeSlots}
                filteredMatchesLength={filteredMatches.length}
                value={value}
            />

            {/* Match list */}
            <div className="mt-4 px-0 sm:px-4 space-y-3 sm:space-y-4 pb-10">
                {paginatedMatches.length > 0 ? (
                    paginatedMatches.map((match: Match) => (
                        <MatchCard key={match._id} match={match} />
                    ))
                ) : (
                    <div className="text-center py-10 text-gray-500">
                        Không có trận đấu nào sắp tới
                    </div>
                )}
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
})

MainContent.displayName = 'MainContent'

export default MainContent
