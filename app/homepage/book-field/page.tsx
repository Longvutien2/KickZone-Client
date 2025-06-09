'use client';
import React, { useEffect, useState, useMemo, useCallback } from "react";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/vi"; // Import tiếng Việt cho Day.js
import dynamic from 'next/dynamic';
import { Field } from "@/models/field";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { getFootballFieldByIdSlice } from "@/features/footballField.slice";
import { setBreadcrumb } from "@/features/breadcrumb.slice";
import { FootballField } from "@/models/football_field";
import { useFieldPageData } from "@/hooks/useFieldDataPure";

// Import components - Core components (always needed)
import DateSelector from "@/components/booking/DateSelector";
import FieldTypeFilter from "@/components/booking/FieldTypeFilter";

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



const Detail = () => {
  const footballField = useAppSelector(state => state.footballField.detail) as FootballField
  const auth = useAppSelector(state => state.auth)

  const dispatch = useAppDispatch();

  const {
    fields = [],
    timeSlots: timeslots = [],
    orders = [],
    isLoading,
    hasError,
    refetchAll
  } = useFieldPageData(footballField?._id) || {};


  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs()); // Ngày đang chọn
  const [selectedFieldType, setSelectedFieldType] = useState<string>("all"); // Bộ lọc loại sân
  const [showCalendar, setShowCalendar] = useState(false); // Hiển thị calendar inline
  const [tempSelectedDate, setTempSelectedDate] = useState<Dayjs>(dayjs()); // Ngày tạm chọn trong calendar

  dayjs.locale("vi"); // Thiết lập ngôn ngữ cho Dayjs

  // 🚀 Error handling
  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Có lỗi xảy ra</h2>
          <p className="text-gray-600 mb-4">Không thể tải dữ liệu. Vui lòng thử lại.</p>
          <button
            onClick={() => refetchAll?.()}
            className="bg-[#FE6900] text-white px-6 py-2 rounded-lg hover:bg-[#e55a00]"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  // 🚀 MEMOIZED FUNCTIONS - Tối ưu performance
  const handleDateChange = useCallback((key: string) => {
    // Tách giá trị ngày, tháng, năm từ key
    const [day, month, year] = key.split("/").map(Number);
    // Tạo đối tượng dayjs đúng
    const convertedDate = dayjs(`${year}-${month}-${day}`, "YYYY-M-D", true);
    setSelectedDate(convertedDate);
  }, []);



  // 🚀 MEMOIZED FILTERED FIELDS - Chỉ tính toán lại khi fields hoặc selectedFieldType thay đổi
  const filteredFields = useMemo(() => {
    if (selectedFieldType === "all") return fields;
    return fields.filter((field: Field) => field.people.toString() === selectedFieldType);
  }, [fields, selectedFieldType]);




  // 🚀 Simple useEffect chỉ để load footballField và set breadcrumb
  useEffect(() => {
    const getData = async () => {
      try {
        // Lấy thông tin sân bóng của người dùng
        await dispatch(getFootballFieldByIdSlice("67ce9ea74c79326f98b8bf8e"));

        // Thêm breadcrumb
        dispatch(setBreadcrumb([
          { name: 'Home', url: '/' },
          { name: 'Đặt sân', url: '/homepage/book-field' },
        ]));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    getData();
  }, []);

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

            {/* Bộ lọc loại sân responsive */}
            <FieldTypeFilter
              selectedFieldType={selectedFieldType}
              onFieldTypeChange={setSelectedFieldType}
            />

            {/* Danh sách sân responsive */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
              <div className="text-center mb-6">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
                  Danh sách sân ({selectedDate.format("DD/MM/YYYY")})
                </h2>
              </div>
                  <FieldsList
                    fields={fields}
                    filteredFields={filteredFields}
                    timeslots={timeslots}
                    orders={orders}
                    selectedDate={selectedDate}
                    isLoggedIn={auth.isLoggedIn}
                    isLoading={isLoading}
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
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};


export default Detail;
