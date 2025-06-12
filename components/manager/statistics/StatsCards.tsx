'use client';

import React, { useMemo } from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import {
    DollarOutlined,
    FieldTimeOutlined,
    CalendarOutlined,
    RiseOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { Field, TimeSlot } from '@/models/field';

interface Order {
    _id?: string;
    date?: string;
    amount?: number;
    paymentStatus?: string;
    fieldName?: string;
    timeStart?: string;
    createdAt?: string;
}

interface StatsCardsProps {
    orders: Order[] | null;
    fields: Field[] | null;
    timeSlots: TimeSlot[] | null;
    loading: boolean;
}

const StatsCards: React.FC<StatsCardsProps> = ({ orders, fields, timeSlots, loading }) => {
    // Tính toán thống kê cơ bản cho tháng hiện tại
    const stats = useMemo(() => {
        const currentMonth = dayjs().month() + 1; // Tháng hiện tại (1-12)
        const currentYear = dayjs().year(); // Năm hiện tại

        // Lọc đơn hàng trong tháng hiện tại
        const currentMonthOrders = orders?.filter(order => {
            if (!order.date) return false;

            const dateParts = order.date.split('-');
            if (dateParts.length !== 3) return false;

            const orderDate = dayjs(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`);
            return orderDate.year() === currentYear && orderDate.month() + 1 === currentMonth;
        }) || [];

        // Tính tỉ lệ lấp đầy trung bình tháng hiện tại
        const totalSlotsPerDay = (fields?.length || 0) * (timeSlots?.length || 0);
        const totalDaysInMonth = dayjs().endOf('month').date();
        const totalSlotsInMonth = totalSlotsPerDay * totalDaysInMonth;
        const bookedSlotsInMonth = currentMonthOrders.filter(order => order.paymentStatus === 'success').length;
        const averageOccupancyRate = totalSlotsInMonth > 0 ? Math.round((bookedSlotsInMonth / totalSlotsInMonth) * 100) : 0;

        return {
            monthlyOrders: currentMonthOrders.length,
            totalFields: fields?.length || 0,
            totalTimeSlot: (timeSlots && fields) ? timeSlots.length * fields.length as number : 0,
            monthlyRevenue: currentMonthOrders.reduce((sum, order) => order.paymentStatus === 'success' ? sum + (order.amount || 0) : sum, 0),
            averageOccupancyRate: averageOccupancyRate
        };
    }, [orders, fields, timeSlots]);

    return (
        <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} sm={12} md={6}>
                <Card hoverable className="shadow-sm" loading={loading}>
                    <Statistic
                        title={`Doanh thu tháng ${dayjs().month() + 1}`}
                        value={stats.monthlyRevenue}
                        prefix={<DollarOutlined className="text-green-500" />}
                        valueStyle={{ color: '#52c41a' }}
                        formatter={(value) => `${(Number(value)).toLocaleString('vi-VN')} VNĐ`}
                    />
                </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
                <Card hoverable className="shadow-sm" loading={loading}>
                    <Statistic
                        title={`Lượt đặt tháng ${dayjs().month() + 1}`}
                        value={`${stats.monthlyOrders} / ${stats.totalTimeSlot * dayjs().endOf('month').date()}`}
                        prefix={<FieldTimeOutlined className="text-blue-500" />}
                        valueStyle={{ color: '#1890ff' }}
                    />
                </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
                <Card hoverable className="shadow-sm" loading={loading}>
                    <Statistic
                        title="Tổng số khung giờ trong ngày"
                        value={stats.totalTimeSlot}
                        prefix={<CalendarOutlined className="text-[#faad14]" />}
                        valueStyle={{ color: '#faad14' }}
                    />
                </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
                <Card hoverable className="shadow-sm" loading={loading}>
                    <Statistic
                        title="Tổng số sân"
                        value={stats.totalFields}
                        prefix={<CalendarOutlined className="text-purple-500" />}
                        valueStyle={{ color: '#722ed1' }}
                    />
                </Card>
            </Col>
        </Row>
    );
};

export default StatsCards;
