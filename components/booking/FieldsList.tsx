'use client';
import React from 'react';
import { Field, TimeSlot } from '@/models/field';
import { Order } from '@/models/payment';
import FieldCard from './FieldCard';
import { Dayjs } from 'dayjs';
import { useSuspenseFields } from '@/hooks/useSuspenseData';

interface FieldsListProps {
  fields: Field[];
  filteredFields: Field[];
  timeslots: TimeSlot[] | any;
  orders: Order[] | any;
  selectedDate: Dayjs;
  isLoggedIn: boolean;
  isLoading: boolean;
}

const FieldsList: React.FC<FieldsListProps> = ({
  fields,
  filteredFields,
  timeslots,
  orders,
  selectedDate,
  isLoggedIn,
  isLoading
}) => {
  console.log('🏟️ FieldsList render:', { fields, isLoading, fieldsLength: fields?.length });

  // Sử dụng Suspense hook - sẽ throw Promise nếu chưa có data
  const suspenseFields = useSuspenseFields(fields, isLoading);

  console.log('✅ FieldsList got data:', suspenseFields.length);

  // Nếu có data nhưng rỗng
  if (suspenseFields.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🏟️</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Chưa có sân nào</h3>
        <p className="text-gray-500">Hiện tại chưa có sân bóng nào được thiết lập.</p>
      </div>
    );
  }

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
      {filteredFields.map((field: Field, index: number) => (
        <FieldCard
          key={field._id || index}
          field={field}
          timeslots={timeslots}
          orders={orders}
          selectedDate={selectedDate}
          isLoggedIn={isLoggedIn}
        />
      ))}
    </div>
  );
};

export default FieldsList;
