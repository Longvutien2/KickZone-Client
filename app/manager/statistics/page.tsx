'use client';
import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hook';
import { FootballField } from '@/models/football_field';
import { getListOrdersSlice } from '@/features/order.slice';
import { getFootballFieldByIdUserSlice } from '@/features/footballField.slice';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import 'dayjs/locale/vi';
import { getListFieldsSlice } from '@/features/field.slice';
import { getListTimeSlotsByFootballFieldId } from '@/features/timeSlot.slice';
import { TimeSlot } from '@/models/field';

// Import components
import StatsCards from '@/components/manager/statistics/StatsCards';
import RevenueChart from '@/components/manager/statistics/RevenueChart';
import OccupancyChart from '@/components/manager/statistics/OccupancyChart';
import TimeSlotChart from '@/components/manager/statistics/TimeSlotChart';
import FieldStats from '@/components/manager/statistics/FieldStats';

// Extend dayjs with weekOfYear plugin
dayjs.extend(weekOfYear);
dayjs.locale('vi');

interface Order {
    _id?: string;
    date?: string;
    amount?: number;
    paymentStatus?: string;
    fieldName?: string;
    timeStart?: string;
    createdAt?: string;
}

const StatisticsPage: React.FC = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [selectedMonth, setSelectedMonth] = useState<number>(dayjs().month() + 1); // Tháng hiện tại (1-12)
    const [selectedYear, setSelectedYear] = useState<number>(dayjs().year()); // Năm hiện tại
    const orders = useAppSelector(state => state.order.value) as Order[] | null;
    const footballField = useAppSelector(state => state.footballField.detail) as FootballField;
    const fields = useAppSelector(state => state.field.value);
    const timeSlots = useAppSelector(state => state.timeSlot.value) as TimeSlot[] | null;
    const auth = useAppSelector(state => state.auth.value);
    const dispatch = useAppDispatch();

    useEffect(() => {
        const getData = async () => {
            setLoading(true);
            try {
                await dispatch(getListOrdersSlice());
                if (auth?.user?._id) {
                    const data = await dispatch(getFootballFieldByIdUserSlice(auth.user._id)) as any;
                    if (data && data.payload?._id) {
                        await dispatch(getListFieldsSlice(data.payload._id as string));
                        await dispatch(getListTimeSlotsByFootballFieldId(data.payload._id as string));
                    }
                }
                setLoading(false);
            } catch (error) {
                console.error("Error fetching data:", error);
                setLoading(false);
            }
        };
        getData();
    }, [dispatch, auth?.user?._id]);

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <div className="bg-white p-6 rounded-lg shadow mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">Thống kê hệ thống</h1>
                </div>

                {/* Thẻ thống kê */}
                <StatsCards
                    orders={orders}
                    fields={fields}
                    timeSlots={timeSlots}
                    loading={loading}
                />
            </div>

            {/* Thống kê doanh thu */}
            <RevenueChart
                orders={orders}
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
                setSelectedMonth={setSelectedMonth}
                setSelectedYear={setSelectedYear}
                loading={loading}
            />

            {/* Thống kê tỉ lệ lấp đầy */}
            <OccupancyChart
                orders={orders}
                fields={fields}
                timeSlots={timeSlots}
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
                setSelectedMonth={setSelectedMonth}
                setSelectedYear={setSelectedYear}
                loading={loading}
            />

            {/* Thống kê khung giờ có nhiều lượt đặt nhất */}
            <TimeSlotChart
                orders={orders}
                loading={loading}
            />

            {/* Thống kê sân bóng */}
            <FieldStats
                orders={orders}
                fields={fields}
                footballField={footballField}
                loading={loading}
            />
        </div>
    );
};

export default StatisticsPage;