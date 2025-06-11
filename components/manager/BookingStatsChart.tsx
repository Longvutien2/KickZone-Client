'use client';
import { Card, Typography } from 'antd';
import { BarChartOutlined } from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface BookingStatsChartProps {
    fields: any[];
    bookings: any[];
    selectedListDate: dayjs.Dayjs;
}

const BookingStatsChart = ({ fields, bookings, selectedListDate }: BookingStatsChartProps) => {
    // Tính số lượt đặt theo sân cho ngày đã chọn (cho biểu đồ)
    const getFieldBookingStats = () => {
        const selectedDateFormatted = selectedListDate.format('DD-MM-YYYY');

        // Lọc bookings theo ngày đã chọn và paymentStatus success
        const dayBookings = bookings.filter((booking: any) =>
            booking.date === selectedDateFormatted && booking.paymentStatus === "success"
        );

        // Tạo map để đếm số lượt đặt theo sân
        const fieldStats = fields.map((field: any) => {
            const fieldBookings = dayBookings.filter((booking: any) => booking.fieldName === field.name);
            return {
                fieldName: field.name,
                fieldId: field._id,
                bookingCount: fieldBookings.length,
                people: field.people,
                surface: field.surface,
                status: field.status
            };
        });

        return fieldStats; // Hiển thị tất cả các sân
    };

    // Dữ liệu cho biểu đồ cột
    const chartData = getFieldBookingStats().map(stat => ({
        fieldName: stat.fieldName,
        bookingCount: stat.bookingCount,
        people: `${stat.people} người`
    }));

    return (
        <Card className="mt-6 shadow-sm">
            <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                    <BarChartOutlined style={{ color: '#FE6900' }} />
                    <Title level={4} className="mb-0">
                        Thống kê lượt đặt sân - {selectedListDate.format('DD/MM/YYYY')}
                    </Title>
                </div>
                <Text type="secondary">
                    Hiển thị tất cả các sân và số lượt đặt thành công trong ngày đã chọn
                </Text>
            </div>

            {fields.length > 0 ? (
                <div style={{ height: '400px', width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={chartData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                            barCategoryGap="20%"
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis
                                dataKey="fieldName"
                                angle={-45}
                                textAnchor="end"
                                height={80}
                                interval={0}
                                fontSize={12}
                            />
                            <YAxis
                                label={{ value: 'Số lượt đặt', angle: -90, position: 'insideLeft' }}
                                fontSize={12}
                            />
                            <Tooltip
                                formatter={(value) => [
                                    `${value} lượt đặt`,
                                    'Số lượt đặt'
                                ]}
                                labelFormatter={(label) => `Sân: ${label}`}
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    border: '1px solid #d9d9d9',
                                    borderRadius: '6px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                }}
                                cursor={{ fill: 'rgba(254, 105, 0, 0.05)', stroke: 'none' }}
                                wrapperStyle={{ outline: 'none' }}
                            />
                            <Bar
                                dataKey="bookingCount"
                                fill="#FE6900"
                                radius={[4, 4, 0, 0]}
                                name="Số lượt đặt"
                                maxBarSize={60}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <div className="text-center py-12 text-gray-500">
                    <BarChartOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />
                    <p className="mt-4 text-lg">Chưa có dữ liệu sân bóng</p>
                    <p className="text-sm">
                        Vui lòng thêm sân bóng để xem thống kê
                    </p>
                </div>
            )}
        </Card>
    );
};

export default BookingStatsChart;
