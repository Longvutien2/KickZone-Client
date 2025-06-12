'use client';
import React from 'react';

import Link from 'next/link';
import { toast } from 'react-toastify';
import { TimeSlot } from '@/models/field';
import dayjs from 'dayjs';

interface TimeSlotButtonProps {
  slot: TimeSlot;
  fieldId: string;
  selectedDate: string;
  isBooked: boolean;
  isLoggedIn: boolean;
  index: number;
}

const TimeSlotButton: React.FC<TimeSlotButtonProps> = ({
  slot,
  fieldId,
  selectedDate,
  isBooked,
  isLoggedIn,
  index
}) => {
  // Kiểm tra xem khung giờ đã qua chưa
  const isPastTime = (() => {
    const currentDate = dayjs().format('DD-MM-YYYY');

    // Nếu ngày đã qua
    if (selectedDate < currentDate) return true;

    // Nếu là ngày hôm nay, kiểm tra giờ
    if (selectedDate === currentDate) {
      const timeStart = slot.time.split(' - ')[0];
      const currentTime = dayjs().format('HH:mm');

      return timeStart < currentTime;
    }

    return false;
  })();

  // Handle click event
  const handleSlotClick = (e: React.MouseEvent) => {
    if (isPastTime) {
      e.preventDefault();
      toast.info("Khung giờ này đã qua!");
      return;
    }

    if (!isLoggedIn) {
      e.preventDefault();
      toast.warning("Bạn cần đăng nhập để tiếp tục đặt sân!");
      return;
    }
  };

  // Nếu user đã login và slot chưa được book và chưa qua giờ thì wrap với Link
  if (isLoggedIn && !isBooked && !isPastTime) {
    return (
      <Link
        key={index}
        href={`/homepage/book-field/${fieldId}/${slot._id}?date=${selectedDate}`}
        onClick={handleSlotClick}
      >
        <div className="py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 bg-blue-100 border-blue-300 text-blue-800 border hover:bg-blue-200 w-full h-auto cursor-pointer">
          <div className="flex flex-col items-center justify-center">
            <div>{slot.time}</div>
            <div className="text-[10px] sm:text-xs">
              {Number(slot.price).toLocaleString()} đ
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Nếu chưa login hoặc slot đã được book hoặc đã qua giờ
  return (
    <div
      key={index}
      onClick={handleSlotClick}
      className={`py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 w-full h-auto border ${
        isPastTime
          ? 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed'
          : isBooked
            ? 'bg-orange-100 border-orange-300 text-orange-600 cursor-not-allowed'
            : 'bg-blue-100 border-blue-300 text-blue-800 hover:bg-blue-200 cursor-pointer'
      }`}
    >
      <div className="flex flex-col items-center justify-center">
        <div>{slot.time}</div>
        <div className="text-[10px] sm:text-xs">
          {isPastTime
            ? 'Đã qua'
            : isBooked
              ? 'Đã đặt'
              : `${Number(slot.price).toLocaleString()} đ`
          }
        </div>
      </div>
    </div>
  );
};

export default TimeSlotButton;
