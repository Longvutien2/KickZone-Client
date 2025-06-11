'use client';

import React from 'react';
import { Card } from 'antd';
import { AppstoreOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

interface FieldScheduleTableProps {
    fields: any[];
    timeSlots: any[];
    bookings: any[];
    selectedListDate: dayjs.Dayjs;
    onBookingClick?: (booking: any) => void;
}

const FieldScheduleTable: React.FC<FieldScheduleTableProps> = ({
    fields,
    timeSlots,
    bookings,
    selectedListDate,
    onBookingClick
}) => {
    if (fields.length === 0 || timeSlots.length === 0) {
        return (
            <Card title="Danh sách tất cả sân và khung giờ" className="mt-6">
                <div className="text-center py-12 text-gray-500">
                    <AppstoreOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />
                    <p className="mt-4 text-lg">Chưa có dữ liệu sân bóng</p>
                    <p className="text-sm">
                        Vui lòng thêm sân bóng để xem danh sách khung giờ
                    </p>
                </div>
            </Card>
        );
    }

    return (
        <Card title={`Danh sách lịch đặt sân ngày ${selectedListDate.format('DD/MM/YYYY')}`} className="mt-6">
            {/* Chú thích */}
            <div className="flex flex-wrap gap-6 mb-4 text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
                    <span>Trống</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-200 border-2 border-yellow-400 rounded"></div>
                    <span>Đã đặt</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-100 border border-gray-200 rounded"></div>
                    <span>Đã qua</span>
                </div>
            </div>

            <div className="space-y-2">
                {fields.map((field: any) => (
                    <div key={field._id} className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="flex min-h-[80px]">
                            {/* Cột trái - Tên sân */}
                            <div className="w-20 bg-blue-500 text-white p-2 flex flex-col items-center justify-center">
                                <div className="text-sm font-bold">{field.name}</div>
                                <div className="text-xs text-blue-100 mt-1">{selectedListDate.format('DD/MM')}</div>
                            </div>

                            {/* Cột phải - Danh sách ca đá */}
                            <div className="flex-1 p-2 my-auto">
                                <div className="flex flex-wrap gap-1.5">
                                    {timeSlots.map((slot: any) => {
                                        const bookedSlot = bookings.find((booking: any) =>
                                            booking.fieldName === field.name &&
                                            booking.timeStart === slot.time &&
                                            booking.date === selectedListDate.format('DD-MM-YYYY') &&
                                            booking.paymentStatus === "success"
                                        );
                                        const isBooked = !!bookedSlot;

                                        // Kiểm tra xem khung giờ đã qua chưa
                                        const isPastTime = (() => {
                                            const selectedDate = selectedListDate.format('YYYY-MM-DD');
                                            const currentDate = dayjs().format('YYYY-MM-DD');

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

                                        const handleSlotClick = () => {
                                            if (isBooked && !isPastTime && onBookingClick && bookedSlot) {
                                                onBookingClick(bookedSlot);
                                            }
                                        };

                                        return (
                                            <div
                                                key={`${field._id}-${slot.time}`}
                                                onClick={handleSlotClick}
                                                className={`
                                                    rounded-md px-2 py-2 text-center transition-all duration-200 border flex-shrink-0
                                                    w-[110px] text-xs
                                                    ${isPastTime
                                                        ? (isPastTime && isBooked) ? 'bg-yellow-100 border-yellow-300 text-gray-400 cursor-not-allowed ' : '  bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                                                        : isBooked
                                                            ? 'bg-yellow-200 border-yellow-400 text-yellow-800 shadow-sm cursor-pointer hover:bg-yellow-300'
                                                            : 'bg-blue-100 border-blue-300  hover:bg-blue-200 cursor-pointer hover:shadow-sm'
                                                    }
                                                `}
                                            >
                                                <div className="font-bold leading-tight">
                                                    {slot.time}
                                                </div>

                                                {isPastTime ? (
                                                    <div className="text-xs font-medium text-gray-500 leading-tight">
                                                        Đã qua
                                                    </div>
                                                ) :
                                                    <div className="font-semibold text-xs">
                                                        {Number(slot.price).toLocaleString()}
                                                    </div>
                                                }
                                                {/* {isBooked && !isPastTime && (
                                                    <div className="text-xs font-medium text-yellow-700 leading-tight">
                                                        Đã đặt
                                                    </div>
                                                )} */}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};

export default FieldScheduleTable;
