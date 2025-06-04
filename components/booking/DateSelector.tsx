'use client';
import React, { useMemo, useCallback } from 'react';
import { CalendarOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/vi";

interface DateSelectorProps {
  selectedDate: Dayjs;
  onDateChange: (key: string) => void;
  showCalendar: boolean;
  setShowCalendar: (show: boolean) => void;
  setTempSelectedDate: (date: Dayjs) => void;
}

const DateSelector: React.FC<DateSelectorProps> = ({
  selectedDate,
  onDateChange,
  showCalendar,
  setShowCalendar,
  setTempSelectedDate
}) => {
  dayjs.locale("vi");

  // Chuyển đổi số thứ trong tuần thành dạng đúng của tiếng Việt
  const getVietnameseDay = useCallback((dayNumber: number) => {
    if (dayNumber === 0) return "CN"; // Chủ Nhật
    return `Th ${dayNumber + 1}`; // Thứ 2 -> Thứ 7
  }, []);

  // MEMOIZED DATES - Chỉ tính toán lại khi selectedDate thay đổi
  const dates = useMemo(() => {
    return Array.from({ length: 30 }, (_, index) => {
      const date = dayjs().add(index, "day");
      const isSelected = date.format("D/M/YYYY") === selectedDate.format("D/M/YYYY");

      return {
        key: date.format("D/M/YYYY"),
        label: (
          <div className={`flex flex-col items-center justify-center py-2 sm:py-3 transition-all flex-shrink-0 ${isSelected
            ? 'bg-[#FE6900] text-white shadow-md'
            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            } w-[80px] sm:w-[100px] md:w-[120px] h-[60px] sm:h-[75px] md:h-[90px]`}>
            <div className="text-sm sm:text-base md:text-lg font-medium">{date.format("D/M")}</div>
            <div className={`text-xs sm:text-sm md:text-base ${isSelected ? 'text-white' : 'text-gray-500'}`}>
              {getVietnameseDay(date.day())}
            </div>
          </div>
        ),
      };
    });
  }, [selectedDate, getVietnameseDay]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        📅 Chọn ngày đặt sân
      </h2>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Hiển thị ngày responsive */}
        <div className="w-full overflow-x-auto">
          <div className="flex rounded-lg border overflow-hidden border-gray-200 min-w-max">
            {dates.slice(0, 7).map((date) => (
              <div
                key={date.key}
                onClick={() => onDateChange(date.key)}
                className="cursor-pointer flex-shrink-0"
              >
                {date.label}
              </div>
            ))}
          </div>
        </div>

        {/* Nút toggle calendar responsive */}
        <div
          onClick={() => {
            setTempSelectedDate(selectedDate);
            setShowCalendar(!showCalendar);
          }}
          className={`cursor-pointer flex-shrink-0 flex flex-col items-center justify-center py-3 px-4 transition-all duration-200 w-full sm:w-[100px] min-w-[100px] h-[60px] sm:h-[90px] rounded-lg border-2 border-dashed ${showCalendar
            ? 'border-[#FE6900] bg-orange-50'
            : 'bg-gray-100 text-gray-600  border-gray-300 hover:border-[#FE6900]'
            }`}
        >
          <CalendarOutlined className="text-lg sm:text-xl mb-1" />
          <div className="text-xs sm:text-sm font-medium">Khác</div>
        </div>
      </div>
    </div>
  );
};

export default DateSelector;
