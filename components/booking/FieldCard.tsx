'use client';
import React from 'react';
import dynamic from 'next/dynamic';

// Dynamic import cho Collapse - chỉ load khi cần expand field
const Collapse = dynamic(() => import('antd').then(mod => ({ default: mod.Collapse })), {
  loading: () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 animate-pulse">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-6 bg-gray-300 rounded w-24"></div>
            <div className="h-5 bg-gray-200 rounded w-16"></div>
          </div>
          <div className="h-8 bg-gray-300 rounded w-20"></div>
        </div>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((slot) => (
            <div key={slot} className="h-10 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  ),
  ssr: false
});
import { Field, TimeSlot } from '@/models/field';
import { Order } from '@/models/payment';
import TimeSlotButton from './TimeSlotButton';
import dayjs, { Dayjs } from 'dayjs';

interface FieldCardProps {
  field: Field;
  timeslots: TimeSlot[];
  orders: Order[];
  selectedDate: Dayjs;
  isLoggedIn: boolean;
}

const FieldCard: React.FC<FieldCardProps> = ({
  field,
  timeslots,
  orders,
  selectedDate,
  isLoggedIn
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <Collapse
        className="border-none"
        items={[
          {
            key: field._id,
            label: (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-gray-800 text-base md:text-lg leading-none">
                      {field.name}
                    </span>
                    <span className={`text-xs md:text-sm px-2 py-1 rounded-full leading-none ${field.status === 'Bảo trì'
                      ? ' text-red-600'
                      : ' text-green-600'
                      }`}>
                      {field.status}
                    </span>
                  </div>
                </div>
                <span className="text-xs text-gray-500 leading-none">
                  {field.people} người
                </span>
              </div>
            ),
            children: (
              <div className="p-4">
                {field.status === 'Bảo trì' ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">🔧</div>
                    <p className="text-gray-500 font-medium">
                      Sân này hiện đang bảo trì, không thể đặt lịch.
                    </p>
                  </div>
                ) : (
                  Array.isArray(timeslots) && timeslots.length > 0 ? (
                    <div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 p-1">
                        {timeslots.map((slot: TimeSlot, idx: number) => {
                          // Check if slot is already booked
                          const isBooked = Array.isArray(orders) && orders.length > 0 && orders.some(
                            (o: Order) =>
                              o.date === selectedDate.format('DD-MM-YYYY') &&
                              o.fieldName === field.name &&
                              o.timeStart === slot.time &&
                              o.paymentStatus === "success"
                          );

                          return (
                            <TimeSlotButton
                              key={idx}
                              slot={slot}
                              fieldId={field._id}
                              selectedDate={selectedDate.format("DD-MM-YYYY")}
                              isBooked={isBooked}
                              isLoggedIn={isLoggedIn}
                              index={idx}
                            />
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-2">⏰</div>
                      <p className="text-gray-500 font-medium">
                        Không có ca đá trong ngày này.
                      </p>
                    </div>
                  )
                )}
              </div>
            ),
          }
        ]}
      />
    </div>
  );
};

export default FieldCard;
