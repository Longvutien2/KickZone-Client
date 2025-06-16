'use client';
import { useState, useEffect } from 'react';
import { Card, Typography, Button, Select, Divider, Tag, Calendar, ConfigProvider, Checkbox, Layout, DatePicker } from 'antd';
import { UserOutlined, CalendarOutlined, LeftOutlined, RightOutlined, PhoneOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import viVN from 'antd/lib/locale/vi_VN';
import { useAppDispatch, useAppSelector } from '@/store/hook';
import { getListFieldsSlice } from '@/features/field.slice';
import { getListTimeSlotsByFootballFieldId } from '@/features/timeSlot.slice';
import { FootballField } from '@/models/football_field';
import FieldScheduleTable from '../../../components/manager/FieldScheduleTable';
import BookingStatsChart from '../../../components/manager/BookingStatsChart';
import OrderModal from '../../../components/booking-history/OrderModal';

// Kích hoạt plugin weekOfYear cho dayjs
dayjs.extend(weekOfYear);

const { Title, Text } = Typography;

const QuanLiSanBong = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<any>(null);
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [viewMode, setViewMode] = useState<'day' | 'week' | 'month' | 'year' | 'schedule'>('month');
    const [showDropdown, setShowDropdown] = useState(false);
    const footballField = useAppSelector((state) => state.footballField?.detail) as FootballField;
    const bookings = useAppSelector((state) => state.order?.value) || [];
    const fields = useAppSelector((state) => state.field?.value) || [];
    const timeSlots = useAppSelector((state) => state.timeSlot?.value) || [];
    const dispatch = useAppDispatch();

    dayjs.locale("vi"); // Chuyển Ant Design sang Tiếng Việt

    // Thêm state mới để theo dõi ngày đã chọn cho danh sách bên trái
    const [selectedListDate, setSelectedListDate] = useState(dayjs());

    // Sửa lại hàm handleDateChange để chỉ cập nhật selectedDate mà không thay đổi viewMode
    const handleDateChange = (date: dayjs.Dayjs) => {
        if (!date) return;
        setSelectedDate(date);
        setSelectedListDate(date); // Cập nhật ngày cho danh sách bên trái
    };

    // Hàm xử lý khi xem chi tiết booking
    const handleViewBooking = (id: string) => {
        if (!id) return;
        const booking = bookings.find((booking: any) => booking._id === id || booking.id === id);
        setSelectedBooking(booking);
        setModalVisible(true);
    };

    // Hàm xử lý khi click vào booking từ FieldScheduleTable
    const handleBookingClick = (booking: any) => {
        setSelectedBooking(booking);
        setModalVisible(true);
    };

    const calculateDuration = (timeString: string) => {
        if (!timeString || !timeString.includes(' - ')) return 0;
        const [start, end] = timeString.split(' - ');
        const startTime = dayjs(`2000-01-01 ${start}`);
        const endTime = dayjs(`2000-01-01 ${end}`);
        return endTime.diff(startTime, 'minute');
    };

    // Render cell cho calendar
    const fullCellRender = (date: Dayjs) => {
        const formattedDate = date.format("YYYY-MM-DD");
        const apiDateFormat = `${formattedDate.split('-')[2]}-${formattedDate.split('-')[1]}-${formattedDate.split('-')[0]}`;

        const totalBookings = bookings.filter((booking: any) =>
            booking.date === apiDateFormat && booking.paymentStatus === "success"
        ).length;
        const isToday = date.isSame(dayjs(), 'day');
        const isSelected = date.format('YYYY-MM-DD') === selectedDate.format('YYYY-MM-DD');
        const isCurrentMonth = date.month() === dayjs(selectedDate).month();
        const isPastDate = date.isBefore(dayjs(), 'day'); // Kiểm tra ngày đã qua

        return (
            <div
                className={`
                    h-full p-2 rounded-lg cursor-pointer transition-all duration-300
                    ${isSelected ? 'bg-blue-500 text-white shadow-md' : ''}
                    ${isToday && !isSelected ? 'border-2 border-blue-400 bg-blue-50' : ''}
                    ${!isCurrentMonth ? 'opacity-40' : ''}
                    ${isPastDate && !isSelected ? 'opacity-50' : ''}
                    hover:shadow-md hover:border-blue-300
                `}
                onClick={() => handleDateChange(date)}
            >
                <div className="flex justify-between items-center">
                    <span className={`text-lg font-bold ${isSelected ? 'text-white' : ''}`}>
                        {date.date()}
                    </span>
                    {totalBookings > 0 && (
                        <div className={`
                            w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                            ${isSelected ? 'bg-white text-blue-500' : 'bg-red-500 text-white'}
                        `}>
                            {totalBookings}
                        </div>
                    )}
                </div>

                {totalBookings > 0 && (
                    <div className={`text-xs mt-1 ${isSelected ? 'text-blue-100' : 'text-gray-500'}`}>
                        {totalBookings} lượt đặt
                    </div>
                )}
            </div>
        );
    };

    useEffect(() => {
        if (footballField?._id) {
            dispatch(getListFieldsSlice(footballField._id));
            dispatch(getListTimeSlotsByFootballFieldId(footballField._id));
        }
    }, [footballField?._id]);

    return (
        <Layout className="p-6 bg-gray-50 min-h-screen">

            {/* Lịch */}
            <Card className="shadow-sm rounded-xl overflow-hidden">
                <ConfigProvider
                    locale={viVN}
                    theme={{
                        components: {
                            Calendar: {
                                colorBgContainer: '#ffffff',
                                colorPrimary: '#1890ff',
                            },
                            Button: {
                                colorPrimary: '#1890ff',
                            },
                        },
                    }}
                >
                    <div>
                        <div className='flex justify-between'>
                            <div >
                                <Title level={4} className=" text-gray-800 font-bold">
                                    Quản lý lịch đặt sân
                                </Title>
                            </div>
                            <div className="flex justify-between gap-4 items-center pb-3 border-b border-gray-100">
                                <div className="flex items-center space-x-3">
                                    <Button
                                        type="default"
                                        className="rounded-full"
                                        onClick={() => handleDateChange(dayjs())}
                                    >
                                        Hôm nay
                                    </Button>
                                    <Button
                                        type="text"
                                        onClick={() => {
                                            const newDate = viewMode === 'day'
                                                ? dayjs(selectedDate).subtract(1, 'day')
                                                : viewMode === 'week'
                                                    ? dayjs(selectedDate).subtract(1, 'week')
                                                    : viewMode === 'month'
                                                        ? dayjs(selectedDate).subtract(1, 'month')
                                                        : dayjs(selectedDate).subtract(1, 'year');
                                            handleDateChange(newDate);
                                        }}
                                        icon={<LeftOutlined />}
                                        className="flex items-center justify-center w-8 h-8 hover:bg-gray-100 rounded-full"
                                    />
                                    <Button
                                        type="text"
                                        onClick={() => {
                                            const newDate = viewMode === 'day'
                                                ? dayjs(selectedDate).add(1, 'day')
                                                : viewMode === 'week'
                                                    ? dayjs(selectedDate).add(1, 'week')
                                                    : viewMode === 'month'
                                                        ? dayjs(selectedDate).add(1, 'month')
                                                        : dayjs(selectedDate).add(1, 'year');
                                            handleDateChange(newDate);
                                        }}
                                        icon={<RightOutlined />}
                                        className="flex items-center justify-center w-8 h-8 hover:bg-gray-100 rounded-full"
                                    />
                                    <span className="font-medium text-lg">
                                        {viewMode === 'day'
                                            ? dayjs(selectedDate).format('DD MMMM YYYY')
                                            : viewMode === 'week'
                                                ? `Tuần ${dayjs(selectedDate).week()}, ${dayjs(selectedDate).year()}`
                                                : viewMode === 'month'
                                                    ? `Tháng ${dayjs(selectedDate).month() + 1}, ${dayjs(selectedDate).year()}`
                                                    : `Năm ${dayjs(selectedDate).year()}`
                                        }
                                    </span>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <div className="relative">
                                        <Button
                                            className="flex items-center space-x-1"
                                            onClick={() => setShowDropdown(!showDropdown)}
                                        >
                                            <span>{
                                                viewMode === 'day' ? 'Ngày' :
                                                    viewMode === 'week' ? 'Tuần' :
                                                        viewMode === 'month' ? 'Tháng' :
                                                            viewMode === 'year' ? 'Năm' : 'Lịch trình'
                                            }</span>
                                            <span>▼</span>
                                        </Button>

                                        {showDropdown && (
                                            <div className="absolute right-0 top-full mt-1 bg-white shadow-lg rounded-md z-10 w-64">
                                                <div className="p-2">
                                                    <div className="grid grid-cols-2 gap-1">
                                                        <Button
                                                            type={viewMode === 'day' ? 'primary' : 'text'}
                                                            className="text-left flex items-center justify-between"
                                                            onClick={() => {
                                                                setViewMode('day');
                                                                setShowDropdown(false);
                                                            }}
                                                        >
                                                            <span>Ngày</span>
                                                            <span className="text-gray-400">D</span>
                                                        </Button>
                                                        <Button
                                                            type={viewMode === 'week' ? 'primary' : 'text'}
                                                            className="text-left flex items-center justify-between"
                                                            onClick={() => {
                                                                setViewMode('week');
                                                                setShowDropdown(false);
                                                            }}
                                                        >
                                                            <span>Tuần</span>
                                                            <span className="text-gray-400">W</span>
                                                        </Button>
                                                        <Button
                                                            type={viewMode === 'month' ? 'primary' : 'text'}
                                                            className="text-left flex items-center justify-between"
                                                            onClick={() => {
                                                                setViewMode('month');
                                                                setShowDropdown(false);
                                                            }}
                                                        >
                                                            <span>Tháng</span>
                                                            <span className="text-gray-400">M</span>
                                                        </Button>
                                                        <Button
                                                            type={viewMode === 'year' ? 'primary' : 'text'}
                                                            className="text-left flex items-center justify-between"
                                                            onClick={() => {
                                                                setViewMode('year');
                                                                setShowDropdown(false);
                                                            }}
                                                        >
                                                            <span>Năm</span>
                                                            <span className="text-gray-400">Y</span>
                                                        </Button>
                                                        <Button
                                                            type={viewMode === 'schedule' ? 'primary' : 'text'}
                                                            className="text-left flex items-center justify-between col-span-2"
                                                            onClick={() => {
                                                                setViewMode('schedule');
                                                                setShowDropdown(false);
                                                            }}
                                                        >
                                                            <span>Lịch trình</span>
                                                            <span className="text-gray-400">A</span>
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {viewMode === 'month' && (
                            <Calendar
                                fullscreen={false}
                                fullCellRender={fullCellRender}
                                onSelect={handleDateChange}
                                value={dayjs(selectedDate)}
                                className="rounded-lg"
                                mode="month"
                                headerRender={() => null} // Ẩn header mặc định
                            />
                        )}

                        {viewMode === 'week' && (
                            <div className="w-full">
                                <div className="grid grid-cols-7 gap-1">
                                    {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day, index) => (
                                        <div key={day} className="text-center font-medium py-2 bg-gray-50">
                                            <div>{day}</div>
                                            <div>
                                                {dayjs(selectedDate).startOf('week').add(index, 'day').date()}
                                            </div>
                                        </div>
                                    ))}

                                    {Array.from({ length: 7 }).map((_, index) => {
                                        const currentDate = dayjs(selectedDate).startOf('week').add(index, 'day');
                                        const formattedDate = currentDate.format("YYYY-MM-DD");
                                        const apiDateFormat = `${formattedDate.split('-')[2]}-${formattedDate.split('-')[1]}-${formattedDate.split('-')[0]}`;
                                        const dayBookings = bookings.filter((booking: any) =>
                                            booking.date === apiDateFormat && booking.paymentStatus === "success"
                                        );

                                        return (
                                            <div
                                                key={index}
                                                className="min-h-40 border p-2 hover:bg-blue-50 cursor-pointer"
                                                onClick={() => handleDateChange(currentDate)}
                                            >
                                                {dayBookings.length > 0 ? (
                                                    <div className="space-y-1">
                                                        {dayBookings.map((booking: any, idx: number) => (
                                                            <div
                                                                key={idx}
                                                                className="bg-blue-100 text-blue-800 p-1 rounded text-xs"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleViewBooking(booking._id || booking.id);
                                                                }}
                                                            >
                                                                {booking.timeStart} - {booking.teamName}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-gray-400 text-center text-xs mt-4">
                                                        Không có lịch
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {viewMode === 'day' && (
                            <div className="p-4">
                                <div className="flex flex-col">
                                    <div className="text-center font-medium py-2 bg-gray-50">
                                        {dayjs(selectedDate).format('dddd, DD/MM/YYYY')}
                                    </div>

                                    <div className="border rounded-md mt-2 p-4">
                                        {(() => {
                                            const formattedDate = dayjs(selectedDate).format("YYYY-MM-DD");
                                            const apiDateFormat = `${formattedDate.split('-')[2]}-${formattedDate.split('-')[1]}-${formattedDate.split('-')[0]}`;
                                            const dayBookings = bookings.filter((booking: any) =>
                                                booking.date === apiDateFormat && booking.paymentStatus === "success"
                                            );

                                            return dayBookings.length > 0 ? (
                                                <div className="space-y-2">
                                                    {dayBookings.map((booking: any, idx: number) => (
                                                        <div
                                                            key={idx}
                                                            className="bg-white border border-blue-200 p-3 rounded-md hover:shadow-md cursor-pointer"
                                                            onClick={() => handleViewBooking(booking._id || booking.id)}
                                                        >
                                                            <div className="flex justify-between items-center">
                                                                <div className="font-medium">{booking.timeStart}</div>
                                                                <Tag color="blue">{booking.fieldName}</Tag>
                                                            </div>
                                                            <div className="mt-1">
                                                                <div className="flex items-center">
                                                                    <UserOutlined className="mr-2 text-gray-500" />
                                                                    <span>{booking.teamName}</span>
                                                                </div>
                                                                <div className="flex items-center mt-1">
                                                                    <PhoneOutlined className="mr-2 text-gray-500" />
                                                                    <span>{booking.phoneNumber}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-8 text-gray-500">
                                                    <CalendarOutlined style={{ fontSize: '32px' }} />
                                                    <p className="mt-2">Không có lịch đặt sân trong ngày này</p>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </div>
                            </div>
                        )}

                        {viewMode === 'year' && (
                            <div className="p-4">
                                <div className="grid grid-cols-3 gap-4">
                                    {Array.from({ length: 12 }).map((_, index) => {
                                        const currentMonth = dayjs(selectedDate).month(index);
                                        const monthName = currentMonth.format('MMMM');

                                        // Đếm số lượng booking trong tháng
                                        const monthBookings = bookings.filter((booking: any) => {
                                            const bookingDate = dayjs(booking.date?.split('-').reverse().join('-'));
                                            return bookingDate.month() === index &&
                                                bookingDate.year() === dayjs(selectedDate).year() &&
                                                booking.paymentStatus === "success";
                                        });

                                        return (
                                            <div
                                                key={index}
                                                className="border rounded-md p-2 hover:bg-blue-50 cursor-pointer"
                                                onClick={() => {
                                                    handleDateChange(currentMonth);
                                                    setViewMode('month');
                                                }}
                                            >
                                                <div className="font-medium text-center mb-2">{monthName}</div>
                                                <div className="grid grid-cols-7 gap-1 text-xs">
                                                    {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day) => (
                                                        <div key={day} className="text-center text-gray-500">{day}</div>
                                                    ))}

                                                    {Array.from({ length: currentMonth.daysInMonth() + currentMonth.startOf('month').day() }).map((_, idx) => {
                                                        const dayOfMonth = idx - currentMonth.startOf('month').day() + 1;
                                                        if (dayOfMonth <= 0) return <div key={idx} />;

                                                        return (
                                                            <div key={idx} className="text-center">
                                                                {dayOfMonth}
                                                            </div>
                                                        );
                                                    })}
                                                </div>

                                                <div className="text-center mt-2">
                                                    <Tag color="blue">{monthBookings.length} lịch đặt</Tag>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {viewMode === 'schedule' && (
                            <div className="p-4">
                                <div className="space-y-4">
                                    {(() => {
                                        // Nhóm các booking theo ngày (chỉ những booking có paymentStatus === "success")
                                        const groupedByDate: Record<string, any[]> = {};
                                        bookings.forEach((booking: any) => {
                                            if (booking.paymentStatus === "success") {
                                                if (!groupedByDate[booking.date]) {
                                                    groupedByDate[booking.date] = [];
                                                }
                                                groupedByDate[booking.date].push(booking);
                                            }
                                        });

                                        // Sắp xếp các ngày theo thứ tự tăng dần
                                        const sortedDates = Object.keys(groupedByDate).sort((a, b) => {
                                            const dateA = dayjs(a.split('-').reverse().join('-'));
                                            const dateB = dayjs(b.split('-').reverse().join('-'));
                                            return dateA.diff(dateB);
                                        });

                                        return sortedDates.length > 0 ? (
                                            sortedDates.map((date) => (
                                                <div key={date} className="border rounded-md overflow-hidden">
                                                    <div className="bg-gray-100 p-3 font-medium">
                                                        {dayjs(date.split('-').reverse().join('-')).format('dddd, DD/MM/YYYY')}
                                                    </div>
                                                    <div className="p-3 space-y-2">
                                                        {groupedByDate[date].map((booking: any, idx: number) => (
                                                            <div
                                                                key={idx}
                                                                className="bg-white border border-blue-200 p-3 rounded-md hover:shadow-md cursor-pointer"
                                                                onClick={() => handleViewBooking(booking._id || booking.id)}
                                                            >
                                                                <div className="flex justify-between items-center">
                                                                    <div className="font-medium">{booking.timeStart}</div>
                                                                    <Tag color="blue">{booking.fieldName}</Tag>
                                                                </div>
                                                                <div className="mt-1">
                                                                    <div className="flex items-center">
                                                                        <UserOutlined className="mr-2 text-gray-500" />
                                                                        <span>{booking.teamName}</span>
                                                                    </div>
                                                                    <div className="flex items-center mt-1">
                                                                        <PhoneOutlined className="mr-2 text-gray-500" />
                                                                        <span>{booking.phoneNumber}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-8 text-gray-500">
                                                <CalendarOutlined style={{ fontSize: '32px' }} />
                                                <p className="mt-2">Không có lịch đặt sân nào</p>
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>
                        )}
                    </div>
                </ConfigProvider>
            </Card>

            {/* Modal hiển thị chi tiết đặt sân */}
            <OrderModal
                isVisible={modalVisible}
                selectedOrder={selectedBooking}
                footballField={footballField}
                onClose={() => setModalVisible(false)}
                getStatusColor={success => success ? 'green' : 'red'}
                calculateDuration={calculateDuration}
            />

            {/* Danh sách tất cả sân và khung giờ */}
            <FieldScheduleTable
                fields={fields}
                timeSlots={timeSlots}
                bookings={bookings}
                selectedListDate={selectedListDate}
                onBookingClick={handleBookingClick}
            />

            {/* Biểu đồ thống kê lượt đặt sân theo ngày */}
            <BookingStatsChart
                fields={fields}
                bookings={bookings}
                selectedListDate={selectedListDate}
            />

        </Layout>
    );
};

export default QuanLiSanBong