'use client';

import React, { useMemo } from 'react';
import { Tabs, Select, Empty } from 'antd';
import { BarChartOutlined } from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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

interface OccupancyRateItem {
    period: string;
    totalSlots: number;
    bookedSlots: number;
    occupancyRate: number;
}

interface OccupancyChartProps {
    orders: Order[] | null;
    fields: Field[] | null;
    timeSlots: TimeSlot[] | null;
    selectedMonth: number;
    selectedYear: number;
    setSelectedMonth: (month: number) => void;
    setSelectedYear: (year: number) => void;
    loading: boolean;
}

const OccupancyChart: React.FC<OccupancyChartProps> = ({ 
    orders, 
    fields, 
    timeSlots, 
    selectedMonth, 
    selectedYear, 
    setSelectedMonth, 
    setSelectedYear, 
    loading 
}) => {
    // Hàm hỗ trợ định dạng ngày
    const formatDate = (dateString: string): string => {
        if (!dateString) return '';
        const dateParts = dateString.split('-');
        if (dateParts.length !== 3) return dateString;
        return `${dateParts[0]}/${dateParts[1]}/${dateParts[2]}`;
    };

    // Tính toán tỉ lệ lấp đầy theo ngày (hiển thị đầy đủ tất cả ngày trong tháng được chọn)
    const dailyOccupancyRate = useMemo<OccupancyRateItem[]>(() => {
        if (!timeSlots || !fields) return [];

        const totalSlotsPerDay = fields.length * timeSlots.length;
        
        // Tạo tất cả ngày trong tháng được chọn
        const endOfMonth = dayjs().year(selectedYear).month(selectedMonth - 1).endOf('month');
        const daysInMonth = endOfMonth.date();
        
        // Khởi tạo tỉ lệ lấp đầy cho tất cả ngày trong tháng = 0
        const occupancyByDay: Record<string, { bookedSlots: number }> = {};
        for (let day = 1; day <= daysInMonth; day++) {
            const dateKey = `${day.toString().padStart(2, '0')}-${selectedMonth.toString().padStart(2, '0')}-${selectedYear}`;
            occupancyByDay[dateKey] = { bookedSlots: 0 };
        }

        // Cập nhật số lượt đặt thực tế từ orders
        if (orders && orders.length > 0) {
            orders.forEach(order => {
                if (!order.date || order.paymentStatus !== 'success') return;

                const dateParts = order.date.split('-');
                if (dateParts.length !== 3) return;

                const orderDate = dayjs(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`);
                
                // Chỉ tính các đơn hàng trong tháng được chọn
                if (orderDate.year() === selectedYear && orderDate.month() + 1 === selectedMonth) {
                    if (occupancyByDay[order.date]) {
                        occupancyByDay[order.date].bookedSlots++;
                    }
                }
            });
        }

        return Object.entries(occupancyByDay)
            .map(([date, data]) => ({
                period: formatDate(date),
                totalSlots: totalSlotsPerDay,
                bookedSlots: data.bookedSlots,
                occupancyRate: Math.round((data.bookedSlots / totalSlotsPerDay) * 100)
            }))
            .sort((a, b) => {
                const dateA = dayjs(a.period.split('/').reverse().join('-'));
                const dateB = dayjs(b.period.split('/').reverse().join('-'));
                return dateA.diff(dateB);
            });
    }, [orders, timeSlots, fields, selectedMonth, selectedYear]);

    // Tính toán tỉ lệ lấp đầy theo tuần
    const weeklyOccupancyRate = useMemo<OccupancyRateItem[]>(() => {
        if (!timeSlots || !fields || !orders || orders.length === 0) return [];

        const totalSlotsPerDay = fields.length * timeSlots.length;
        const occupancyByWeek: Record<string, { bookedSlots: number; days: Set<string> }> = {};

        orders.forEach(order => {
            if (!order.date || order.paymentStatus !== 'success') return;

            const dateParts = order.date.split('-');
            if (dateParts.length !== 3) return;

            const orderDate = dayjs(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`);
            const weekKey = `${orderDate.year()}-${orderDate.week()}`;

            if (!occupancyByWeek[weekKey]) {
                occupancyByWeek[weekKey] = { bookedSlots: 0, days: new Set() };
            }
            occupancyByWeek[weekKey].bookedSlots++;
            occupancyByWeek[weekKey].days.add(order.date);
        });

        return Object.entries(occupancyByWeek)
            .map(([weekKey, data]) => {
                const [year, week] = weekKey.split('-');
                const totalSlotsForWeek = totalSlotsPerDay * data.days.size;
                return {
                    period: `Tuần ${week}, ${year}`,
                    totalSlots: totalSlotsForWeek,
                    bookedSlots: data.bookedSlots,
                    occupancyRate: Math.round((data.bookedSlots / totalSlotsForWeek) * 100)
                };
            })
            .sort((a, b) => {
                const weekA = parseInt(a.period.split(', ')[0].replace('Tuần ', ''));
                const weekB = parseInt(b.period.split(', ')[0].replace('Tuần ', ''));
                const yearA = parseInt(a.period.split(', ')[1]);
                const yearB = parseInt(b.period.split(', ')[1]);

                if (yearA !== yearB) return yearA - yearB;
                return weekA - weekB;
            });
    }, [orders, timeSlots, fields]);

    // Tính toán tỉ lệ lấp đầy theo tháng
    const monthlyOccupancyRate = useMemo<OccupancyRateItem[]>(() => {
        if (!timeSlots || !fields || !orders || orders.length === 0) return [];

        const totalSlotsPerDay = fields.length * timeSlots.length;
        const occupancyByMonth: Record<string, { bookedSlots: number; days: Set<string> }> = {};

        orders.forEach(order => {
            if (!order.date || order.paymentStatus !== 'success') return;

            const dateParts = order.date.split('-');
            if (dateParts.length !== 3) return;

            const orderDate = dayjs(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`);
            const monthKey = `${orderDate.year()}-${orderDate.month() + 1}`;

            if (!occupancyByMonth[monthKey]) {
                occupancyByMonth[monthKey] = { bookedSlots: 0, days: new Set() };
            }
            occupancyByMonth[monthKey].bookedSlots++;
            occupancyByMonth[monthKey].days.add(order.date);
        });

        return Object.entries(occupancyByMonth)
            .map(([monthKey, data]) => {
                const [year, month] = monthKey.split('-');
                const totalSlotsForMonth = totalSlotsPerDay * data.days.size;
                return {
                    period: `Tháng ${month}, ${year}`,
                    totalSlots: totalSlotsForMonth,
                    bookedSlots: data.bookedSlots,
                    occupancyRate: Math.round((data.bookedSlots / totalSlotsForMonth) * 100)
                };
            })
            .sort((a, b) => {
                const monthA = parseInt(a.period.split(', ')[0].replace('Tháng ', ''));
                const monthB = parseInt(b.period.split(', ')[0].replace('Tháng ', ''));
                const yearA = parseInt(a.period.split(', ')[1]);
                const yearB = parseInt(b.period.split(', ')[1]);

                if (yearA !== yearB) return yearA - yearB;
                return monthA - monthB;
            });
    }, [orders, timeSlots, fields]);

    return (
        <div className="p-6 bg-white rounded-lg shadow mb-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                    <BarChartOutlined className="mr-2 text-orange-500" />
                    <h2 className="text-xl font-bold m-0">Thống kê tỉ lệ lấp đầy</h2>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">Chọn tháng:</span>
                    <Select
                        value={selectedMonth}
                        onChange={setSelectedMonth}
                        style={{ width: 120 }}
                        options={[
                            { value: 1, label: 'Tháng 1' },
                            { value: 2, label: 'Tháng 2' },
                            { value: 3, label: 'Tháng 3' },
                            { value: 4, label: 'Tháng 4' },
                            { value: 5, label: 'Tháng 5' },
                            { value: 6, label: 'Tháng 6' },
                            { value: 7, label: 'Tháng 7' },
                            { value: 8, label: 'Tháng 8' },
                            { value: 9, label: 'Tháng 9' },
                            { value: 10, label: 'Tháng 10' },
                            { value: 11, label: 'Tháng 11' },
                            { value: 12, label: 'Tháng 12' },
                        ]}
                    />
                    <Select
                        value={selectedYear}
                        onChange={setSelectedYear}
                        style={{ width: 100 }}
                        options={[
                            { value: 2023, label: '2023' },
                            { value: 2024, label: '2024' },
                            { value: 2025, label: '2025' },
                        ]}
                    />
                </div>
            </div>
            <Tabs defaultActiveKey="daily" items={[
                {
                    key: 'daily',
                    label: `Tỉ lệ lấp đầy tháng ${selectedMonth}/${selectedYear}`,
                    children: (
                        <div style={{ height: '400px' }}>
                            {dailyOccupancyRate.length > 0 && !loading ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={dailyOccupancyRate.map(item => ({
                                            date: item.period,
                                            occupancyRate: item.occupancyRate,
                                            bookedSlots: item.bookedSlots,
                                            totalSlots: item.totalSlots
                                        }))}
                                        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis 
                                            dataKey="date" 
                                            angle={-45}
                                            textAnchor="end"
                                            height={80}
                                            interval={0}
                                            fontSize={12}
                                        />
                                        <YAxis 
                                            label={{ value: 'Tỉ lệ lấp đầy (%)', angle: -90, position: 'insideLeft' }}
                                            domain={[0, 100]}
                                        />
                                        <Tooltip
                                            content={({ active, payload, label }) => {
                                                if (active && payload && payload.length) {
                                                    const data = payload[0].payload;
                                                    return (
                                                        <div className="bg-white p-3 border border-gray-200 rounded shadow">
                                                            <p className="font-medium">{`Ngày: ${label}`}</p>
                                                            <p className="text-orange-600">{`Tỉ lệ lấp đầy: ${data.occupancyRate}%`}</p>
                                                            <p className="text-gray-600">{`Đã đặt: ${data.bookedSlots}/${data.totalSlots} khung giờ`}</p>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        <Bar dataKey="occupancyRate" fill="#FE6900" name="Tỉ lệ lấp đầy" />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <Empty description="Không có dữ liệu tỉ lệ lấp đầy theo ngày" />
                            )}
                        </div>
                    )
                },
                {
                    key: 'weekly',
                    label: 'Tỉ lệ lấp đầy theo tuần',
                    children: (
                        <div style={{ height: '400px' }}>
                            {weeklyOccupancyRate.length > 0 && !loading ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={weeklyOccupancyRate.map(item => ({
                                            week: item.period.replace('Tuần ', 'T'),
                                            occupancyRate: item.occupancyRate,
                                            bookedSlots: item.bookedSlots,
                                            totalSlots: item.totalSlots
                                        }))}
                                        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis 
                                            dataKey="week"
                                            angle={-45}
                                            textAnchor="end"
                                            height={80}
                                            interval={0}
                                            fontSize={12}
                                        />
                                        <YAxis 
                                            label={{ value: 'Tỉ lệ lấp đầy (%)', angle: -90, position: 'insideLeft' }}
                                            domain={[0, 100]}
                                        />
                                        <Tooltip
                                            content={({ active, payload, label }) => {
                                                if (active && payload && payload.length) {
                                                    const data = payload[0].payload;
                                                    return (
                                                        <div className="bg-white p-3 border border-gray-200 rounded shadow">
                                                            <p className="font-medium">{`${label.replace('T', 'Tuần ')}`}</p>
                                                            <p className="text-orange-600">{`Tỉ lệ lấp đầy: ${data.occupancyRate}%`}</p>
                                                            <p className="text-gray-600">{`Đã đặt: ${data.bookedSlots}/${data.totalSlots} khung giờ`}</p>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        <Bar dataKey="occupancyRate" fill="#52c41a" name="Tỉ lệ lấp đầy" />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <Empty description="Không có dữ liệu tỉ lệ lấp đầy theo tuần" />
                            )}
                        </div>
                    )
                },
                {
                    key: 'monthly',
                    label: 'Tỉ lệ lấp đầy theo tháng',
                    children: (
                        <div style={{ height: '400px' }}>
                            {monthlyOccupancyRate.length > 0 && !loading ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={monthlyOccupancyRate.map(item => ({
                                            month: item.period.replace('Tháng ', 'T'),
                                            occupancyRate: item.occupancyRate,
                                            bookedSlots: item.bookedSlots,
                                            totalSlots: item.totalSlots
                                        }))}
                                        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis 
                                            dataKey="month"
                                            angle={-45}
                                            textAnchor="end"
                                            height={80}
                                            interval={0}
                                            fontSize={12}
                                        />
                                        <YAxis 
                                            label={{ value: 'Tỉ lệ lấp đầy (%)', angle: -90, position: 'insideLeft' }}
                                            domain={[0, 100]}
                                        />
                                        <Tooltip
                                            content={({ active, payload, label }) => {
                                                if (active && payload && payload.length) {
                                                    const data = payload[0].payload;
                                                    return (
                                                        <div className="bg-white p-3 border border-gray-200 rounded shadow">
                                                            <p className="font-medium">{`${label.replace('T', 'Tháng ')}`}</p>
                                                            <p className="text-orange-600">{`Tỉ lệ lấp đầy: ${data.occupancyRate}%`}</p>
                                                            <p className="text-gray-600">{`Đã đặt: ${data.bookedSlots}/${data.totalSlots} khung giờ`}</p>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        <Bar dataKey="occupancyRate" fill="#1890ff" name="Tỉ lệ lấp đầy" />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <Empty description="Không có dữ liệu tỉ lệ lấp đầy theo tháng" />
                            )}
                        </div>
                    )
                }
            ]} />
        </div>
    );
};

export default React.memo(OccupancyChart);
