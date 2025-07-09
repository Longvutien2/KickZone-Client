'use client';
import React, { useEffect, useState, useMemo, useCallback } from "react";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/vi"; // Import tiếng Việt cho Day.js
import dynamic from 'next/dynamic';
import { Field } from "@/models/field";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { setBreadcrumb } from "@/features/breadcrumb.slice";
import { FootballField } from "@/models/football_field";
import { TimeSlot } from "@/models/field";

// Import components - Core components (always needed)
import DateSelector from "@/components/booking/DateSelector";
import CompactFilter from "@/components/booking/CompactFilter";

// Sidebar components - load ngay (data đơn giản)
import FieldInfoCard from "@/components/booking/FieldInfoCard";
import BookingGuide from "@/components/booking/BookingGuide";
import StatisticsCard from "@/components/booking/StatisticsCard";

// Dynamic imports - Chỉ cho components thực sự cần lazy loading
const FieldsList = dynamic(() => import("@/components/booking/FieldsList"), {
  ssr: false
});

// Calendar chỉ load khi user click "Khác"
const CalendarComponent = dynamic(() => import("@/components/booking/CalendarComponent"), {
  ssr: false
});

interface BookFieldClientProps {
  initialData: {
    footballField: FootballField;
    fields: Field[];
    timeSlots: TimeSlot[];
    orders: any[];
  };
}

const BookFieldClient: React.FC<BookFieldClientProps> = ({ initialData }) => {
  // ✅ Use server-side pre-fetched data
  const { footballField, fields, timeSlots: timeslots, orders } = initialData;

  const auth = useAppSelector(state => state.auth);
  const dispatch = useAppDispatch();

  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs()); // Ngày đang chọn
  const [selectedFieldType, setSelectedFieldType] = useState<string>("all"); // Bộ lọc loại sân
  const [showCalendar, setShowCalendar] = useState(false); // Hiển thị calendar inline
  const [tempSelectedDate, setTempSelectedDate] = useState<Dayjs>(dayjs()); // Ngày tạm chọn trong calendar

  // Thêm state cho filter mới
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null); // Lọc theo khung giờ
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]); // Lọc theo giá
  const [showAvailableOnly, setShowAvailableOnly] = useState<boolean>(false); // Chỉ hiển thị sân trống

  dayjs.locale("vi"); // Thiết lập ngôn ngữ cho Dayjs

  // 🚀 MEMOIZED FUNCTIONS - Tối ưu performance
  const handleDateChange = useCallback((key: string) => {
    // Tách giá trị ngày, tháng, năm từ key
    const [day, month, year] = key.split("/").map(Number);
    // Tạo đối tượng dayjs đúng
    const convertedDate = dayjs(`${year}-${month}-${day}`, "YYYY-M-D", true);
    setSelectedDate(convertedDate);
  }, []);

  // 🚀 Tính maxPrice từ timeSlots
  const maxPrice = useMemo(() => {
    if (!timeslots || timeslots.length === 0) return 1000000;
    return Math.max(...timeslots.map((slot: any) => slot.price || 0));
  }, [timeslots]);

  // 🚀 Cập nhật priceRange khi maxPrice thay đổi
  useEffect(() => {
    setPriceRange([0, maxPrice]);
  }, [maxPrice]);

  // 🚀 MEMOIZED FILTERED FIELDS - Lọc field có timeSlot phù hợp
  const filteredFields = useMemo(() => {
    let filtered = fields;

    // Lọc theo loại sân
    if (selectedFieldType !== "all") {
      filtered = filtered.filter((field: Field) => field.people.toString() === selectedFieldType);
    }

    // Chỉ áp dụng filter timeSlot khi user thực sự đã chọn filter
    const hasActiveFilters = selectedTimeSlot ||
                            priceRange[0] > 0 ||
                            priceRange[1] < maxPrice ||
                            showAvailableOnly;

    if (hasActiveFilters) {
      // Kiểm tra xem có timeSlots nào thỏa mãn điều kiện không
      const hasValidTimeSlots = timeslots.some((slot: any) => {
        // Lọc theo khung giờ
        if (selectedTimeSlot && slot.time !== selectedTimeSlot) return false;

        // Lọc theo giá
        if (slot.price < priceRange[0] || slot.price > priceRange[1]) return false;

        return true;
      });

      // Nếu không có timeSlot nào thỏa mãn, ẩn tất cả fields
      if (!hasValidTimeSlots) {
        filtered = [];
      }

      // Nếu có filter "chỉ hiển thị sân trống", filter theo field
      if (showAvailableOnly && hasValidTimeSlots) {
        filtered = filtered.filter((field: Field) => {
          // Kiểm tra field này có ít nhất 1 timeSlot trống không
          return timeslots.some((slot: any) => {
            // Lọc theo khung giờ và giá trước
            if (selectedTimeSlot && slot.time !== selectedTimeSlot) return false;
            if (slot.price < priceRange[0] || slot.price > priceRange[1]) return false;

            // Kiểm tra timeSlot này có trống cho field này không
            const isBooked = orders.some((order: any) =>
              order.date === selectedDate.format('DD-MM-YYYY') &&
              order.fieldName === field.name &&
              order.timeStart === slot.time &&
              order.paymentStatus === "success"
            );
            return !isBooked;
          });
        });
      }
    }

    return filtered;
  }, [fields, selectedFieldType, selectedTimeSlot, priceRange, maxPrice, showAvailableOnly, timeslots, orders, selectedDate]);

  // 🚀 Simple useEffect chỉ để set breadcrumb
  useEffect(() => {
    // Thêm breadcrumb
    dispatch(setBreadcrumb([
      { name: 'Home', url: '/' },
      { name: 'Đặt sân', url: '/homepage/book-field' },
    ]));
  }, [dispatch]);

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
            <DateSelector
              selectedDate={selectedDate}
              onDateChange={handleDateChange}
              showCalendar={showCalendar}
              setShowCalendar={setShowCalendar}
              setTempSelectedDate={setTempSelectedDate}
            />

            {/* Calendar inline responsive */}
            {showCalendar && (
              <CalendarComponent
                tempSelectedDate={tempSelectedDate}
                setTempSelectedDate={setTempSelectedDate}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                setShowCalendar={setShowCalendar}
              />
            )}

            {/* Bộ lọc compact */}
            <CompactFilter
              selectedFieldType={selectedFieldType}
              onFieldTypeChange={setSelectedFieldType}
              selectedTimeSlot={selectedTimeSlot}
              onTimeSlotChange={setSelectedTimeSlot}
              priceRange={priceRange}
              onPriceRangeChange={setPriceRange}
              showAvailableOnly={showAvailableOnly}
              onAvailableOnlyChange={setShowAvailableOnly}
              timeSlots={timeslots}
              maxPrice={maxPrice}
            />

            {/* Danh sách sân responsive */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
              <div className="text-center mb-6">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
                  Danh sách sân ({selectedDate.format("DD/MM/YYYY")})
                </h2>
              </div>

              {/* Menu filter trạng thái */}
              <div className="flex flex-wrap gap-6 mb-6 text-sm justify-center">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
                  <span>Trống</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orange-200 border border-orange-300 rounded"></div>
                  <span>Đã đặt</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-100 border border-gray-200 rounded"></div>
                  <span>Đã qua</span>
                </div>
              </div>

              <FieldsList
                fields={fields}
                filteredFields={filteredFields}
                timeslots={timeslots}
                orders={orders}
                selectedDate={selectedDate}
                isLoggedIn={auth.isLoggedIn}
                isLoading={false}
                selectedTimeSlot={selectedTimeSlot}
                priceRange={priceRange}
                showAvailableOnly={showAvailableOnly}
              />
            </div>
          </div>

          {/* Phần bên phải - Thông tin bổ sung responsive */}
          <div className="w-full lg:w-1/3 space-y-6">
            {/* Thông tin sân bóng */}
            <FieldInfoCard footballField={footballField} />

            {/* Hướng dẫn đặt sân */}
            <BookingGuide isLoggedIn={auth.isLoggedIn} />

            {/* Thống kê */}
            <StatisticsCard
              fields={fields}
              filteredFields={filteredFields}
              timeslots={timeslots}
              orders={orders}
              isLoading={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookFieldClient;
