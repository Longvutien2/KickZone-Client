'use client';
import React from 'react';
import { Card } from 'antd';
import dayjs from 'dayjs';
import { Field, TimeSlot } from '@/models/field';
import { Order } from '@/models/payment';

interface StatisticsCardProps {
  fields: Field[];
  filteredFields: Field[];
  timeslots: TimeSlot[] | any;
  orders: Order[] | any;
  isLoading: boolean;
}

const StatisticsCard: React.FC<StatisticsCardProps> = ({
  fields,
  filteredFields,
  timeslots,
  orders,
  isLoading
}) => {
  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold">📊 Thống kê</span>
        </div>
      }
      className="shadow-sm border border-gray-200 rounded-xl"
    >
      {isLoading || !fields ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg animate-pulse">
              <div className="h-4 bg-gray-300 rounded w-24"></div>
              <div className="h-6 bg-gray-300 rounded w-8"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-600 text-sm">🏟️ Tổng số sân:</span>
            <span className="font-bold text-[#FE6900] text-lg">{fields?.length || 0}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-600 text-sm">👁️ Sân hiển thị:</span>
            <span className="font-bold text-[#FE6900] text-lg">{filteredFields?.length || 0}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-600 text-sm">⏰ Khung giờ có sẵn:</span>
            <span className="font-bold text-[#FE6900] text-lg">{Array.isArray(timeslots) ? timeslots.length : 0}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
            <span className="text-gray-600 text-sm">✅ Đã đặt hôm nay:</span>
            <span className="font-bold text-[#FE6900] text-lg">
              {Array.isArray(orders) && orders.length > 0 ? orders.filter((o: Order) =>
                o.date === dayjs().format('DD-MM-YYYY') &&
                o.paymentStatus === "success"
              ).length : 0}
            </span>
          </div>
        </div>
      )}
    </Card>
  );
};

export default StatisticsCard;
