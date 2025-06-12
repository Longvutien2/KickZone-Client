'use client';

import React, { useMemo } from 'react';
import { Row, Col, Empty } from 'antd';
import { BarChartOutlined } from '@ant-design/icons';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Order {
    _id?: string;
    date?: string;
    amount?: number;
    paymentStatus?: string;
    fieldName?: string;
    timeStart?: string;
    createdAt?: string;
}

interface TimeSlotBookingItem {
    timeSlot: string;
    bookingCount: number;
    percentage: number;
}

interface TimeSlotChartProps {
    orders: Order[] | null;
    loading: boolean;
}

const TimeSlotChart: React.FC<TimeSlotChartProps> = ({ orders, loading }) => {
    // Thống kê khung giờ có nhiều lượt đặt nhất
    const timeSlotBookingStats = useMemo<TimeSlotBookingItem[]>(() => {
        if (!orders || orders.length === 0) return [];

        const bookingsByTimeSlot: Record<string, number> = {};

        orders.forEach(order => {
            if (!order.timeStart || order.paymentStatus !== 'success') return;

            if (!bookingsByTimeSlot[order.timeStart]) {
                bookingsByTimeSlot[order.timeStart] = 0;
            }
            bookingsByTimeSlot[order.timeStart]++;
        });

        const totalBookings = Object.values(bookingsByTimeSlot).reduce((sum, count) => sum + count, 0);

        return Object.entries(bookingsByTimeSlot)
            .map(([timeSlot, bookingCount]) => ({
                timeSlot,
                bookingCount,
                percentage: Math.round((bookingCount / totalBookings) * 100)
            }))
            .sort((a, b) => b.bookingCount - a.bookingCount)
            .slice(0, 10); // Lấy top 10 khung giờ
    }, [orders]);

    // Màu sắc cho biểu đồ tròn
    const COLORS = ['#FE6900', '#FF8533', '#FFA366', '#FFBD99', '#FFD6CC', '#E65F00', '#CC5500', '#B34A00', '#994000', '#803300'];

    return (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
            <div className="flex items-center mb-4">
                <BarChartOutlined className="mr-2 text-orange-500" />
                <h2 className="text-xl font-bold m-0">Khung giờ có nhiều lượt đặt nhất</h2>
            </div>
            {timeSlotBookingStats.length > 0 && !loading ? (
                <Row gutter={[24, 24]}>
                    <Col xs={24} lg={12}>
                        <div style={{ height: '400px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={timeSlotBookingStats}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ timeSlot, percentage }) => `${timeSlot} (${percentage}%)`}
                                        outerRadius={120}
                                        fill="#8884d8"
                                        dataKey="bookingCount"
                                    >
                                        {timeSlotBookingStats.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        formatter={(value) => [`${value} lượt đặt`, 'Số lượt đặt']}
                                        labelFormatter={(label) => `Khung giờ: ${label}`}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </Col>
                    <Col xs={24} lg={12}>
                        <div className="space-y-3">
                            <h3 className="text-lg font-semibold mb-4">Top 10 khung giờ được đặt nhiều nhất</h3>
                            {timeSlotBookingStats.map((item, index) => (
                                <div key={item.timeSlot} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center">
                                        <div 
                                            className="w-4 h-4 rounded-full mr-3"
                                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                        ></div>
                                        <span className="font-medium">{item.timeSlot}</span>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-semibold text-lg">{item.bookingCount} lượt</div>
                                        <div className="text-sm text-gray-500">{item.percentage}%</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Col>
                </Row>
            ) : (
                <Empty description="Không có dữ liệu khung giờ đặt sân" />
            )}
        </div>
    );
};

export default React.memo(TimeSlotChart);
