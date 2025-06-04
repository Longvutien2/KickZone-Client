'use client';
import { useState, useEffect } from 'react';
import { Card, Typography, Button, Select, Divider, Tag, Avatar, Calendar, ConfigProvider, Checkbox, Modal, Layout, DatePicker, Table } from 'antd';
import { UserOutlined, CalendarOutlined, AppstoreOutlined, SettingOutlined, LeftOutlined, RightOutlined, PhoneOutlined, MessageOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import viVN from 'antd/lib/locale/vi_VN';
import { useAppDispatch, useAppSelector } from '@/store/hook';
import { getListOrdersSlice } from '@/features/order.slice';
import { getListFieldsSlice } from '@/features/field.slice';
import { FootballField } from '@/models/football_field';

// Kích hoạt plugin weekOfYear cho dayjs
dayjs.extend(weekOfYear);

const { Title, Text } = Typography;
const { Option } = Select;

const QuanLiSanBong = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<any>(null);
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [selectedField, setSelectedField] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'day' | 'week' | 'month' | 'year' | 'schedule'>('month');
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedDateForStats, setSelectedDateForStats] = useState<string>(dayjs().format('DD-MM-YYYY'));
    const user = useAppSelector((state) => state.auth?.value?.user);
    const footballField = useAppSelector((state) => state.footballField?.detail) as FootballField;
    const bookings = useAppSelector((state) => state.order?.value) || [];
    const fields = useAppSelector((state) => state.field?.value) || [];
    const dispatch = useAppDispatch();
    
    dayjs.locale("vi"); // Chuyển Ant Design sang Tiếng Việt
    
    // Lấy danh sách các sân từ bookings (chỉ những booking có paymentStatus === "success")
    const fieldList = [...new Set(bookings
        .filter((booking: any) => booking.paymentStatus === "success")
        .map((booking: any) => booking.fieldName)
    )];

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

    // Lọc bookings theo chế độ xem và sân đã chọn
    const getFilteredBookings = () => {
        let filtered = [...bookings];

        // Lọc chỉ những order có paymentStatus === "success"
        filtered = filtered.filter((booking: any) => booking.paymentStatus === "success");

        // Chuyển đổi định dạng ngày để so sánh với bookings
        const apiDateFormat = selectedDate.format('DD-MM-YYYY');

        if (viewMode === 'day') {
            // Lọc theo ngày đã chọn
            filtered = filtered.filter((booking: any) => booking.date === apiDateFormat);
        } else if (viewMode === 'week') {
            // Lọc theo tuần của ngày đã chọn
            const startOfWeek = selectedDate.startOf('week');
            const endOfWeek = selectedDate.endOf('week');

            filtered = filtered.filter((booking: any) => {
                const bookingDate = dayjs(booking.date.split('-').reverse().join('-'));
                return bookingDate.isAfter(startOfWeek, 'day') || bookingDate.isSame(startOfWeek, 'day') &&
                       (bookingDate.isBefore(endOfWeek, 'day') || bookingDate.isSame(endOfWeek, 'day'));
            });
        } else if (viewMode === 'month') {
            // Lọc theo tháng của ngày đã chọn
            filtered = filtered.filter((booking: any) => {
                const bookingDate = dayjs(booking.date.split('-').reverse().join('-'));
                return bookingDate.month() === selectedDate.month() &&
                       bookingDate.year() === selectedDate.year();
            });
        }

        // Lọc theo sân nếu có chọn sân
        if (selectedField) {
            filtered = filtered.filter((booking: any) => booking.fieldName === selectedField);
        }

        return filtered;
    };

    // Nhóm bookings theo field hoặc ngày tùy thuộc vào chế độ xem
    const groupBookings = () => {
        const filtered = getFilteredBookings();

        if (viewMode === 'day') {
            // Nhóm theo field khi xem theo ngày
            return filtered.reduce((acc: Record<string, any[]>, booking: any) => {
                if (!acc[booking.fieldName]) {
                    acc[booking.fieldName] = [];
                }
                acc[booking.fieldName].push(booking);
                return acc;
            }, {});
        } else {
            // Nhóm theo ngày khi xem theo tuần hoặc tháng
            return filtered.reduce((acc: Record<string, any[]>, booking: any) => {
                if (!acc[booking.date]) {
                    acc[booking.date] = [];
                }
                acc[booking.date].push(booking);
                return acc;
            }, {});
        }
    };

    // Thêm hàm mới để lấy tiêu đề cho danh sách bên trái
    const getListTitle = () => {
        return `Lịch đặt sân: ${selectedListDate.format('DD-MM-YYYY')}`;
    };

    // Sửa lại hàm lọc bookings cho danh sách bên trái
    const getListBookings = () => {
        let filtered = [...bookings];

        // Lọc chỉ những order có paymentStatus === "success"
        filtered = filtered.filter((booking: any) => booking.paymentStatus === "success");

        // Lọc theo ngày đã chọn cho danh sách
        const apiDateFormat = selectedListDate.format('DD-MM-YYYY');
        filtered = filtered.filter((booking: any) => booking.date === apiDateFormat);

        // Lọc theo sân nếu có chọn sân
        if (selectedField) {
            filtered = filtered.filter((booking: any) => booking.fieldName === selectedField);
        }

        // Nhóm theo field
        return filtered.reduce((acc: Record<string, any[]>, booking: any) => {
            if (!acc[booking.fieldName]) {
                acc[booking.fieldName] = [];
            }
            acc[booking.fieldName].push(booking);
            return acc;
        }, {});
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

        return (
            <div
                className={`
                    h-full p-2 rounded-lg cursor-pointer transition-all duration-300
                    ${isSelected ? 'bg-blue-500 text-white shadow-md' : ''}
                    ${isToday && !isSelected ? 'border-2 border-blue-400 bg-blue-50' : ''}
                    ${!isCurrentMonth ? 'opacity-40' : ''}
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

    // Nhóm bookings theo field hoặc ngày
    const groupedBookings = viewMode === 'day' ? groupBookings() : getListBookings();

    useEffect(() => {
        const getData = async () => {
            await dispatch(getListOrdersSlice());
        }
        getData()
    }, []);

    // Load fields khi có footballField
    useEffect(() => {
        if (footballField?._id) {
            dispatch(getListFieldsSlice(footballField._id));
        }
    }, [footballField?._id]);

    // Tính số lượt đặt theo sân cho ngày đã chọn
    const getFieldBookingStats = () => {
        const selectedDateFormatted = dayjs(selectedDateForStats, 'DD-MM-YYYY').format('DD-MM-YYYY');

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

        return fieldStats;
    };

    return (
        <Layout className="p-6 bg-gray-50 min-h-screen">
            <div className="mb-6">
                <Title level={3}>Quản lý lịch đặt sân</Title>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Bộ lọc và danh sách đặt sân */}
                <Card className="lg:w-1/4 shadow-sm">
                    <div className="mb-4">
                        <Title level={4} className="mb-4">{getListTitle()}</Title>

                        <div className="mb-4">
                            <Text strong>Lọc theo sân:</Text>
                            <Select
                                className="w-full mt-2"
                                placeholder="Chọn sân"
                                allowClear
                                onChange={(value) => setSelectedField(value)}
                            >
                                {fieldList.map((field: string) => (
                                    <Option key={field} value={field}>{field}</Option>
                                ))}
                            </Select>
                        </div>

                        <Divider className="my-4" />

                        {Object.keys(groupedBookings).length > 0 ? (
                            <div className="space-y-4">
                                {Object.entries(groupedBookings).map(([key, bookings]) => (
                                    <div key={key} className="border rounded-lg p-3 bg-white"
                                        style={{border:"1px solid #D1D5DC"}}
                                    >
                                        <Text strong className="text-lg">
                                            {viewMode === 'day' ? key : `${key}`}
                                        </Text>
                                        <Divider className="my-2" />
                                        <div className="space-y-3">
                                            {bookings.map((booking: any) => (
                                                <div
                                                    key={booking._id || booking.id}
                                                    className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer"
                                                    onClick={() => handleViewBooking(booking._id || booking.id)}
                                                >
                                                    <div className="flex items-center">
                                                        <Avatar icon={<UserOutlined />} className="mr-2" />
                                                        <div>
                                                            <Text strong>{booking.teamName || "Không xác định"}</Text>
                                                            <div className="text-gray-500 text-sm">
                                                                {viewMode !== 'day' && `${booking.fieldName} - `}
                                                                {booking.timeStart || ""}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Tag color="blue">Chi tiết</Tag>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <CalendarOutlined style={{ fontSize: '32px' }} />
                                <p className="mt-2">Không có ca đá nào trong {
                                    viewMode === 'day' ? 'ngày' :
                                    viewMode === 'week' ? 'tuần' :
                                    viewMode === 'month' ? 'tháng' : 'thời gian'
                                } này</p>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Lịch */}
                <Card className="lg:w-3/4 shadow-sm rounded-xl overflow-hidden">
                    <div >
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
                            <div className="">
                                <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
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

                                                        <Divider className="my-2" />

                                                        <div className="space-y-2">
                                                            <div className="flex items-center">
                                                                <Checkbox defaultChecked />
                                                                <span className="ml-2">Hiển thị cuối tuần</span>
                                                            </div>
                                                            <div className="flex items-center">
                                                                <Checkbox defaultChecked />
                                                                <span className="ml-2">Hiển thị lịch đã hủy</span>
                                                            </div>
                                                            <div className="flex items-center">
                                                                <Checkbox defaultChecked />
                                                                <span className="ml-2">Hiển thị lịch đã hoàn thành</span>
                                                            </div>
                                                            <div className="flex items-center">
                                                                <Checkbox defaultChecked />
                                                                <span className="ml-2">Hiển thị lịch đặt sân</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex border rounded-md">
                                            <Button
                                                type="text"
                                                icon={<CalendarOutlined />}
                                                className="border-0 rounded-l-md"
                                            />
                                            <Button
                                                type="text"
                                                icon={<AppstoreOutlined />}
                                                className="border-0 border-l rounded-r-md"
                                            />
                                        </div>

                                        <Button
                                            type="text"
                                            icon={<SettingOutlined />}
                                            className="rounded-full"
                                        />
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
                                    <div className="p-4">
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
                                                    const bookingDate = dayjs(booking.date.split('-').reverse().join('-'));
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
                    </div>
                </Card>
            </div>

            {/* Thống kê sân theo ngày */}
            <div className="mt-6">
                <Card className="shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                        <Title level={4} className="mb-0 flex items-center">
                            <AppstoreOutlined className="mr-2 text-blue-500" />
                            Thống kê sân theo ngày
                        </Title>
                        <DatePicker
                            value={dayjs(selectedDateForStats, 'DD-MM-YYYY')}
                            onChange={(date) => {
                                if (date) {
                                    setSelectedDateForStats(date.format('DD-MM-YYYY'));
                                }
                            }}
                            format="DD-MM-YYYY"
                            placeholder="Chọn ngày"
                            className="w-40"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {getFieldBookingStats().map((fieldStat: any) => (
                            <div
                                key={fieldStat.fieldId}
                                className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
                                style={{border:"1px solid #D1D5DC"}}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center">
                                        <div className={`w-3 h-3  rounded-full mr-2  ${fieldStat.bookingCount > 0 ? 'bg-red-500' : 'bg-blue-500'} `}></div>
                                        <Text strong className="text-lg">{fieldStat.fieldName}</Text>
                                    </div>
                                    <Tag color={fieldStat.status === 'Hoạt động' ? 'green' : 'red'}>
                                        {fieldStat.status}
                                    </Tag>
                                </div>

                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Số lượt đặt:</span>
                                        <span className={`font-bold ${fieldStat.bookingCount > 0 ? 'text-red-500' : 'text-blue-500'}`}>
                                            {fieldStat.bookingCount} lượt
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Sức chứa:</span>
                                        <span className="font-medium">{fieldStat.people}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Mặt sân:</span>
                                        <span className="font-medium">{fieldStat.surface || 'Không xác định'}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {getFieldBookingStats().length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            <AppstoreOutlined style={{ fontSize: '32px' }} />
                            <p className="mt-2">Chưa có dữ liệu sân bóng</p>
                            <p className="text-sm">Vui lòng thêm sân bóng để xem thống kê</p>
                        </div>
                    )}
                </Card>
            </div>

            {/* Modal hiển thị chi tiết đặt sân */}
            <Modal
                title={
                    <div className="flex items-center">
                        <CalendarOutlined className="mr-2 text-blue-500" />
                        <span>Thông tin đặt sân</span>
                    </div>
                }
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setModalVisible(false)}>
                        Đóng
                    </Button>
                ]}
                width={500}
            >
                {selectedBooking ? (
                    <div className="space-y-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="flex items-center mb-2">
                                <UserOutlined className="mr-2 text-blue-500" />
                                <Text strong>Thông tin người đặt</Text>
                            </div>
                            <div className="ml-6 space-y-2">
                                <div className="flex items-center">
                                    <Text className="min-w-32">Tên đội:</Text>
                                    <Text strong>{selectedBooking.teamName || "Không có thông tin"}</Text>
                                </div>
                                <div className="flex items-center">
                                    <Text className="min-w-32">Số điện thoại:</Text>
                                    <Text strong>{selectedBooking.phoneNumber || "Không có thông tin"}</Text>
                                </div>
                            </div>
                        </div>

                        <div className="bg-green-50 p-4 rounded-lg">
                            <div className="flex items-center mb-2">
                                <CalendarOutlined className="mr-2 text-green-500" />
                                <Text strong>Thông tin đặt sân</Text>
                            </div>
                            <div className="ml-6 space-y-2">
                                <div className="flex items-center">
                                    <Text className="min-w-32">Sân:</Text>
                                    <Text strong>{selectedBooking.fieldName || "Không có thông tin"}</Text>
                                </div>
                                <div className="flex items-center">
                                    <Text className="min-w-32">Khung giờ:</Text>
                                    <Text strong>{selectedBooking.timeStart || ""}</Text>
                                </div>
                                 <div className="flex items-center">
                                    <Text className="min-w-32">Ngày đặt:</Text>
                                    <Text strong>{selectedBooking.transactionDate || "Không có thông tin"}</Text>
                                </div>
                                <div className="flex items-center">
                                    <Text className="min-w-32">Giá tiền:</Text>
                                    <Text strong className='text-red-500'>{selectedBooking.amount ? Intl.NumberFormat('vi-VN').format(selectedBooking.amount) + " VND" : "Không có thông tin"}</Text>
                                </div>
                            </div>
                        </div>

                        {selectedBooking.note && (
                            <div className="bg-yellow-50 p-4 rounded-lg">
                                <div className="flex items-center mb-2">
                                    <MessageOutlined className="mr-2 text-yellow-500" />
                                    <Text strong>Ghi chú</Text>
                                </div>
                                <div className="ml-6">
                                    <Text>{selectedBooking.note}</Text>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        <p>Không có dữ liệu đặt sân.</p>
                    </div>
                )}
            </Modal>
        </Layout>
    );
};

export default QuanLiSanBong
