'use client';
import { useEffect, useState, useMemo, useCallback } from "react";
import { Card, Button, Collapse, Tag } from "antd";
import { EnvironmentOutlined, PhoneOutlined, FilterOutlined, CalendarOutlined, RightOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/vi"; // Import tiếng Việt cho Day.js
import Link from "next/link";
import { Field, TimeSlot } from "@/models/field";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { getFootballFieldByIdSlice } from "@/features/footballField.slice";
import { setBreadcrumb } from "@/features/breadcrumb.slice";
import { FootballField } from "@/models/football_field";
import { Order } from "@/models/payment";
import { useFieldPageData } from "@/hooks/useFieldData";

const Detail = () => {
  const footballField = useAppSelector(state => state.footballField.detail) as FootballField
  const dispatch = useAppDispatch();

  // 🚀 SWR hooks - Đơn giản và mạnh mẽ
  const {
    fields,
    timeSlots: timeslots,
    orders,
    isLoading,
    hasError,
    refetchAll
  } = useFieldPageData(footballField?._id);

  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs()); // Ngày đang chọn
  const [selectedFieldType, setSelectedFieldType] = useState<string>("all"); // Bộ lọc loại sân
  const [showCalendar, setShowCalendar] = useState(false); // Hiển thị calendar inline
  const [tempSelectedDate, setTempSelectedDate] = useState<Dayjs>(dayjs()); // Ngày tạm chọn trong calendar

  dayjs.locale("vi"); // Thiết lập ngôn ngữ cho Dayjs
  console.log("orders", orders);

  // 🚀 MEMOIZED FUNCTIONS - Tối ưu performance
  const handleDateChange = useCallback((key: string) => {
    // Tách giá trị ngày, tháng, năm từ key
    const [day, month, year] = key.split("/").map(Number);
    // Tạo đối tượng dayjs đúng
    const convertedDate = dayjs(`${year}-${month}-${day}`, "YYYY-M-D", true);
    setSelectedDate(convertedDate);
  }, []);

  // Chuyển đổi số thứ trong tuần thành dạng đúng của tiếng Việt
  const getVietnameseDay = useCallback((dayNumber: number) => {
    if (dayNumber === 0) return "CN"; // Chủ Nhật
    return `Th ${dayNumber + 1}`; // Thứ 2 -> Thứ 7
  }, []);

  // 🚀 MEMOIZED FILTERED FIELDS - Chỉ tính toán lại khi fields hoặc selectedFieldType thay đổi
  const filteredFields = useMemo(() => {
    if (selectedFieldType === "all") return fields;
    return fields.filter((field: Field) => field.people.toString() === selectedFieldType);
  }, [fields, selectedFieldType]);

  // 🚀 MEMOIZED DATES - Chỉ tính toán lại khi selectedDate thay đổi
  const dates = useMemo(() => {
    return Array.from({ length: 30 }, (_, index) => {
      const date = dayjs().add(index, "day");
      const isSelected = date.format("D/M/YYYY") === selectedDate.format("D/M/YYYY");

      return {
        key: date.format("D/M/YYYY"),
        label: (
          <div className={`flex flex-col items-center justify-center py-2 sm:py-3 transition-all flex-shrink-0 ${isSelected
            ? 'bg-[#FE6900] text-white shadow-md'
            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            } w-[80px] sm:w-[100px] md:w-[120px] h-[60px] sm:h-[75px] md:h-[90px]`}>
            <div className="text-sm sm:text-base md:text-lg font-medium">{date.format("D/M")}</div>
            <div className={`text-xs sm:text-sm md:text-base ${isSelected ? 'text-white' : 'text-gray-500'}`}>
              {getVietnameseDay(date.day())}
            </div>
          </div>
        ),
      };
    });
  }, [selectedDate, getVietnameseDay]);


  // 🚀 Simple useEffect chỉ để load footballField và set breadcrumb
  useEffect(() => {
    const getData = async () => {
      try {
        // Lấy thông tin sân bóng của người dùng
        await dispatch(getFootballFieldByIdSlice("67ce9ea74c79326f98b8bf8e"));

        // Thêm breadcrumb
        dispatch(setBreadcrumb([
          { name: 'Home', url: '/' },
          { name: 'Đặt sân', url: '/homepage/datSan' },
        ]));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    getData();
  }, []);
  console.log("orders", orders);

  return (
    <div className="min-h-screen ">
      <div className="">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Phần bên trái - Chọn ngày và danh sách sân */}
          <div className="w-full lg:w-2/3">
            {/* Header với tiêu đề */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 xl:hidden">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                Đặt sân bóng đá
              </h1>
              <p className="text-gray-600">Chọn ngày và sân phù hợp để bắt đầu trận đấu của bạn</p>
            </div>

            {/* Chọn ngày - Style responsive */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                📅 Chọn ngày đặt sân
              </h2>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                {/* Hiển thị ngày responsive */}
                <div className="w-full overflow-x-auto">
                  <div className="flex rounded-lg border overflow-hidden border-gray-200 min-w-max">
                    {dates.slice(0, 7).map((date) => (
                      <div
                        key={date.key}
                        onClick={() => handleDateChange(date.key)}
                        className="cursor-pointer flex-shrink-0"
                      >
                        {date.label}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Nút toggle calendar responsive */}
                <div
                  onClick={() => {
                    setTempSelectedDate(selectedDate); // Set ngày hiện tại vào temp
                    setShowCalendar(!showCalendar);
                  }}
                  className={`cursor-pointer flex-shrink-0 flex flex-col items-center justify-center py-3 px-4 transition-all duration-200 w-full sm:w-[100px] min-w-[100px] h-[60px] sm:h-[90px] rounded-lg border-2 border-dashed ${showCalendar
                    ? 'border-[#FE6900] bg-orange-50'
                    : 'bg-gray-100 text-gray-600  border-gray-300 hover:border-[#FE6900]'
                    }`}
                >
                  <CalendarOutlined className="text-lg sm:text-xl mb-1" />
                  <div className="text-xs sm:text-sm font-medium">Khác</div>
                </div>
              </div>
            </div>

            {/* Calendar inline responsive */}
            {showCalendar && (
              <div className="mt-4 p-4 md:p-6 bg-white rounded-xl shadow-lg border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg md:text-xl font-semibold text-gray-800">📅 Chọn ngày đặt sân</h3>
                  <Button
                    type="text"
                    onClick={() => {
                      setShowCalendar(false);
                      setTempSelectedDate(selectedDate); // Reset về ngày đã chọn
                    }}
                    className="text-gray-500 hover:text-gray-700 text-lg"
                  >
                    ✕
                  </Button>
                </div>
                {/* Custom Calendar Grid */}
                <div className="bg-white">
                  {/* Header responsive */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 px-2 gap-2">
                    <div className="text-lg md:text-xl font-semibold">
                      {tempSelectedDate.format('MMMM YYYY')}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500">
                      Chọn ngày từ hôm nay đến {dayjs().add(30, 'day').format('DD/MM')}
                    </div>
                  </div>

                  {/* Days of week header responsive */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day) => (
                      <div key={day} className="text-center text-xs sm:text-sm font-medium text-gray-500 py-2">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {(() => {
                      const today = dayjs();

                      // Logic để quyết định hiển thị tháng nào:
                      // - Nếu tempSelectedDate là tháng hiện tại: hiển thị từ tuần chứa ngày hôm nay
                      // - Nếu tempSelectedDate là tháng khác: hiển thị từ đầu tháng đó
                      let startDate;
                      if (tempSelectedDate.isSame(today, 'month')) {
                        // Cùng tháng với hôm nay: bắt đầu từ tuần chứa ngày hôm nay
                        startDate = today.startOf('week');
                      } else {
                        // Tháng khác: bắt đầu từ đầu tuần đầu tiên của tháng đó
                        startDate = tempSelectedDate.startOf('month').startOf('week');
                      }

                      const dates = [];

                      // Tạo 6 tuần (42 ngày) để hiển thị đầy đủ calendar
                      for (let i = 0; i < 42; i++) {
                        const currentDate = startDate.add(i, 'day');
                        const isToday = currentDate.isSame(today, 'day');
                        const isSelected = currentDate.isSame(tempSelectedDate, 'day');
                        const isDisabled = currentDate.isBefore(today, 'day') || currentDate.isAfter(today.add(30, 'day'), 'day');
                        const isCurrentMonth = currentDate.isSame(tempSelectedDate, 'month');

                        dates.push(
                          <div
                            key={i}
                            onClick={() => {
                              if (!isDisabled) {
                                setTempSelectedDate(currentDate);
                              }
                            }}
                            className={`
                            h-8 sm:h-10 md:h-12 flex items-center justify-center text-xs sm:text-sm cursor-pointer rounded-lg transition-all
                            ${isSelected ? 'bg-[#FE6900] text-white font-semibold' : ''}
                            ${isToday && !isSelected ? 'bg-orange-100 text-[#FE6900] font-semibold border-2 border-[#FE6900]' : ''}
                            ${isDisabled ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-orange-50'}
                            ${!isCurrentMonth && !isDisabled ? 'text-gray-400' : ''}
                            ${!isSelected && !isToday && !isDisabled && isCurrentMonth ? 'text-gray-700' : ''}
                          `}
                          >
                            {currentDate.date()}
                          </div>
                        );
                      }

                      return dates;
                    })()}
                  </div>
                </div>

                {/* Buttons responsive */}
                <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
                  <Button
                    onClick={() => {
                      setShowCalendar(false);
                      setTempSelectedDate(selectedDate); // Reset về ngày đã chọn
                    }}
                    className="w-full sm:w-auto"
                  >
                    Hủy
                  </Button>
                  <Button
                    type="primary"
                    onClick={() => {
                      setSelectedDate(tempSelectedDate);
                      setShowCalendar(false);
                    }}
                    className="w-full sm:w-auto bg-[#FE6900] hover:bg-[#E55A00] border-[#FE6900] hover:border-[#E55A00]"
                  >
                    Chọn ngày này
                  </Button>
                </div>

                <div className="mt-4 p-3 md:p-4 bg-orange-50 rounded-lg">
                  <div className="text-sm md:text-base text-[#FE6900] font-medium">
                    📋 Quy định đặt sân:
                  </div>
                  <div className="text-xs sm:text-sm text-orange-700 mt-1">
                    • Chỉ có thể đặt sân từ hôm nay đến tối đa 30 ngày tới (<strong>{dayjs().add(30, 'day').format('DD/MM/YYYY')}</strong>)
                  </div>
                </div>
              </div>
            )}

            {/* Bộ lọc loại sân responsive */}
            <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex items-center gap-2">
                  <FilterOutlined className="text-[#FE6900] text-lg" />
                  <span className="font-semibold text-gray-800">Lọc theo loại sân:</span>
                </div>
                <div className="flex gap-2 md:gap-3 flex-wrap w-full sm:w-auto">
                  <Tag
                    color={selectedFieldType === "all" ? "orange" : "default"}
                    className={`cursor-pointer px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium hover:scale-105 transition-all duration-200 ${selectedFieldType === "all"
                      ? 'bg-[#FE6900] text-white border-[#FE6900]'
                      : 'bg-gray-100 text-gray-600 hover:bg-orange-50 hover:text-[#FE6900] hover:border-[#FE6900]'
                      }`}
                    onClick={() => setSelectedFieldType("all")}
                  >
                    Tất cả
                  </Tag>
                  <Tag
                    color={selectedFieldType === "5v5" ? "orange" : "default"}
                    className={`cursor-pointer px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium hover:scale-105 transition-all duration-200 ${selectedFieldType === "5v5"
                      ? 'bg-[#FE6900] text-white border-[#FE6900]'
                      : 'bg-gray-100 text-gray-600 hover:bg-orange-50 hover:text-[#FE6900] hover:border-[#FE6900]'
                      }`}
                    onClick={() => setSelectedFieldType("5v5")}
                  >
                    Sân 5
                  </Tag>
                  <Tag
                    color={selectedFieldType === "7v7" ? "orange" : "default"}
                    className={`cursor-pointer px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium hover:scale-105 transition-all duration-200 ${selectedFieldType === "7v7"
                      ? 'bg-[#FE6900] text-white border-[#FE6900]'
                      : 'bg-gray-100 text-gray-600 hover:bg-orange-50 hover:text-[#FE6900] hover:border-[#FE6900]'
                      }`}
                    onClick={() => setSelectedFieldType("7v7")}
                  >
                    Sân 7
                  </Tag>
                  <Tag
                    color={selectedFieldType === "22" ? "orange" : "default"}
                    className={`cursor-pointer px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium hover:scale-105 transition-all duration-200 ${selectedFieldType === "22"
                      ? 'bg-[#FE6900] text-white border-[#FE6900]'
                      : 'bg-gray-100 text-gray-600 hover:bg-orange-50 hover:text-[#FE6900] hover:border-[#FE6900]'
                      }`}
                    onClick={() => setSelectedFieldType("22")}
                  >
                    Sân 11
                  </Tag>
                </div>
              </div>
            </div>

            {/* Danh sách sân responsive */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
              <div className="text-center mb-6">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
                  Danh sách sân ({selectedDate.format("DD/MM/YYYY")})
                </h2>
              </div>

              {isLoading || !fields ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
                      {/* Header skeleton */}
                      <div className="p-4 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="h-6 bg-gray-300 rounded w-24"></div>
                            <div className="h-5 bg-gray-200 rounded w-16"></div>
                          </div>
                          <div className="h-8 bg-gray-300 rounded w-20"></div>
                        </div>
                        <div className="mt-2 space-y-1">
                          <div className="h-4 bg-gray-200 rounded w-48"></div>
                          <div className="h-4 bg-gray-200 rounded w-32"></div>
                        </div>
                      </div>

                      {/* Time slots skeleton */}
                      <div className="p-4">
                        <div className="h-5 bg-gray-300 rounded w-32 mb-3"></div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((slot) => (
                            <div key={slot} className="h-10 bg-gray-200 rounded"></div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : fields && fields.length > 0 ? (
                <div className="space-y-4">
                  {filteredFields.map((field: Field, index: number) => (
                    <div key={index + 1} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                      <Collapse
                        className="border-none"
                        items={[
                          {
                            key: field._id,
                            label: (
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center gap-3">
                                    <span className="font-semibold text-gray-800 text-base md:text-lg leading-none">{field.name}</span>
                                    <span className={`text-xs md:text-sm px-2 py-1 rounded-full leading-none ${field.status === 'Bảo trì'
                                      ? ' text-red-600'
                                      : ' text-green-600'
                                      }`}>
                                      {field.status}
                                    </span>
                                  </div>
                                </div>

                                <span className="text-xs text-gray-500 leading-none">
                                  {field.people} người
                                </span>
                              </div>
                            ),
                            children:
                              <div className="p-4">
                                {field.status === 'Bảo trì' ? (
                                  <div className="text-center py-8">
                                    <div className="text-4xl mb-2">🔧</div>
                                    <p className="text-gray-500 font-medium">Sân này hiện đang bảo trì, không thể đặt lịch.</p>
                                  </div>
                                ) : (
                                  timeslots && Array.isArray(timeslots) && timeslots.length > 0 ? (
                                    <div>
                                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                                        {timeslots.map((slot: TimeSlot, idx: number) => (
                                          <Button
                                            key={idx}
                                            // Thay đổi từ bookings.some sang orders.some
                                            disabled={orders.length > 0 && orders.some(
                                              (o: Order) =>
                                                o.date === selectedDate.format('DD-MM-YYYY') &&
                                                o.fieldName === field.name &&
                                                o.timeStart === slot.time &&
                                                o.paymentStatus === "success"
                                            )}
                                            className={`
                                          px-3 py-2 m-1 rounded-lg text-sm font-medium transition-all duration-200
                                          ${orders.length > 0 && orders.some(
                                              (o: Order) =>
                                                o.date === selectedDate.format('DD-MM-YYYY') &&
                                                o.fieldName === field.name &&
                                                o.timeStart === slot.time &&
                                                o.paymentStatus === "success"
                                            )
                                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed border-gray-200'
                                                : 'bg-white border-[#FE6900]  text-[#FE6900] hover:bg-[#FE6900] hover:text-white border-1'
                                              }
                                        `}
                                          >
                                            <Link href={`/homepage/datSan/${field._id}/${slot._id}?date=${selectedDate.format("DD-MM-YYYY")}`}>
                                              {slot.time}
                                            </Link>
                                          </Button>
                                        ))}
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="text-center py-8">
                                      <div className="text-4xl mb-2">⏰</div>
                                      <p className="text-gray-500 font-medium">Không có ca đá trong ngày này.</p>
                                    </div>
                                  )
                                )}
                              </div>,
                          }

                        ]}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🏟️</div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Chưa có sân nào</h3>
                  <p className="text-gray-500">Hiện tại chưa có sân bóng nào được thiết lập.</p>
                </div>
              )}
            </div>
          </div>

          {/* Phần bên phải - Thông tin bổ sung responsive */}
          <div className="w-full lg:w-1/3 space-y-6">
            {/* Thông tin sân bóng */}
            <Card
              title={
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold">Thông tin sân bóng</span>
                </div>
              }
              className="shadow-sm border border-gray-200 rounded-xl overflow-hidden mb-6"
              cover={
                <div className="relative">
                  <img
                    alt="stadium"
                    src={footballField?.image}
                    className="h-40 sm:h-48 md:h-56 w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
              }
            >
              <div className="space-y-3">
                <h2 className="text-lg md:text-xl font-bold text-gray-800">{footballField?.name}</h2>
                <div className="space-y-2">
                  <p className="text-gray-600 flex items-start gap-2 text-sm">
                    <EnvironmentOutlined className="text-[#FE6900] mt-0.5 flex-shrink-0" />
                    <span>
                      {footballField?.address && `${footballField.address?.detail ? `${footballField.address.detail}, ` : ""} ${footballField.address.ward}, ${footballField.address.district}, ${footballField.address.province}`}
                    </span>
                  </p>
                  <p className="text-gray-600 flex items-center gap-2 text-sm">
                    <PhoneOutlined className="text-[#FE6900]" />
                    <span>{footballField?.phone}</span>
                  </p>
                </div>
                <Link href={`/homepage/datSan/${footballField?._id}/detail`}>
                  <Button
                    type="primary"
                    className="mt-4 w-full h-10 rounded-lg font-medium"
                    style={{
                      backgroundColor: '#FE6900',
                    }}
                  >

                    📋 Xem chi tiết sân

                  </Button>
                </Link>
              </div>
            </Card>

            {/* Hướng dẫn đặt sân */}
            <Card
              title={
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold">📋 Hướng dẫn đặt sân</span>
                </div>
              }
              className="shadow-sm border border-gray-200 rounded-xl mb-6"
            >
              <ol className="list-decimal pl-4 space-y-3 text-sm md:text-base">
                <li className="text-gray-700">
                  <span className="font-medium">Chọn ngày</span> bạn muốn đặt sân
                </li>
                <li className="text-gray-700">
                  <span className="font-medium">Chọn sân phù hợp</span> từ danh sách
                </li>
                <li className="text-gray-700">
                  <span className="font-medium">Chọn khung giờ</span> còn trống
                </li>
                <li className="text-gray-700">
                  <span className="font-medium">Điền thông tin</span> và thanh toán
                </li>
                <li className="text-gray-700">
                  <span className="font-medium">Nhận xác nhận</span> đặt sân qua email
                </li>
              </ol>
            </Card>

            {/* Thống kê */}
            <Card
              title={
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold">📊 Thống kê</span>
                </div>
              }
              className="shadow-sm border border-gray-200 rounded-xl"
            >
              {isLoading || !fields ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg animate-pulse">
                      <div className="h-4 bg-gray-300 rounded w-24"></div>
                      <div className="h-6 bg-gray-300 rounded w-8"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600 text-sm">🏟️ Tổng số sân:</span>
                    <span className="font-bold text-[#FE6900] text-lg">{fields?.length || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600 text-sm">👁️ Sân hiển thị:</span>
                    <span className="font-bold text-[#FE6900] text-lg">{filteredFields?.length || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600 text-sm">⏰ Khung giờ có sẵn:</span>
                    <span className="font-bold text-[#FE6900] text-lg">{Array.isArray(timeslots) ? timeslots.length : 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                    <span className="text-gray-600 text-sm">✅ Đã đặt hôm nay:</span>
                    <span className="font-bold text-[#FE6900] text-lg">
                      {orders.length > 0 && orders?.filter((o: Order) =>
                        o.date === dayjs().format('DD-MM-YYYY') &&
                        o.paymentStatus === "success"
                      )?.length || 0}
                    </span>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};


export default Detail;
