'use client';

import React, { useMemo, useState } from 'react';
import { Card, Empty, Tabs, Select, Row, Col, DatePicker, Button, Space, Table } from 'antd';
import { CalendarOutlined, DollarOutlined, FieldTimeOutlined, BarChartOutlined, LeftOutlined, RightOutlined, TrophyOutlined } from '@ant-design/icons';
import { Field } from '@/models/field';
import { FootballField } from '@/models/football_field';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import isBetween from 'dayjs/plugin/isBetween';
import isoWeek from 'dayjs/plugin/isoWeek';
import 'dayjs/locale/vi';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell
} from 'recharts';

dayjs.extend(weekOfYear);
dayjs.extend(isBetween);
dayjs.extend(isoWeek);
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

interface FieldBookingItem {
    field: string;
    totalBookings: number;
    successfulBookings: number;
    revenue: number;
}

interface FieldRevenueByPeriod {
    field: string;
    daily: { date: string; revenue: number; bookings: number }[];
    weekly: { week: string; revenue: number; bookings: number }[];
    monthly: { month: string; revenue: number; bookings: number }[];
    yearly: { year: string; revenue: number; bookings: number }[];
}

interface FieldStatsProps {
    orders: Order[] | null;
    fields: Field[] | null;
    footballField: FootballField | null;
    loading: boolean;
    selectedMonth?: number; // Tháng được chọn từ component cha
    selectedYear?: number; // Năm được chọn từ component cha
}

const FieldStats: React.FC<FieldStatsProps> = ({
    orders,
    fields,
    footballField,
    loading,
    selectedMonth: parentSelectedMonth,
    selectedYear: parentSelectedYear
}) => {
    const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs>(dayjs());
    const [currentPeriodType, setCurrentPeriodType] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');

    // Sử dụng props từ component cha nếu có, nếu không thì dùng state local
    const effectiveSelectedMonth = parentSelectedMonth || (dayjs().month() + 1);
    const effectiveSelectedYear = parentSelectedYear || dayjs().year();

    // Thống kê lượt đặt sân tổng quan
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

    // Thống kê doanh thu theo thời gian
    const fieldRevenueByPeriod = useMemo<FieldRevenueByPeriod[]>(() => {
        if (!orders || orders.length === 0 || !fields) return [];

        const revenueData: Record<string, FieldRevenueByPeriod> = {};

        // Initialize data structure for each field
        fields.forEach(field => {
            revenueData[field.name] = {
                field: field.name,
                daily: [],
                weekly: [],
                monthly: [],
                yearly: []
            };
        });

        // Process orders
        orders.forEach(order => {
            if (!order.fieldName || order.paymentStatus !== 'success' || !order.date) return;

            // Parse date from DD-MM-YYYY format
            const dateParts = order.date.split('-');
            if (dateParts.length !== 3) return;

            const orderDate = dayjs(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`);
            const revenue = order.amount || 0;

            if (!revenueData[order.fieldName]) return;

            // Daily data
            const dateKey = orderDate.format('YYYY-MM-DD');
            let dailyEntry = revenueData[order.fieldName].daily.find(d => d.date === dateKey);
            if (!dailyEntry) {
                dailyEntry = { date: dateKey, revenue: 0, bookings: 0 };
                revenueData[order.fieldName].daily.push(dailyEntry);
            }
            dailyEntry.revenue += revenue;
            dailyEntry.bookings += 1;

            // Weekly data
            const weekKey = `${orderDate.year()}-W${orderDate.week()}`;
            let weeklyEntry = revenueData[order.fieldName].weekly.find(w => w.week === weekKey);
            if (!weeklyEntry) {
                weeklyEntry = { week: weekKey, revenue: 0, bookings: 0 };
                revenueData[order.fieldName].weekly.push(weeklyEntry);
            }
            weeklyEntry.revenue += revenue;
            weeklyEntry.bookings += 1;

            // Monthly data
            const monthKey = orderDate.format('YYYY-MM');
            let monthlyEntry = revenueData[order.fieldName].monthly.find(m => m.month === monthKey);
            if (!monthlyEntry) {
                monthlyEntry = { month: monthKey, revenue: 0, bookings: 0 };
                revenueData[order.fieldName].monthly.push(monthlyEntry);
            }
            monthlyEntry.revenue += revenue;
            monthlyEntry.bookings += 1;

            // Yearly data
            const yearKey = orderDate.format('YYYY');
            let yearlyEntry = revenueData[order.fieldName].yearly.find(y => y.year === yearKey);
            if (!yearlyEntry) {
                yearlyEntry = { year: yearKey, revenue: 0, bookings: 0 };
                revenueData[order.fieldName].yearly.push(yearlyEntry);
            }
            yearlyEntry.revenue += revenue;
            yearlyEntry.bookings += 1;
        });

        // Sort data by date/period
        Object.values(revenueData).forEach(fieldData => {
            fieldData.daily.sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf());
            fieldData.weekly.sort((a, b) => a.week.localeCompare(b.week));
            fieldData.monthly.sort((a, b) => a.month.localeCompare(b.month));
            fieldData.yearly.sort((a, b) => a.year.localeCompare(b.year));
        });

        return Object.values(revenueData);
    }, [orders, fields]);

    // Colors for charts
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658'];

    // Render charts for period data
    const renderChartsForPeriod = (periodType: 'daily' | 'weekly' | 'monthly' | 'yearly') => {
        if (!fields || fields.length === 0) {
            return <Empty description="Không có sân bóng" />;
        }

        // Get current period info based on selected date
        const getCurrentPeriodInfo = () => {
            const targetDate = selectedDate;
            switch (periodType) {
                case 'daily':
                    return {
                        label: targetDate.isSame(dayjs(), 'day') ? 'hôm nay' : 'ngày đã chọn',
                        dateRange: targetDate.format('DD/MM/YYYY'),
                        description: `Ngày ${targetDate.format('DD/MM/YYYY')}`
                    };
                case 'weekly':
                    const startOfWeek = targetDate.startOf('week').add(1, 'day'); // Monday
                    const endOfWeek = targetDate.endOf('week').add(1, 'day'); // Sunday
                    const weekNumber = targetDate.week();
                    return {
                        label: targetDate.isSame(dayjs(), 'week') ? 'tuần này' : 'tuần đã chọn',
                        dateRange: `${startOfWeek.format('DD/MM')} - ${endOfWeek.format('DD/MM/YYYY')}`,
                        description: `Tuần ${weekNumber} (${startOfWeek.format('DD/MM')} - ${endOfWeek.format('DD/MM/YYYY')})`
                    };
                case 'monthly':
                    return {
                        label: targetDate.isSame(dayjs(), 'month') ? 'tháng này' : 'tháng đã chọn',
                        dateRange: targetDate.format('MM/YYYY'),
                        description: `Tháng ${targetDate.format('MM/YYYY')}`
                    };
                case 'yearly':
                    return {
                        label: targetDate.isSame(dayjs(), 'year') ? 'năm này' : 'năm đã chọn',
                        dateRange: targetDate.format('YYYY'),
                        description: `Năm ${targetDate.format('YYYY')}`
                    };
                default:
                    return {
                        label: 'tổng cộng',
                        dateRange: 'Tất cả',
                        description: 'Tổng cộng tất cả'
                    };
            }
        };

        const currentPeriod = getCurrentPeriodInfo();

        // Get current period key for filtering based on selected date
        const getCurrentPeriodKey = () => {
            const targetDate = selectedDate;
            switch (periodType) {
                case 'daily':
                    return targetDate.format('YYYY-MM-DD');
                case 'weekly':
                    return `${targetDate.year()}-W${targetDate.week()}`;
                case 'monthly':
                    return targetDate.format('YYYY-MM');
                case 'yearly':
                    return targetDate.format('YYYY');
                default:
                    return targetDate.format('YYYY-MM-DD');
            }
        };

        const currentPeriodKey = getCurrentPeriodKey();

        // Prepare data for charts - get current period data
        const chartData = fields.map((field, index) => {
            const fieldRevenue = fieldRevenueByPeriod.find(f => f.field === field.name);
            let totalRevenue = 0;
            let totalBookings = 0;
            let currentPeriodData: any[] = [];

            if (periodType === 'weekly') {
                // For weekly, sum up all days in the selected week
                const startOfWeek = selectedDate.startOf('week').add(1, 'day'); // Monday
                const dailyData = fieldRevenue ? fieldRevenue.daily : [];

                for (let i = 0; i < 7; i++) {
                    const currentDay = startOfWeek.add(i, 'day');
                    const dayKey = currentDay.format('YYYY-MM-DD');
                    const dayData = dailyData.find((item: any) => item.date === dayKey);

                    if (dayData) {
                        totalRevenue += dayData.revenue;
                        totalBookings += dayData.bookings;
                        currentPeriodData.push(dayData);
                    }
                }
            } else {
                // For other periods, use the original logic
                const periodData = fieldRevenue ? fieldRevenue[periodType] : [];
                currentPeriodData = periodData.filter((item: any) => {
                    let itemKey = '';
                    switch (periodType) {
                        case 'daily':
                            itemKey = item.date;
                            break;
                        case 'monthly':
                            itemKey = item.month;
                            break;
                        case 'yearly':
                            itemKey = item.year.toString();
                            break;
                    }
                    return itemKey === currentPeriodKey;
                });

                totalRevenue = currentPeriodData.reduce((sum, item) => sum + item.revenue, 0);
                totalBookings = currentPeriodData.reduce((sum, item) => sum + item.bookings, 0);
            }

            return {
                name: field.name,
                revenue: totalRevenue,
                bookings: totalBookings,
                color: COLORS[index % COLORS.length],
                periodLabel: currentPeriod.label,
                periodDescription: currentPeriod.description,
                dateRange: currentPeriod.dateRange,
                detailData: currentPeriodData
            };
        });

        // Find highest revenue value and all fields with that revenue
        const maxRevenue = Math.max(...chartData.map(item => item.revenue));
        const topRevenueFields = chartData.filter(item => item.revenue === maxRevenue && item.revenue > 0);

        // Get daily breakdown for weekly view
        const getDailyBreakdown = () => {
            if (periodType !== 'weekly') return null;

            const startOfWeek = selectedDate.startOf('week').add(1, 'day'); // Monday
            const dailyData = [];

            for (let i = 0; i < 7; i++) {
                const currentDay = startOfWeek.add(i, 'day');
                const dayKey = currentDay.format('YYYY-MM-DD');

                const dayStats = fields.map(field => {
                    const fieldRevenue = fieldRevenueByPeriod.find(f => f.field === field.name);
                    const dailyData = fieldRevenue ? fieldRevenue.daily : [];
                    const dayData = dailyData.find((item: any) => item.date === dayKey);

                    return {
                        field: field.name,
                        revenue: dayData ? dayData.revenue : 0,
                        bookings: dayData ? dayData.bookings : 0
                    };
                });

                const totalRevenue = dayStats.reduce((sum, item) => sum + item.revenue, 0);
                const totalBookings = dayStats.reduce((sum, item) => sum + item.bookings, 0);

                dailyData.push({
                    date: currentDay.format('DD/MM'),
                    dayName: currentDay.format('dddd').charAt(0).toUpperCase() + currentDay.format('dddd').slice(1),
                    fullDate: dayKey,
                    fields: dayStats,
                    totalRevenue,
                    totalBookings,
                    isToday: currentDay.isSame(dayjs(), 'day')
                });
            }

            return dailyData;
        };

        const dailyBreakdown = getDailyBreakdown();

        // Get time slot booking statistics theo period type được chọn
        const getTimeSlotStats = () => {
            if (!orders || orders.length === 0) return [];

            const bookingsByTimeSlot: Record<string, number> = {};

            // Filter orders theo period type được chọn
            const filteredOrders = orders.filter(order => {
                if (!order.timeStart || order.paymentStatus !== 'success' || !order.date) return false;

                const dateParts = order.date.split('-');
                if (dateParts.length !== 3) return false;

                const orderDate = dayjs(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`);
                const targetDate = selectedDate;

                switch (periodType) {
                    case 'daily':
                        return orderDate.isSame(targetDate, 'day');
                    case 'weekly':
                        return orderDate.isSame(targetDate, 'week');
                    case 'monthly':
                        return orderDate.isSame(targetDate, 'month');
                    case 'yearly':
                        return orderDate.isSame(targetDate, 'year');
                    default:
                        return false;
                }
            });

            // Count bookings by time slot
            filteredOrders.forEach(order => {
                const timeSlot = order.timeStart!;
                bookingsByTimeSlot[timeSlot] = (bookingsByTimeSlot[timeSlot] || 0) + 1;
            });

            const totalBookings = Object.values(bookingsByTimeSlot).reduce((sum, count) => sum + count, 0);

            if (totalBookings === 0) return [];

            return Object.entries(bookingsByTimeSlot)
                .map(([timeSlot, bookingCount]) => ({
                    timeSlot,
                    bookingCount,
                    percentage: Math.round((bookingCount / totalBookings) * 100)
                }))
                .sort((a, b) => b.bookingCount - a.bookingCount);
        };

        const timeSlotStats = getTimeSlotStats();

        // Prepare time series data for line chart (last 10 periods)
        const timeSeriesData: any[] = [];
        const allPeriods = new Set<string>();

        // Collect all unique periods from all fields
        fieldRevenueByPeriod.forEach(fieldRevenue => {
            fieldRevenue[periodType].forEach((period: any) => {
                const periodKey = periodType === 'daily' ? period.date :
                                periodType === 'weekly' ? period.week :
                                periodType === 'monthly' ? period.month :
                                period.year.toString();
                allPeriods.add(periodKey);
            });
        });

        // Sort periods and take last 10
        const sortedPeriods = Array.from(allPeriods).sort().slice(-10);

        sortedPeriods.forEach(periodKey => {
            const dataPoint: any = {
                period: periodType === 'daily' ? dayjs(periodKey).format('DD/MM') :
                       periodType === 'weekly' ? `T${periodKey.split('-W')[1]}` :
                       periodType === 'monthly' ? dayjs(periodKey).format('MM/YY') :
                       periodKey,
                totalRevenue: 0
            };

            fields.forEach(field => {
                const fieldRevenue = fieldRevenueByPeriod.find(f => f.field === field.name);
                if (fieldRevenue) {
                    const periodData = fieldRevenue[periodType];
                    const matchingPeriod = periodData.find((p: any) => {
                        const pKey = periodType === 'daily' ? p.date :
                                   periodType === 'weekly' ? p.week :
                                   periodType === 'monthly' ? p.month :
                                   p.year.toString();
                        return pKey === periodKey;
                    });
                    const revenue = matchingPeriod ? matchingPeriod.revenue : 0;
                    dataPoint[field.name] = revenue;
                    dataPoint.totalRevenue += revenue;
                }
            });

            timeSeriesData.push(dataPoint);
        });

        // Find period with highest total revenue
        const maxRevenuePeriod = timeSeriesData.reduce((max, current) =>
            current.totalRevenue > max.totalRevenue ? current : max,
            timeSeriesData[0] || { totalRevenue: 0 }
        );

        // Navigation functions
        const navigatePeriod = (direction: 'prev' | 'next') => {
            let newDate = selectedDate;
            switch (periodType) {
                case 'daily':
                    newDate = direction === 'prev' ? selectedDate.subtract(1, 'day') : selectedDate.add(1, 'day');
                    break;
                case 'weekly':
                    newDate = direction === 'prev' ? selectedDate.subtract(1, 'week') : selectedDate.add(1, 'week');
                    break;
                case 'monthly':
                    newDate = direction === 'prev' ? selectedDate.subtract(1, 'month') : selectedDate.add(1, 'month');
                    break;
                case 'yearly':
                    newDate = direction === 'prev' ? selectedDate.subtract(1, 'year') : selectedDate.add(1, 'year');
                    break;
            }
            setSelectedDate(newDate);
        };

        return (
            <div className="space-y-6">
                {/* Period Controls */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="text-center md:text-left">
                            <h3 className="text-lg font-semibold text-blue-800 mb-1">
                                {currentPeriod.description}
                            </h3>
                            <p className="text-sm text-blue-600">
                                Thống kê doanh thu và lượt đặt sân trong khoảng thời gian: {currentPeriod.dateRange}
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                icon={<LeftOutlined />}
                                onClick={() => navigatePeriod('prev')}
                                size="small"
                            />

                            <DatePicker
                                value={selectedDate}
                                onChange={(date) => date && setSelectedDate(date)}
                                picker={periodType === 'yearly' ? 'year' :
                                       periodType === 'monthly' ? 'month' :
                                       periodType === 'weekly' ? 'week' : 'date'}
                                format={periodType === 'yearly' ? 'YYYY' :
                                       periodType === 'monthly' ? 'MM/YYYY' :
                                       periodType === 'weekly' ? 'DD/MM/YYYY' :
                                       'DD/MM/YYYY'}
                                size="small"
                                allowClear={false}
                            />

                            <Button
                                icon={<RightOutlined />}
                                onClick={() => navigatePeriod('next')}
                                size="small"
                            />

                            <Button
                                onClick={() => setSelectedDate(dayjs())}
                                size="small"
                                type="primary"
                            >
                                Hôm nay
                            </Button>
                        </div>
                    </div>
                </div>



                {/* Daily Breakdown for Weekly View */}
                {dailyBreakdown && (
                    <Card title="Chi tiết theo từng ngày trong tuần" className="shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                            {dailyBreakdown.map((day, index) => (
                                <div
                                    key={day.fullDate}
                                    className={`p-4 rounded-lg border ${
                                        day.isToday ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-200'
                                    }`}
                                >
                                    <div className="text-center mb-3">
                                        <div className={`font-semibold ${day.isToday ? 'text-blue-600' : 'text-gray-700'}`}>
                                            {day.dayName}
                                        </div>
                                        <div className="text-sm text-gray-500">{day.date}</div>
                                        {day.isToday && <div className="text-xs text-blue-500">Hôm nay</div>}
                                    </div>

                                    <div className="space-y-2">
                                        <div className="text-center">
                                            <div className="text-xs text-gray-500">Tổng doanh thu</div>
                                            <div className="font-semibold text-green-600">
                                                {day.totalRevenue.toLocaleString('vi-VN')} VNĐ
                                            </div>
                                        </div>

                                        <div className="text-center">
                                            <div className="text-xs text-gray-500">Lượt đặt</div>
                                            <div className="font-semibold text-blue-600">
                                                {day.totalBookings}
                                            </div>
                                        </div>

                                        {day.fields.length > 1 && (
                                            <div className="mt-2 pt-2 border-t border-gray-200">
                                                <div className="text-xs text-gray-500 mb-1">Chi tiết theo sân:</div>
                                                {day.fields.map(field => (
                                                    field.revenue > 0 && (
                                                        <div key={field.field} className="text-xs">
                                                            <span className="font-medium">{field.field}:</span>
                                                            <span className="text-green-600 ml-1">
                                                                {field.revenue.toLocaleString('vi-VN')} VNĐ
                                                            </span>
                                                            <span className="text-blue-600 ml-1">
                                                                ({field.bookings} lượt)
                                                            </span>
                                                        </div>
                                                    )
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}

                {/* Field Revenue Table */}
                <Card title={`Danh sách sân và doanh thu (${currentPeriod.description})`} className="shadow-sm">
                    <Table
                        dataSource={chartData.map((item, index) => ({
                            key: index,
                            rank: index + 1,
                            name: item.name,
                            revenue: item.revenue,
                            bookings: item.bookings,
                            avgRevenuePerBooking: item.bookings > 0 ? Math.round(item.revenue / item.bookings) : 0,
                            isHighest: topRevenueFields.some(topField => topField.name === item.name)
                        }))}
                        columns={[
                            {
                                title: '#',
                                dataIndex: 'rank',
                                key: 'rank',
                                width: 50,
                                render: (rank: number, record: any) => (
                                    <div className="flex items-center gap-1">
                                        <span className={record.isHighest ? 'font-bold text-yellow-600' : ''}>
                                            {rank}
                                        </span>
                                    </div>
                                )
                            },
                            {
                                title: 'Tên sân',
                                dataIndex: 'name',
                                key: 'name',
                                render: (name: string, record: any) => (
                                    <span className={record.isHighest ? 'font-bold text-yellow-600' : 'font-medium'}>
                                        {name}
                                        {record.isHighest && <span className="ml-2 text-yellow-600"></span>}
                                    </span>
                                )
                            },
                            {
                                title: 'Doanh thu',
                                dataIndex: 'revenue',
                                key: 'revenue',
                                sorter: (a: any, b: any) => a.revenue - b.revenue,
                                render: (revenue: number, record: any) => (
                                    <span className={`font-semibold ${record.isHighest ? 'text-yellow-600' : 'text-green-600'}`}>
                                        {revenue.toLocaleString('vi-VN')} VNĐ
                                    </span>
                                )
                            },
                            {
                                title: 'Lượt đặt',
                                dataIndex: 'bookings',
                                key: 'bookings',
                                sorter: (a: any, b: any) => a.bookings - b.bookings,
                                render: (bookings: number, record: any) => (
                                    <span className={`font-semibold ${record.isHighest ? 'text-yellow-600' : 'text-blue-600'}`}>
                                        {bookings}
                                    </span>
                                )
                            },
                        ]}
                        pagination={false}
                        size="small"
                    />
                </Card>

                {/* Combined Pie Charts */}
                <Card
                    title="Tỷ lệ doanh thu và khung giờ đặt"
                    extra={<span className="text-sm text-gray-500">Tháng {dayjs().format('MM/YYYY')}</span>}
                    className="shadow-sm mt-6"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Revenue Pie Chart */}
                        <div>
                            <h3 className="text-center font-medium mb-2">Tỷ lệ doanh thu theo sân</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="revenue"
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value: any) => [`${Number(value).toLocaleString('vi-VN')} VNĐ`, 'Doanh thu']} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Time Slot Distribution Pie Chart */}
                        {timeSlotStats.length > 0 ? (
                            <div>
                                <h3 className="text-center font-medium mb-2">Tỷ lệ khung giờ đặt</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={timeSlotStats}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ timeSlot, percentage, percent }) => `${timeSlot}: ${percentage || Math.round(percent * 100)}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="bookingCount"
                                        >
                                            {timeSlotStats.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value: any) => [`${value} lượt đặt`, 'Số lượt đặt']} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-[300px]">
                                <Empty description="Không có dữ liệu khung giờ" />
                            </div>
                        )}
                    </div>
                </Card>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                    {chartData.map((field) => {
                        const isHighest = topRevenueFields.some(topField => topField.name === field.name);
                        return (
                            <Card
                                key={field.name}
                                title={
                                    <div className="flex items-center gap-2">
                                        {field.name}
                                    </div>
                                }
                                className={`shadow-sm`}
                                styles={{
                                    header: {
                                        backgroundColor: isHighest ? '#fff2f0' : '#f8f9fa',
                                        borderLeft: `4px solid ${isHighest ? '#ff4d4f' : field.color}`
                                    }
                                }}
                            >
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-500 flex items-center gap-1">
                                            <FieldTimeOutlined className="text-blue-500" />
                                            Lượt đặt:
                                        </span>
                                        <span className={`font-semibold ${isHighest ? 'text-yellow-600' : 'text-blue-600'}`}>
                                            {field.bookings}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-500 flex items-center gap-1">
                                            <DollarOutlined className="text-green-500" />
                                            Doanh thu:
                                        </span>
                                        <span className={`font-semibold ${isHighest ? 'text-yellow-600' : 'text-green-600'}`}>
                                            {field.revenue.toLocaleString('vi-VN')} VNĐ
                                        </span>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            </div>
        );
    };

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
                <Tabs
                    defaultActiveKey="overview"
                    onChange={(key) => {
                        if (key !== 'overview') {
                            setCurrentPeriodType(key as 'daily' | 'weekly' | 'monthly' | 'yearly');
                        }
                    }}
                    items={[
                        // {
                        //     key: 'overview',
                        //     label: 'Tổng quan',
                        //     children: (
                        //         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        //             {fields.map((field: Field, index) => (
                        //                 <Card
                        //                     key={field._id || index}
                        //                     title={field.name}
                        //                     className="shadow-sm"
                        //                     styles={{
                        //                         header: {
                        //                             backgroundColor: field.status === 'Hoạt động' ? '#e6f7ff' : '#fff7e6',
                        //                             borderLeft: field.status === 'Hoạt động' ? '4px solid #1890ff' : '4px solid #faad14'
                        //                         }
                        //                     }}
                        //                 >
                        //                     <div className="space-y-2">
                        //                         <p>
                        //                             <strong>Trạng thái:</strong>
                        //                             <span
                        //                                 className={`ml-2 py-1 rounded-full  ${
                        //                                     field.status === 'Hoạt động' ? 'text-blue-600' : 'text-yellow-600'
                        //                                 }`}
                        //                             >
                        //                                 {field.status}
                        //                             </span>
                        //                         </p>
                        //                         <p className="flex items-center gap-1">
                        //                             <FieldTimeOutlined className="text-blue-500" />
                        //                             <strong>Lượt đặt:</strong> {
                        //                                 fieldBookings.find(item => item.field === field.name)?.totalBookings || 0
                        //                             }
                        //                         </p>
                        //                         <p className="flex items-center gap-1">
                        //                             <DollarOutlined className="text-green-500" />
                        //                             <strong>Doanh thu:</strong> {
                        //                                 Number(fieldBookings.find(item => item.field === field.name)?.revenue || 0)
                        //                                     .toLocaleString('vi-VN')
                        //                             } VNĐ
                        //                         </p>
                        //                     </div>
                        //                 </Card>
                        //             ))}
                        //         </div>
                        //     )
                        // },
                        {
                            key: 'daily',
                            label: 'Theo ngày',
                            children: renderChartsForPeriod('daily')
                        },
                        {
                            key: 'weekly',
                            label: 'Theo tuần',
                            children: renderChartsForPeriod('weekly')
                        },
                        {
                            key: 'monthly',
                            label: 'Theo tháng',
                            children: renderChartsForPeriod('monthly')
                        },
                        {
                            key: 'yearly',
                            label: 'Theo năm',
                            children: renderChartsForPeriod('yearly')
                        }
                    ]}
                />
            ) : (
                <Empty description="Không có sân bóng" />
            )}
        </div>
    );
};

export default React.memo(FieldStats);
