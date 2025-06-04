'use client';
import React from 'react';
import { Button } from 'antd';
import dayjs, { Dayjs } from 'dayjs';

interface CalendarComponentProps {
  tempSelectedDate: Dayjs;
  setTempSelectedDate: (date: Dayjs) => void;
  selectedDate: Dayjs;
  setSelectedDate: (date: Dayjs) => void;
  setShowCalendar: (show: boolean) => void;
}

const CalendarComponent: React.FC<CalendarComponentProps> = ({
  tempSelectedDate,
  setTempSelectedDate,
  selectedDate,
  setSelectedDate,
  setShowCalendar
}) => {
  return (
    <div className="mt-4 p-4 md:p-6 bg-white rounded-xl shadow-lg border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg md:text-xl font-semibold text-gray-800">📅 Chọn ngày đặt sân</h3>
        <Button
          type="text"
          onClick={() => {
            setShowCalendar(false);
            setTempSelectedDate(selectedDate);
          }}
          className="text-gray-500 hover:text-gray-700 text-lg"
        >
          ✕
        </Button>
      </div>
      {/* Custom Calendar Grid */}
      <div className="bg-white">
        {/* Header responsive */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 px-2 gap-2">
          <div className="text-lg md:text-xl font-semibold">
            {tempSelectedDate.format('MMMM YYYY')}
          </div>
          <div className="text-xs sm:text-sm text-gray-500">
            Chọn ngày từ hôm nay đến {dayjs().add(30, 'day').format('DD/MM')}
          </div>
        </div>

        {/* Days of week header responsive */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day) => (
            <div key={day} className="text-center text-xs sm:text-sm font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {(() => {
            const today = dayjs();
            let startDate;
            if (tempSelectedDate.isSame(today, 'month')) {
              startDate = today.startOf('week');
            } else {
              startDate = tempSelectedDate.startOf('month').startOf('week');
            }

            const dates = [];
            for (let i = 0; i < 42; i++) {
              const currentDate = startDate.add(i, 'day');
              const isToday = currentDate.isSame(today, 'day');
              const isSelected = currentDate.isSame(tempSelectedDate, 'day');
              const isDisabled = currentDate.isBefore(today, 'day') || currentDate.isAfter(today.add(30, 'day'), 'day');
              const isCurrentMonth = currentDate.isSame(tempSelectedDate, 'month');

              dates.push(
                <div
                  key={i}
                  onClick={() => {
                    if (!isDisabled) {
                      setTempSelectedDate(currentDate);
                    }
                  }}
                  className={`
                  h-8 sm:h-10 md:h-12 flex items-center justify-center text-xs sm:text-sm cursor-pointer rounded-lg transition-all
                  ${isSelected ? 'bg-[#FE6900] text-white font-semibold' : ''}
                  ${isToday && !isSelected ? 'bg-orange-100 text-[#FE6900] font-semibold border-2 border-[#FE6900]' : ''}
                  ${isDisabled ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-orange-50'}
                  ${!isCurrentMonth && !isDisabled ? 'text-gray-400' : ''}
                  ${!isSelected && !isToday && !isDisabled && isCurrentMonth ? 'text-gray-700' : ''}
                `}
                >
                  {currentDate.date()}
                </div>
              );
            }
            return dates;
          })()}
        </div>
      </div>

      {/* Buttons responsive */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
        <Button
          onClick={() => {
            setShowCalendar(false);
            setTempSelectedDate(selectedDate);
          }}
          className="w-full sm:w-auto"
        >
          Hủy
        </Button>
        <Button
          type="primary"
          onClick={() => {
            setSelectedDate(tempSelectedDate);
            setShowCalendar(false);
          }}
          className="w-full sm:w-auto bg-[#FE6900] hover:bg-[#E55A00] border-[#FE6900] hover:border-[#E55A00]"
        >
          Chọn ngày này
        </Button>
      </div>

      <div className="mt-4 p-3 md:p-4 bg-orange-50 rounded-lg">
        <div className="text-sm md:text-base text-[#FE6900] font-medium">
          📋 Quy định đặt sân:
        </div>
        <div className="text-xs sm:text-sm text-orange-700 mt-1">
          • Chỉ có thể đặt sân từ hôm nay đến tối đa 30 ngày tới (<strong>{dayjs().add(30, 'day').format('DD/MM/YYYY')}</strong>)
        </div>
      </div>
    </div>
  );
};

export default CalendarComponent;
