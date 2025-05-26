'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Card, Row, Col, Statistic, Tabs, Select, Table, Empty, Progress } from 'antd';
import {
    DollarOutlined,
    FieldTimeOutlined,
    CalendarOutlined,
    BarChartOutlined,
    RiseOutlined
} from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '@/store/hook';
import { FootballField } from '@/models/football_field';
import { getListOrdersSlice } from '@/features/order.slice';
import { getFootballFieldByIdUserSlice } from '@/features/footballField.slice';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import 'dayjs/locale/vi';
import { getListFieldsSlice } from '@/features/field.slice';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Field } from '@/models/field';

// Extend dayjs with weekOfYear plugin
dayjs.extend(weekOfYear);
dayjs.locale('vi');

// Define interfaces for type safety
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

interface FieldBookingItem {
    field: string;
    totalBookings: number;
    successfulBookings: number;
    revenue: number;
}

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
    const [timeRange, setTimeRange] = useState<string>('week');
    const [loading, setLoading] = useState<boolean>(false);
    const orders = useAppSelector(state => state.order.value) as Order[] | null;
    const footballField = useAppSelector(state => state.footballField.detail) as FootballField;
    const fields = useAppSelector(state => state.field.value);
    const auth = useAppSelector(state => state.auth.value);
    const dispatch = useAppDispatch();

    useEffect(() => {
        const getData = async () => {
            setLoading(true);
            try {
                await dispatch(getListOrdersSlice());
                if (auth?.user?._id) {
                    const data = await dispatch(getFootballFieldByIdUserSlice(auth.user._id)) as any;
                    data && await dispatch(getListFieldsSlice(data.payload?._id as string));
                }
                setLoading(false);
            } catch (error) {
                console.error("Error fetching data:", error);
                setLoading(false);
            }
        };
        getData();
    }, [dispatch, auth?.user?._id]);

    // Lọc đơn hàng theo khoảng thời gian
    const filteredOrders = useMemo(() => {
        if (!orders || !Array.isArray(orders) || orders.length === 0) return [];

        const now = dayjs();
        let startDate;

        switch (timeRange) {
            case 'week':
                startDate = now.subtract(7, 'day');
                break;
            case 'month':
                startDate = now.subtract(30, 'day');
                break;
            case 'quarter':
                startDate = now.subtract(90, 'day');
                break;
            case 'year':
                startDate = now.subtract(365, 'day');
                break;
            default:
                startDate = now.subtract(7, 'day');
        }

        return orders.filter(order => {
            if (!order.date) return false;

            // Chuyển đổi chuỗi ngày từ định dạng "DD-MM-YYYY" sang đối tượng dayjs
            const dateParts = order.date.split('-');
            if (dateParts.length !== 3) return false;

            const orderDate = dayjs(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`);
            return orderDate.isAfter(startDate) || orderDate.isSame(startDate, 'day');
        });
    }, [orders, timeRange]);

    // Tính toán thống kê cơ bản
    const stats = useMemo(() => ({
        totalOrders: filteredOrders.length,
        totalFields: fields?.length || 0,
        totalRevenue: filteredOrders.reduce((sum, order) => order.paymentStatus === 'success' ? sum + (order.amount || 0) : sum, 0),
        successfulOrders: filteredOrders.filter(order => order.paymentStatus === 'success').length
    }), [filteredOrders, footballField]);

    // Hàm hỗ trợ định dạng ngày
    const formatDate = (dateString: string): string => {
        if (!dateString) return '';
        const dateParts = dateString.split('-');
        if (dateParts.length !== 3) return dateString;
        return `${dateParts[0]}/${dateParts[1]}/${dateParts[2]}`;
    };

    // Thống kê doanh thu theo ngày
    const dailyRevenue = useMemo<DailyRevenueItem[]>(() => {
        if (filteredOrders.length === 0) return [];

        const revenueByDay: Record<string, number> = {};

        filteredOrders.forEach(order => {
            if (!order.date || order.paymentStatus !== 'success') return;

            if (!revenueByDay[order.date]) {
                revenueByDay[order.date] = 0;
            }
            revenueByDay[order.date] += order.amount || 0;
        });

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
    }, [filteredOrders]);

    // Thống kê doanh thu theo tuần
    const weeklyRevenue = useMemo<WeeklyRevenueItem[]>(() => {
        if (filteredOrders.length === 0) return [];

        const revenueByWeek: Record<string, WeeklyRevenueItem> = {};

        filteredOrders.forEach(order => {
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
    }, [filteredOrders]);

    // Thống kê doanh thu theo tháng
    const monthlyRevenue = useMemo<MonthlyRevenueItem[]>(() => {
        if (filteredOrders.length === 0) return [];

        const revenueByMonth: Record<string, MonthlyRevenueItem> = {};

        filteredOrders.forEach(order => {
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
    }, [filteredOrders]);

    // Dữ liệu cho biểu đồ doanh thu theo tháng
    const monthlyChartData = useMemo(() => {
        return monthlyRevenue.map(item => ({
            month: item.month.replace('Tháng ', 'T'),
            revenue: item.revenue
        }));
    }, [monthlyRevenue]);

    // Dữ liệu cho biểu đồ doanh thu theo ngày
    const dailyChartData = useMemo(() => {
        return dailyRevenue.map(item => ({
            date: item.formattedDate,
            revenue: item.revenue
        }));
    }, [dailyRevenue]);

    // Dữ liệu cho biểu đồ doanh thu theo tuần
    const weeklyChartData = useMemo(() => {
        return weeklyRevenue.map(item => ({
            week: item.week.replace('Tuần ', 'T'),
            revenue: item.revenue
        }));
    }, [weeklyRevenue]);

    // Thống kê lượt đặt sân
    const fieldBookings = useMemo<FieldBookingItem[]>(() => {
        if (filteredOrders.length === 0) return [];

        const bookingsByField: Record<string, FieldBookingItem> = {};

        filteredOrders.forEach(order => {
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
    }, [filteredOrders]);

    // Tính giá trị tối đa cho thanh tiến trình
    const maxDailyRevenue = useMemo(() => {
        if (dailyRevenue.length === 0) return 1;
        return Math.max(...dailyRevenue.map(item => item.revenue));
    }, [dailyRevenue]);

    const maxFieldBookings = useMemo(() => {
        if (fieldBookings.length === 0) return 1;
        return Math.max(...fieldBookings.map(item => item.totalBookings));
    }, [fieldBookings]);

    // Columns cho bảng doanh thu theo ngày
    const dailyRevenueColumns = [
        {
            title: 'Ngày',
            dataIndex: 'formattedDate',
            key: 'date',
        },
        {
            title: 'Doanh thu',
            dataIndex: 'revenue',
            key: 'revenue',
            render: (revenue: number) => `${revenue.toLocaleString('vi-VN')} VNĐ`,
        },
        {
            title: 'Biểu đồ',
            key: 'chart',
            render: (_: any, record: DailyRevenueItem) => (
                <Progress
                    percent={(record.revenue / maxDailyRevenue) * 100}
                    showInfo={false}
                    strokeColor="#1890ff"
                    trailColor="#f5f5f5"
                />
            ),
        },
    ];

    // Columns cho bảng doanh thu theo tuần
    const weeklyRevenueColumns = [
        {
            title: 'Tuần',
            dataIndex: 'week',
            key: 'week',
        },
        {
            title: 'Thời gian',
            key: 'period',
            render: (_: any, record: WeeklyRevenueItem) => `${record.startDate} - ${record.endDate}`,
        },
        {
            title: 'Doanh thu',
            dataIndex: 'revenue',
            key: 'revenue',
            render: (revenue: number) => `${revenue.toLocaleString('vi-VN')} VNĐ`,
        },
    ];

    // Columns cho bảng doanh thu theo tháng
    const monthlyRevenueColumns = [
        {
            title: 'Tháng',
            dataIndex: 'month',
            key: 'month',
        },
        {
            title: 'Doanh thu',
            dataIndex: 'revenue',
            key: 'revenue',
            render: (revenue: number) => `${revenue.toLocaleString('vi-VN')} VNĐ`,
        },
    ];

    // Columns cho bảng lượt đặt sân
    const fieldBookingsColumns = [
        {
            title: 'Sân',
            dataIndex: 'field',
            key: 'field',
        },
        {
            title: 'Tổng lượt đặt',
            dataIndex: 'totalBookings',
            key: 'totalBookings',
        },
        {
            title: 'Lượt đặt thành công',
            dataIndex: 'successfulBookings',
            key: 'successfulBookings',
        },
        {
            title: 'Doanh thu',
            dataIndex: 'revenue',
            key: 'revenue',
            render: (revenue: number) => `${revenue.toLocaleString('vi-VN')} VNĐ`,
        },
        {
            title: 'Tỷ lệ đặt',
            key: 'chart',
            render: (_: any, record: FieldBookingItem) => (
                <Progress
                    percent={(record.totalBookings / maxFieldBookings) * 100}
                    showInfo={false}
                    strokeColor="#52c41a"
                    trailColor="#f5f5f5"
                />
            ),
        },
    ];

    // Cấu hình biểu đồ doanh thu theo tháng
    const monthlyChartConfig = {
        data: monthlyChartData,
        xField: 'month',
        yField: 'revenue',
        color: '#1890ff',
        label: {
            position: 'middle',
            style: {
                fill: '#FFFFFF',
                opacity: 0.6,
            },
        },
        meta: {
            revenue: {
                alias: 'Doanh thu (VNĐ)',
            },
        },
        tooltip: {
            formatter: (datum: any) => {
                return { name: 'Doanh thu', value: `${datum.revenue.toLocaleString('vi-VN')} VNĐ` };
            },
        },
    };

    // Cấu hình biểu đồ doanh thu theo ngày
    const dailyChartConfig = {
        data: dailyChartData,
        xField: 'date',
        yField: 'revenue',
        color: '#52c41a',
        label: {
            position: 'middle',
            style: {
                fill: '#FFFFFF',
                opacity: 0.6,
            },
        },
        meta: {
            revenue: {
                alias: 'Doanh thu (VNĐ)',
            },
        },
        tooltip: {
            formatter: (datum: any) => {
                return { name: 'Doanh thu', value: `${datum.revenue.toLocaleString('vi-VN')} VNĐ` };
            },
        },
    };

    // Cấu hình biểu đồ doanh thu theo tuần
    const weeklyChartConfig = {
        data: weeklyChartData,
        xField: 'week',
        yField: 'revenue',
        color: '#faad14',
        label: {
            position: 'middle',
            style: {
                fill: '#FFFFFF',
                opacity: 0.6,
            },
        },
        meta: {
            revenue: {
                alias: 'Doanh thu (VNĐ)',
            },
        },
        tooltip: {
            formatter: (datum: any) => {
                return { name: 'Doanh thu', value: `${datum.revenue.toLocaleString('vi-VN')} VNĐ` };
            },
        },
    };

    // Tính toán doanh thu theo năm sử dụng useMemo
    const yearlyRevenueData = useMemo(() => {
        if (filteredOrders.length === 0) return [];

        // Khởi tạo mảng doanh thu cho 12 tháng
        const monthlyData = Array(12).fill(0).map((_, index) => ({
            month: `Tháng ${index + 1}`,
            revenue: 0
        }));

        // Tính tổng doanh thu cho mỗi tháng
        filteredOrders.forEach(order => {
            if (!order.date || order.paymentStatus !== 'success') return;

            const dateParts = order.date.split('-');
            if (dateParts.length !== 3) return;

            const orderDate = dayjs(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`);
            const monthIndex = orderDate.month(); // 0-11

            monthlyData[monthIndex].revenue += order.amount || 0;
        });

        return monthlyData;
    }, [filteredOrders]);

    const handleTimeRangeChange = (value: string) => {
        setTimeRange(value);
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <div className="bg-white p-6 rounded-lg shadow mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">Thống kê hệ thống</h1>
                    {/* <Select
                        defaultValue="week"
                        style={{ width: 150 }}
                        onChange={handleTimeRangeChange}
                        options={[
                            { value: 'week', label: '7 ngày qua' },
                            { value: 'month', label: '30 ngày qua' },
                            { value: 'quarter', label: '3 tháng qua' },
                            { value: 'year', label: '1 năm qua' },
                        ]}
                    /> */}
                </div>

                {/* Thẻ thống kê */}
                <Row gutter={[16, 16]} className="mb-6">
                    <Col xs={24} sm={12} md={6}>
                        <Card hoverable className="shadow-sm">
                            <Statistic
                                title="Tổng doanh thu"
                                value={stats.totalRevenue}
                                prefix={<DollarOutlined className="text-green-500" />}
                                valueStyle={{ color: '#52c41a' }}
                                formatter={(value) => `${(Number(value)).toLocaleString('vi-VN')} VNĐ`}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card hoverable className="shadow-sm">
                            <Statistic
                                title="Tổng lượt đặt sân"
                                value={stats.totalOrders}
                                prefix={<FieldTimeOutlined className="text-blue-500" />}
                                valueStyle={{ color: '#1890ff' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card hoverable className="shadow-sm">
                            <Statistic
                                title="Đặt sân thành công"
                                value={stats.successfulOrders}
                                prefix={<RiseOutlined className="text-orange-500" />}
                                valueStyle={{ color: '#faad14' }}
                                suffix={`/ ${stats.totalOrders}`}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card hoverable className="shadow-sm">
                            <Statistic
                                title="Tổng số sân"
                                value={stats.totalFields}
                                prefix={<CalendarOutlined className="text-purple-500" />}
                                valueStyle={{ color: '#722ed1' }}
                            />
                        </Card>
                    </Col>
                </Row>
            </div>

            {/* Biểu đồ doanh thu trong năm */}
            <div className="bg-white p-6 rounded-lg shadow mb-6">
                <div className="flex items-center mb-4">
                    <BarChartOutlined className="mr-2 text-green-500" />
                    <h2 className="text-xl font-bold m-0">Doanh thu trong năm</h2>
                </div>
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
                                <Bar dataKey="revenue" fill="#1890ff" name="Doanh thu" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <Empty description="Không có dữ liệu doanh thu trong năm" />
                    )}
                </div>
            </div>

            {/* Thống kê doanh thu */}
            <div className="p-6 bg-white rounded-lg shadow mb-6  ">
                <Tabs defaultActiveKey="daily" items={[
                    {
                        key: 'daily',
                        label: 'Doanh thu theo ngày',
                        children: (
                            <div>
                                {dailyRevenue.length > 0 ? (
                                    <Table
                                        dataSource={dailyRevenue}
                                        columns={dailyRevenueColumns}
                                        pagination={false}
                                        rowKey="date"
                                        loading={loading}
                                        className='border border-gray-200 rounded'
                                    />
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
                            <div >
                                {weeklyRevenue.length > 0 ? (
                                    <Table
                                        dataSource={weeklyRevenue}
                                        columns={weeklyRevenueColumns}
                                        pagination={false}
                                        rowKey="week"
                                        loading={loading}
                                        className='border border-gray-200 rounded'
                                    />
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
                            <div >
                                {monthlyRevenue.length > 0 ? (
                                    <Table
                                        dataSource={monthlyRevenue}
                                        columns={monthlyRevenueColumns}
                                        pagination={false}
                                        rowKey="month"
                                        loading={loading}
                                        className='border border-gray-200 rounded'
                                    />
                                ) : (
                                    <Empty description="Không có dữ liệu doanh thu theo tháng" />
                                )}
                            </div>
                        )
                    }
                ]} />
            </div>

            {/* Thống kê lượt đặt sân */}
            <div className="bg-white p-6 rounded-lg shadow mb-6">
                <div className="flex items-center mb-4">
                    <BarChartOutlined className="mr-2 text-blue-500" />
                    <h2 className="text-xl font-bold m-0">Thống kê lượt đặt sân</h2>
                </div>
                {fieldBookings.length > 0 ? (
                    <Table
                        columns={fieldBookingsColumns}
                        dataSource={fieldBookings}
                        pagination={false}
                        rowKey="field"
                        loading={loading}
                        className="border border-gray-200 rounded"
                    />
                ) : (
                    <Empty description="Không có dữ liệu lượt đặt sân" />
                )}
            </div>

            {/* Thống kê sân bóng */}
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
                                headStyle={{ 
                                    backgroundColor: field.status === 'Hoạt động' ? '#e6f7ff' : '#fff7e6',
                                    borderLeft: field.status === 'Hoạt động' ? '4px solid #1890ff' : '4px solid #faad14'
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

        </div>
    );
};

export default StatisticsPage;
