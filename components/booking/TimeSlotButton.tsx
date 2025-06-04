'use client';
import React from 'react';
import { Button } from 'antd';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { TimeSlot } from '@/models/field';

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
  // Handle click event
  const handleSlotClick = (e: React.MouseEvent) => {
    if (!isLoggedIn) {
      e.preventDefault();
      toast.warning("Bạn cần đăng nhập để tiếp tục đặt sân!");
      return;
    }
  };

  // Nếu user đã login và slot chưa được book thì wrap với Link
  if (isLoggedIn && !isBooked) {
    return (
      <Link
        key={index}
        href={`/homepage/datSan/${fieldId}/${slot._id}?date=${selectedDate}`}
        onClick={handleSlotClick}
      >
        <Button
          disabled={isBooked}
          className="px-2 sm:px-4 py-1 sm:py-3 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 bg-white border-[#FE6900] text-[#FE6900] border-1 hover:bg-[#FE6900] hover:text-white w-full h-10 flex items-center justify-center"
        >
          {slot.time}
        </Button>
      </Link>
    );
  }

  // Nếu chưa login hoặc slot đã được book
  return (
    <Button
      key={index}
      disabled={isBooked}
      onClick={handleSlotClick}
      className={`px-2 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 bg-white border-[#FE6900] text-[#FE6900] border-1 w-full h-10 flex items-center justify-center ${!isBooked && !isLoggedIn ? 'hover:bg-[#FE6900] hover:text-white cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
    >
      {slot.time}
    </Button>
  );
};

export default TimeSlotButton;
