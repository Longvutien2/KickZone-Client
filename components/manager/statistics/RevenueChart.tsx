'use client';

import React, { useMemo } from 'react';
import { Tabs, Select, Empty } from 'antd';
import { BarChartOutlined } from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import dayjs from 'dayjs';

interface Order {
    _id?: string;
    date?: string;
    amount?: number;
    paymentStatus?: string;
    fieldName?: string;
    timeStart?: string;
    createdAt?: string;
}

interface DailyRevenueItem {
    date: string;
    formattedDate: string;
    revenue: number;
}

interface WeeklyRevenueItem {
    week: string;
    startDate: string;
    endDate: string;
    revenue: number;
}

interface MonthlyRevenueItem {
    month: string;
    revenue: number;
}

interface RevenueChartProps {
    orders: Order[] | null;
    selectedMonth: number;
    selectedYear: number;
    setSelectedMonth: (month: number) => void;
    setSelectedYear: (year: number) => void;
    loading: boolean;
}

const RevenueChart: React.FC<RevenueChartProps> = ({ 
    orders, 
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

    // Thống kê doanh thu theo ngày (hiển thị đầy đủ tất cả ngày trong tháng được chọn)
    const dailyRevenue = useMemo<DailyRevenueItem[]>(() => {
        // Tạo tất cả ngày trong tháng được chọn
        const endOfMonth = dayjs().year(selectedYear).month(selectedMonth - 1).endOf('month');
        const daysInMonth = endOfMonth.date();
        
        // Khởi tạo doanh thu cho tất cả ngày trong tháng = 0
        const revenueByDay: Record<string, number> = {};
        for (let day = 1; day <= daysInMonth; day++) {
            const dateKey = `${day.toString().padStart(2, '0')}-${selectedMonth.toString().padStart(2, '0')}-${selectedYear}`;
            revenueByDay[dateKey] = 0;
        }

        // Cập nhật doanh thu thực tế từ orders
        if (orders && orders.length > 0) {
            orders.forEach(order => {
                if (!order.date || order.paymentStatus !== 'success') return;

                const dateParts = order.date.split('-');
                if (dateParts.length !== 3) return;

                const orderDate = dayjs(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`);
                
                // Chỉ tính các đơn hàng trong tháng được chọn
                if (orderDate.year() === selectedYear && orderDate.month() + 1 === selectedMonth) {
                    if (revenueByDay[order.date] !== undefined) {
                        revenueByDay[order.date] += order.amount || 0;
                    }
                }
            });
        }

        return Object.entries(revenueByDay)
            .map(([date, revenue]) => ({
                date,
                revenue,
                formattedDate: formatDate(date)
            }))
            .sort((a, b) => {
                const dateA = dayjs(a.date.split('-').reverse().join('-'));
                const dateB = dayjs(b.date.split('-').reverse().join('-'));
                return dateA.diff(dateB);
            });
    }, [orders, selectedMonth, selectedYear]);

    // Thống kê doanh thu theo tuần
    const weeklyRevenue = useMemo<WeeklyRevenueItem[]>(() => {
        if (!orders || orders.length === 0) return [];

        const revenueByWeek: Record<string, WeeklyRevenueItem> = {};

        orders.forEach(order => {
            if (!order.date || order.paymentStatus !== 'success') return;

            const dateParts = order.date.split('-');
            if (dateParts.length !== 3) return;

            const orderDate = dayjs(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`);
            const weekKey = `${orderDate.year()}-${orderDate.week()}`;

            if (!revenueByWeek[weekKey]) {
                revenueByWeek[weekKey] = {
                    week: `Tuần ${orderDate.week()}, ${orderDate.year()}`,
                    startDate: orderDate.startOf('week').format('DD/MM/YYYY'),
                    endDate: orderDate.endOf('week').format('DD/MM/YYYY'),
                    revenue: 0
                };
            }

            revenueByWeek[weekKey].revenue += order.amount || 0;
        });

        return Object.values(revenueByWeek).sort((a, b) => {
            const weekA = parseInt(a.week.split(', ')[0].replace('Tuần ', ''));
            const weekB = parseInt(b.week.split(', ')[0].replace('Tuần ', ''));
            const yearA = parseInt(a.week.split(', ')[1]);
            const yearB = parseInt(b.week.split(', ')[1]);

            if (yearA !== yearB) return yearA - yearB;
            return weekA - weekB;
        });
    }, [orders]);

    // Thống kê doanh thu theo tháng
    const monthlyRevenue = useMemo<MonthlyRevenueItem[]>(() => {
        if (!orders || orders.length === 0) return [];

        const revenueByMonth: Record<string, MonthlyRevenueItem> = {};

        orders.forEach(order => {
            if (!order.date || order.paymentStatus !== 'success') return;

            const dateParts = order.date.split('-');
            if (dateParts.length !== 3) return;

            const orderDate = dayjs(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`);
            const monthKey = `${orderDate.year()}-${orderDate.month() + 1}`;

            if (!revenueByMonth[monthKey]) {
                revenueByMonth[monthKey] = {
                    month: `Tháng ${orderDate.month() + 1}, ${orderDate.year()}`,
                    revenue: 0
                };
            }

            revenueByMonth[monthKey].revenue += order.amount || 0;
        });

        return Object.values(revenueByMonth).sort((a, b) => {
            const monthA = parseInt(a.month.split(', ')[0].replace('Tháng ', ''));
            const monthB = parseInt(b.month.split(', ')[0].replace('Tháng ', ''));
            const yearA = parseInt(a.month.split(', ')[1]);
            const yearB = parseInt(b.month.split(', ')[1]);

            if (yearA !== yearB) return yearA - yearB;
            return monthA - monthB;
        });
    }, [orders]);

    // Tính toán doanh thu theo năm sử dụng useMemo
    const yearlyRevenueData = useMemo(() => {
        if (!orders || orders.length === 0) return [];

        // Khởi tạo mảng doanh thu cho 12 tháng
        const monthlyData = Array(12).fill(0).map((_, index) => ({
            month: `Tháng ${index + 1}`,
            revenue: 0
        }));

        // Tính tổng doanh thu cho mỗi tháng
        orders.forEach(order => {
            if (!order.date || order.paymentStatus !== 'success') return;

            const dateParts = order.date.split('-');
            if (dateParts.length !== 3) return;

            const orderDate = dayjs(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`);
            const monthIndex = orderDate.month(); // 0-11

            monthlyData[monthIndex].revenue += order.amount || 0;
        });

        return monthlyData;
    }, [orders]);

    return (
        <div className="p-6 bg-white rounded-lg shadow mb-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                    <BarChartOutlined className="mr-2 text-green-500" />
                    <h2 className="text-xl font-bold m-0">Thống kê doanh thu</h2>
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
                    label: `Doanh thu tháng ${selectedMonth}/${selectedYear}`,
                    children: (
                        <div style={{ height: '400px' }}>
                            {dailyRevenue.length > 0 && !loading ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={dailyRevenue.map(item => ({
                                            date: item.formattedDate,
                                            revenue: item.revenue
                                        }))}
                                        margin={{ top: 20, right: 30, left: 20}}
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
                                        <YAxis />
                                        <Tooltip
                                            formatter={(value) => [`${value.toLocaleString('vi-VN')} VNĐ`, 'Doanh thu']}
                                            labelFormatter={(label) => `Ngày: ${label}`}
                                        />
                                        <Bar dataKey="revenue" fill="#52c41a" name="Doanh thu" />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <Empty description="Không có dữ liệu doanh thu theo ngày" />
                            )}
                        </div>
                    )
                },
                {
                    key: 'weekly',
                    label: 'Doanh thu theo tuần',
                    children: (
                        <div style={{ height: '400px' }}>
                            {weeklyRevenue.length > 0 && !loading ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={weeklyRevenue.map(item => ({
                                            week: item.week.replace('Tuần ', 'T'),
                                            revenue: item.revenue
                                        }))}
                                        margin={{ top: 20, right: 30, left: 20}}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis 
                                            dataKey="week"
                                            angle={-45}
                                            textAnchor="end"
                                            height={60}
                                            interval={0}
                                            fontSize={12}
                                        />
                                        <YAxis />
                                        <Tooltip
                                            formatter={(value) => [`${value.toLocaleString('vi-VN')} VNĐ`, 'Doanh thu']}
                                            labelFormatter={(label) => `${label.replace('T', 'Tuần ')}`}
                                        />
                                        <Bar dataKey="revenue" fill="#1890ff" name="Doanh thu" />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <Empty description="Không có dữ liệu doanh thu theo tuần" />
                            )}
                        </div>
                    )
                },
                {
                    key: 'monthly',
                    label: 'Doanh thu theo tháng',
                    children: (
                        <div style={{ height: '400px' }}>
                            {monthlyRevenue.length > 0 && !loading ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={monthlyRevenue.map(item => ({
                                            month: item.month.replace('Tháng ', 'T'),
                                            revenue: item.revenue
                                        }))}
                                        margin={{ top: 20, right: 30, left: 20}}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis 
                                            dataKey="month"
                                            angle={-45}
                                            textAnchor="end"
                                            height={60}
                                            interval={0}
                                            fontSize={12}
                                        />
                                        <YAxis />
                                        <Tooltip
                                            formatter={(value) => [`${value.toLocaleString('vi-VN')} VNĐ`, 'Doanh thu']}
                                            labelFormatter={(label) => `${label.replace('T', 'Tháng ')}`}
                                        />
                                        <Bar dataKey="revenue" fill="#FE6900" name="Doanh thu" />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <Empty description="Không có dữ liệu doanh thu theo tháng" />
                            )}
                        </div>
                    )
                },
                {
                    key: 'yearly',
                    label: 'Doanh thu trong năm',
                    children: (
                        <div style={{ height: '400px' }}>
                            {yearlyRevenueData.length > 0 && !loading ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={yearlyRevenueData}
                                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" />
                                        <YAxis />
                                        <Tooltip
                                            formatter={(value) => [`${value.toLocaleString('vi-VN')} VNĐ`, 'Doanh thu']}
                                            labelFormatter={(label) => `${label}`}
                                        />
                                        <Bar dataKey="revenue" fill="#722ed1" name="Doanh thu" />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <Empty description="Không có dữ liệu doanh thu trong năm" />
                            )}
                        </div>
                    )
                }
            ]} />
        </div>
    );
};

export default React.memo(RevenueChart);
