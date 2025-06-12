'use client';

import React, { useMemo } from 'react';
import { Card, Empty } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import { Field } from '@/models/field';
import { FootballField } from '@/models/football_field';

interface Order {
    _id?: string;
    date?: string;
    amount?: number;
    paymentStatus?: string;
    fieldName?: string;
    timeStart?: string;
    createdAt?: string;
}

interface FieldBookingItem {
    field: string;
    totalBookings: number;
    successfulBookings: number;
    revenue: number;
}

interface FieldStatsProps {
    orders: Order[] | null;
    fields: Field[] | null;
    footballField: FootballField | null;
    loading: boolean;
}

const FieldStats: React.FC<FieldStatsProps> = ({ orders, fields, footballField, loading }) => {
    // Thống kê lượt đặt sân
    const fieldBookings = useMemo<FieldBookingItem[]>(() => {
        if (!orders || orders.length === 0) return [];

        const bookingsByField: Record<string, FieldBookingItem> = {};

        orders.forEach(order => {
            if (!order.fieldName) return;

            if (!bookingsByField[order.fieldName]) {
                bookingsByField[order.fieldName] = {
                    field: order.fieldName,
                    totalBookings: 0,
                    successfulBookings: 0,
                    revenue: 0
                };
            }

            bookingsByField[order.fieldName].totalBookings++;

            if (order.paymentStatus === 'success') {
                bookingsByField[order.fieldName].successfulBookings++;
                bookingsByField[order.fieldName].revenue += order.amount || 0;
            }
        });

        return Object.values(bookingsByField)
            .sort((a, b) => b.totalBookings - a.totalBookings);
    }, [orders]);

    if (loading) {
        return (
            <div className="bg-white p-6 rounded-lg shadow mb-6">
                <div className="flex items-center mb-4">
                    <CalendarOutlined className="mr-2 text-purple-500" />
                    <h2 className="text-xl font-bold m-0">Thống kê sân bóng</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4].map((index) => (
                        <Card key={index} loading={true} className="shadow-sm" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
            <div className="flex items-center mb-4">
                <CalendarOutlined className="mr-2 text-purple-500" />
                <h2 className="text-xl font-bold m-0">Thống kê sân bóng</h2>
            </div>
            {footballField && fields && fields.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {fields.map((field: Field, index) => (
                        <Card 
                            key={field._id || index} 
                            title={field.name} 
                            className="shadow-sm"
                            styles={{
                                header: {
                                    backgroundColor: field.status === 'Hoạt động' ? '#e6f7ff' : '#fff7e6',
                                    borderLeft: field.status === 'Hoạt động' ? '4px solid #1890ff' : '4px solid #faad14'
                                }
                            }}
                        >
                            <div className="space-y-2">
                                <p>
                                    <strong>Trạng thái:</strong> 
                                    <span 
                                        className={`ml-2 py-1 rounded-full  ${
                                            field.status === 'Hoạt động' ? 'text-blue-600' : 'text-yellow-600'
                                        }`}
                                    >
                                        {field.status}
                                    </span>
                                </p>
                                <p><strong>Lượt đặt:</strong> {
                                    fieldBookings.find(item => item.field === field.name)?.totalBookings || 0
                                }</p>
                                <p><strong>Doanh thu:</strong> {
                                    Number(fieldBookings.find(item => item.field === field.name)?.revenue || 0)
                                        .toLocaleString('vi-VN')
                                } VNĐ</p>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <Empty description="Không có sân bóng" />
            )}
        </div>
    );
};

export default React.memo(FieldStats);
