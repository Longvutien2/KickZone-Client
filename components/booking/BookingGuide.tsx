'use client';
import React from 'react';
import { Card } from 'antd';

interface BookingGuideProps {
  isLoggedIn: boolean;
}

const BookingGuide: React.FC<BookingGuideProps> = ({ isLoggedIn }) => {
  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold">📋 Hướng dẫn đặt sân</span>
        </div>
      }
      className="shadow-sm border border-gray-200 rounded-xl mb-6"
    >
      <ol className="list-decimal pl-4 space-y-3 text-sm md:text-base">
        <li className="text-gray-700">
          <span className="font-medium">Chọn ngày</span> bạn muốn đặt sân
        </li>
        <li className="text-gray-700">
          <span className="font-medium">Chọn sân phù hợp</span> từ danh sách
        </li>
        <li className="text-gray-700">
          <span className="font-medium">Chọn khung giờ</span> còn trống
          {!isLoggedIn && (
            <span className="ml-2 text-xs bg-yellow-100 text-yellow-600 px-2 py-1 rounded">
              🔒 Cần đăng nhập
            </span>
          )}
        </li>
        <li className="text-gray-700">
          <span className="font-medium">Điền thông tin</span> và thanh toán
        </li>
        <li className="text-gray-700">
          <span className="font-medium">Nhận xác nhận</span> đặt sân qua email
        </li>
      </ol>
    </Card>
  );
};

export default BookingGuide;
