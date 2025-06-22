'use client';
import React from 'react';
import { Field, TimeSlot } from '@/models/field';
import { Order } from '@/models/payment';
import FieldCard from './FieldCard';
import { Dayjs } from 'dayjs';

interface FieldsListProps {
  fields: Field[];
  filteredFields: Field[];
  timeslots: TimeSlot[] | any;
  orders: Order[] | any;
  selectedDate: Dayjs;
  isLoggedIn: boolean;
  isLoading: boolean;
  selectedTimeSlot?: string | null;
  priceRange?: [number, number];
  showAvailableOnly?: boolean;
}

const FieldsList: React.FC<FieldsListProps> = ({
  fields,
  filteredFields,
  timeslots,
  orders,
  selectedDate,
  isLoggedIn,
  isLoading,
  selectedTimeSlot,
  priceRange,
  showAvailableOnly
}) => {

  // Nếu có data nhưng filteredFields rỗng
  if (filteredFields.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Không tìm thấy sân phù hợp</h3>
        <p className="text-gray-500">Thử thay đổi bộ lọc để xem thêm sân khác.</p>
      </div>
    );
  }

  // Render fields list
  return (
    <div className="space-y-4">
      {filteredFields.map((field: Field, index: number) => {
        // Vì timeSlots không có fieldId, truyền tất cả timeSlots cho FieldCard
        // FieldCard sẽ tự filter theo field.name hoặc logic khác
        return (
          <FieldCard
            key={field._id || index}
            field={field}
            timeslots={timeslots}
            orders={orders}
            selectedDate={selectedDate}
            isLoggedIn={isLoggedIn}
            selectedTimeSlot={selectedTimeSlot}
            priceRange={priceRange}
            showAvailableOnly={showAvailableOnly}
          />
        );
      })}
    </div>
  );
};

export default FieldsList;
