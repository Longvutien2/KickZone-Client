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

interface MainContentProps {
    initialData?: {
        matches: any[];
        addresses: any[];
        timeSlots: any[];
    };
}

const MainContent = memo(({ initialData }: MainContentProps) => {
    // Khởi tạo state với mảng rỗng
    const [filteredMatches, setFilteredMatches] = useState<Match[]>([]);
    const [groupedByAddress, setGroupedByAddress] = useState<any>(initialData?.addresses || []);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedDate, setSelectedDate] = useState<any>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [filtersVisible, setFiltersVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const dispatch = useAppDispatch();
    const [value, setValue] = useState<string>(''); // State lưu giá trị khu vực được chọn

    // Lấy dữ liệu từ Redux store một cách an toàn, fallback to initialData
    const matchState = useAppSelector(state => state.match);
    const footballFields = useAppSelector(state => state.footballField.detail) as FootballField;
    const timeSlotsFromRedux = useAppSelector(state => state.timeSlot.value) as TimeSlot[];

    // ✅ Ensure timeSlots is always an array
    const timeSlots = Array.isArray(timeSlotsFromRedux)
        ? timeSlotsFromRedux
        : (Array.isArray(initialData?.timeSlots) ? initialData.timeSlots : []);

    // ✅ Initialize Redux store with server data if available
    useEffect(() => {
        if (initialData && initialData.matches.length > 0) {
            // Dispatch initial data to Redux store
            dispatch({ type: 'match/setInitialData', payload: initialData.matches });
        }
        if (initialData && initialData.timeSlots.length > 0) {
            dispatch({ type: 'timeSlot/setInitialData', payload: initialData.timeSlots });
        }
    }, [initialData, dispatch]);

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
            // ✅ Only fetch if we don't have initial data or need to refresh
            if (!initialData || !initialData.matches.length) {
                const footballFieldId = footballFields?._id || "67ce9ea74c79326f98b8bf8e";

                const [, , addressData] = await Promise.all([
                    await dispatch(getListMatchesSlice()),
                    await dispatch(getListTimeSlotsByFootballFieldId(footballFieldId)),
                    await getFootballFieldAddress()
                ]);

                if (addressData) {
                    setGroupedByAddress(addressData.data || []);
                }
            }

        } catch (error) {
            console.error("Error fetching data:", error);
            setGroupedByAddress([]);
        } finally {
            setIsLoading(false);
        }
    };

    // ✅ Fetch data với debouncing để tránh spam calls - only if no initial data
    useEffect(() => {
        if (!initialData || !initialData.matches.length) {
            const timeoutId = setTimeout(() => {
                fetchAllData();
            }, 300); // Debounce 300ms

            return () => clearTimeout(timeoutId);
        }
    }, [footballFields?._id, initialData]); // Safe access to footballFields


    // Lọc trận đấu dựa trên các bộ lọc - Optimized with useMemo
    const filteredMatchesMemo = useMemo(() => {
        // Lấy ngày hiện tại ở đầu ngày (00:00:00)
        const today = startOfDay(new Date());

        // ✅ Lấy danh sách trận đấu từ Redux store hoặc initialData
        const matchs = Array.isArray(matchState.value) && matchState.value.length > 0
            ? matchState.value
            : (Array.isArray(initialData?.matches) ? initialData.matches : []);

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
    }, [matchState.value, initialData?.matches, selectedDate, selectedTime]);

    // Update filteredMatches when memo changes
    useEffect(() => {
        setFilteredMatches(filteredMatchesMemo);
    }, [filteredMatchesMemo]);

    // Lọc các timeslot duy nhất để hiển thị trong dropdown - Optimized with useMemo
    const uniqueTimeSlots = useMemo(() => {
        if (!Array.isArray(timeSlots) || timeSlots.length === 0) return [];
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
