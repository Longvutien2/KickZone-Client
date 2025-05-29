'use client';
import { useEffect, useState } from "react";
import { Card, Button, Collapse, Tag } from "antd";
import { EnvironmentOutlined, PhoneOutlined, FilterOutlined, CalendarOutlined, RightOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/vi"; // Import tiếng Việt cho Day.js
import Link from "next/link";
import { Field, TimeSlot } from "@/models/field";
import { getFieldsByIdFootball } from "@/api/field";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { getFootballFieldByIdSlice, getFootballFieldByIdUserSlice } from "@/features/footballField.slice";
import { addBreadcrumb, resetBreadcrumb, setBreadcrumb } from "@/features/breadcrumb.slice";
import { FootballField } from "@/models/football_field";
import { getListTimeSlotsByFootballFieldId } from "@/features/timeSlot.slice";
import { getListOrdersSlice } from "@/features/order.slice";
import { Order } from "@/models/payment";

const { Panel } = Collapse

const Detail = () => {
  const auth = useAppSelector((state) => state.auth)
  const timeslots = useAppSelector(state => state.timeSlot.value)
  // Thay đổi từ bookings sang orders
  const orders = useAppSelector(state => state.order.value)
  const footballField = useAppSelector(state => state.footballField.detail) as FootballField



  const [data, setData] = useState<Field[]>([]); // Dữ liệu lọc the
  const [filteredData, setFilteredData] = useState<Field[]>([]); // Dữ liệu sau khi lọc
  // const { id } = useParams();
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs()); // Ngày đang chọn
  const [activeField, setActiveField] = useState<string | null>(null); // Sân nào đang mở
  const [selectedDate2, setSelectedDate2] = useState(dayjs().format("D/M"));
  const [selectedFieldType, setSelectedFieldType] = useState<string>("all"); // Bộ lọc loại sân
  const [showCalendar, setShowCalendar] = useState(false); // Hiển thị calendar inline
  const [tempSelectedDate, setTempSelectedDate] = useState<Dayjs>(dayjs()); // Ngày tạm chọn trong calendar
  const dispatch = useAppDispatch();

  if (!data) return <p className="text-center text-red-500">Không tìm thấy sân bóng</p>;

  dayjs.locale("vi"); // Thiết lập ngôn ngữ cho Dayjs
  // Thay đổi log từ bookings sang orders
  console.log("orders", orders);

  // Hàm toggle mở / đóng sân
  const toggleField = (id: string) => {
    setActiveField(activeField === id ? null : id);
  };

  // Hàm chuyển đổi key tab thành định dạng ngày
  const handleDateChange = (key: string) => {
    // Tách giá trị ngày, tháng, năm từ key
    const [day, month, year] = key.split("/").map(Number);
    // Tạo đối tượng dayjs đúng
    const convertedDate = dayjs(`${year}-${month}-${day}`, "YYYY-M-D", true);
    setSelectedDate(convertedDate);
  };

  // Lọc danh sách sân có ca đá trong ngày được chọn
  // const filteredFields = data.map((field: any) => {
  //     const schedule = field.timeSlots.find((s: any) => s.date === selectedDate.format("YYYY-MM-DD"));
  //     return schedule ? { ...field, timeSlots: schedule.timeSlots } : null;
  // }).filter(Boolean);


  // Chuyển đổi số thứ trong tuần thành dạng đúng của tiếng Việt
  const getVietnameseDay = (dayNumber: number) => {
    if (dayNumber === 0) return "CN"; // Chủ Nhật
    return `Th ${dayNumber + 1}`; // Thứ 2 -> Thứ 7
  };

  // Hàm lọc sân theo loại
  const filterFieldsByType = (fields: Field[], type: string) => {
    if (type === "all") return fields;
    return fields.filter(field => field.people.toString() === type);
  };

  // Lọc dữ liệu khi selectedFieldType thay đổi
  const getFilteredFields = () => {
    return filterFieldsByType(data, selectedFieldType);
  };

  // Tạo danh sách 30 ngày tiếp theo với style giống Moveek
  const dates = Array.from({ length: 30 }, (_, index) => {
    const date = dayjs().add(index, "day");
    const isSelected = date.format("D/M/YYYY") === selectedDate.format("D/M/YYYY");

    return {
      key: date.format("D/M/YYYY"),
      label: (
        <div className={`flex flex-col items-center justify-center py-3 transition-all flex-shrink-0 ${isSelected
          ? 'bg-blue-400 text-white shadow-md'
          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
          } w-[120px] h-[90px]`}>
          <div className="text-lg font-medium">{date.format("D/M")}</div>
          <div className={`text-md ${isSelected ? 'text-white' : 'text-g  ray-500'}`}>
            {getVietnameseDay(date.day())}
          </div>
        </div>
      ),
    };
  });


  useEffect(() => {
    const getData = async () => {
      try {
        // Lấy thông tin sân bóng của người dùng
        await dispatch(getFootballFieldByIdSlice("67ce9ea74c79326f98b8bf8e"));
        if (!footballField._id) return;

        // Lấy danh sách sân và timeslots
        const fieldsResponse = await getFieldsByIdFootball(footballField._id as string);
        setData(fieldsResponse.data);
        // Lấy danh sách khung giờ
        await dispatch(getListTimeSlotsByFootballFieldId(footballField._id as string));

        // Thay đổi từ getBookingsByFootballFieldAndDateSlice sang getListOrdersSlice
        await dispatch(getListOrdersSlice());

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
  }, [auth.value]);

  // Thêm useEffect mới để lấy orders khi selectedDate thay đổi
  useEffect(() => {
    const fetchData = async () => {
      // Nếu không có API cụ thể, lấy tất cả orders
      await dispatch(getListOrdersSlice());
    };
    if (selectedDate && footballField._id) fetchData();
  }, [selectedDate, footballField._id])

  return (
    <div className="container mx-auto">
      <div className="flex flex-row gap-6">
        {/* Phần bên trái - Chọn ngày và danh sách sân */}
        <div className="w-2/3">
          {/* Chọn ngày - Style giống Moveek */}
          <div>
            <div className="flex justify-between items-center gap-1">
              {/* Hiển thị 7 ngày đầu */}
              <div className="flex rounded-lg border overflow-hidden border-gray-200">
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

              {/* Nút toggle calendar */}
              <div
                onClick={() => {
                  setTempSelectedDate(selectedDate); // Set ngày hiện tại vào temp
                  setShowCalendar(!showCalendar);
                }}
                className={`cursor-pointer flex-shrink-0 flex flex-col items-center justify-center py-3 px-2 transition-all duration-200 w-[140px] min-w-[80px] h-[90px] rounded-lg border-2 border-dashed ${showCalendar
                  ? 'bg-blue-100 text-blue-600 border-blue-400'
                  : 'bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600 border-gray-300 hover:border-blue-400'
                  }`}
              >
                <CalendarOutlined className="text-xl mb-1" />
                <div className="text-xs">Khác</div>
              </div>
            </div>
          </div>

          {/* Calendar inline khi click "Khác" */}
          {showCalendar && (
            <div className="mt-4 p-4 bg-white rounded-xl shadow-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">📅 Chọn ngày đặt sân</h3>
                <Button
                  type="text"
                  onClick={() => {
                    setShowCalendar(false);
                    setTempSelectedDate(selectedDate); // Reset về ngày đã chọn
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </Button>
              </div>
              {/* Custom Calendar Grid */}
              <div className="bg-white">
                {/* Header */}
                <div className="flex justify-between items-center mb-4 px-2">
                  <div className="text-lg font-semibold">
                    {tempSelectedDate.format('MMMM YYYY')}
                  </div>
                  <div className="text-sm text-gray-500">
                    Chọn ngày từ hôm nay đến {dayjs().add(30, 'day').format('DD/MM')}
                  </div>
                </div>

                {/* Days of week header */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day) => (
                    <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
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
                            h-10 flex items-center justify-center text-sm cursor-pointer rounded-lg transition-all
                            ${isSelected ? 'bg-blue-500 text-white font-semibold' : ''}
                            ${isToday && !isSelected ? 'bg-blue-100 text-blue-600 font-semibold border-2 border-blue-300' : ''}
                            ${isDisabled ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-blue-50'}
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

              {/* Buttons */}
              <div className="flex justify-end gap-3 mt-4">
                <Button
                  onClick={() => {
                    setShowCalendar(false);
                    setTempSelectedDate(selectedDate); // Reset về ngày đã chọn
                  }}
                >
                  Hủy
                </Button>
                <Button
                  type="primary"
                  onClick={() => {
                    setSelectedDate(tempSelectedDate);
                    setShowCalendar(false);
                  }}
                >
                  Chọn ngày này
                </Button>
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="text-sm text-blue-700 font-medium">
                  📋 Quy định đặt sân:
                </div>
                <div className="text-sm text-blue-600 mt-1">
                  • Chỉ có thể đặt sân từ hôm nay đến tối đa 30 ngày tới (<strong>{dayjs().add(30, 'day').format('DD/MM/YYYY')}</strong>)
                </div>
              </div>
            </div>
          )}

          {/* Bộ lọc loại sân */}
          <div className="mt-6 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <FilterOutlined className="text-blue-500" />
                <span className="font-medium text-gray-700">Lọc theo loại sân:</span>
              </div>
              <div className="flex gap-3 flex-wrap">
                <Tag
                  color={selectedFieldType === "all" ? "blue" : "default"}
                  className="cursor-pointer px-4 py-2 text-sm font-medium hover:scale-105 transition-transform"
                  onClick={() => setSelectedFieldType("all")}
                >
                  Tất cả
                </Tag>
                <Tag
                  color={selectedFieldType === "5v5" ? "green" : "default"}
                  className="cursor-pointer px-4 py-2 text-sm font-medium hover:scale-105 transition-transform"
                  onClick={() => setSelectedFieldType("5v5")}
                >
                  Sân 5
                </Tag>
                <Tag
                  color={selectedFieldType === "7v7" ? "orange" : "default"}
                  className="cursor-pointer px-4 py-2 text-sm font-medium hover:scale-105 transition-transform"
                  onClick={() => setSelectedFieldType("7v7")}
                >
                  Sân 7
                </Tag>
                <Tag
                  color={selectedFieldType === "22" ? "red" : "default"}
                  className="cursor-pointer px-4 py-2 text-sm font-medium hover:scale-105 transition-transform"
                  onClick={() => setSelectedFieldType("22")}
                >
                  Sân 11
                </Tag>
              </div>
            </div>
          </div>

          {/* Danh sách sân */}
          <div className="mt-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold my-4">
                Danh sách sân ({selectedDate.format("DD/MM/YYYY")})
                {selectedFieldType !== "all" && (
                  <span className="text-blue-500 text-lg ml-2">
                    - {selectedFieldType === "10" ? "Sân 5 người" :
                      selectedFieldType === "14" ? "Sân 7 người" : "Sân 11 người"}
                  </span>
                )}
              </h2>
              {data &&
                <div className="space-y-4">
                  {getFilteredFields().map((field: Field, index: number) => (
                    <div key={index + 1}>
                      <Collapse
                        items={[
                          {
                            key: field._id,
                            label: `${field.name} - ${field.status}`,
                            children:
                              <div className="gap-4 w-full text-left">
                                {field.status === 'Bảo trì' ? (
                                  <p className="text-center text-gray-500">Sân này hiện đang bảo trì, không thể đặt lịch.</p>
                                ) : (
                                  timeslots && timeslots.length > 0 ? (
                                    timeslots.map((slot: TimeSlot, idx) => (
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
                                        className={`border p-2 rounded-md text-center cursor-pointer m-1 '
                                                                        }`}
                                      >
                                        <Link href={`/homepage/datSan/${field._id}/${slot._id}?date=${selectedDate.format("DD-MM-YYYY")}`}>
                                          {slot.time}
                                        </Link>
                                      </Button>
                                    ))
                                  ) : (
                                    <p className="text-center text-gray-500">Không có ca đá trong ngày này.</p>
                                  )
                                )}
                              </div>,
                          }

                        ]}
                      />
                    </div>
                  ))}
                </div>
              }
            </div>
          </div>
        </div>

        {/* Phần bên phải - Thông tin bổ sung */}
        <div className="w-1/3">
          {/* Thông tin sân bóng */}
          <Card
            title="Thông tin sân bóng"
            className="mb-4"
            cover={<img alt="stadium" src={footballField?.image} className="h-48 object-cover" />}
          >
            <h2 className="text-xl font-bold">{footballField?.name}</h2>
            <p className="text-gray-500 flex items-center">
              <EnvironmentOutlined className="mr-2" />
              {footballField?.address && `${footballField.address?.detail ? `${footballField.address.detail}, ` : ""} ${footballField.address.ward}, ${footballField.address.district}, ${footballField.address.province}`}
            </p>
            <p className="text-gray-500 flex items-center">
              <PhoneOutlined className="mr-2" /> {footballField?.phone}
            </p>
            <Button type="primary" className="mt-3 w-full">
              <Link href={`/homepage/datSan/${footballField?._id}/detail`}>
                Xem chi tiết sân
              </Link>
            </Button>
          </Card>

          {/* Hướng dẫn đặt sân */}
          <Card title="Hướng dẫn đặt sân" className="mb-4">
            <ol className="list-decimal pl-4 space-y-2">
              <li>Chọn ngày bạn muốn đặt sân</li>
              <li>Chọn sân phù hợp từ danh sách</li>
              <li>Chọn khung giờ còn trống</li>
              <li>Điền thông tin và thanh toán</li>
              <li>Nhận xác nhận đặt sân qua email</li>
            </ol>
          </Card>

          {/* Thống kê */}
          <Card title="Thống kê">
            <div className="space-y-2">
              <p><strong>Tổng số sân:</strong> {data?.length || 0}</p>
              <p><strong>Sân hiển thị:</strong> {getFilteredFields()?.length || 0}</p>
              <p><strong>Khung giờ có sẵn:</strong> {timeslots?.length || 0}</p>
              {/* Thay đổi từ bookings sang orders */}
              <p><strong>Đã đặt hôm nay:</strong> {orders.length > 0 && orders?.filter((o: Order) =>
                o.date === dayjs().format('DD-MM-YYYY') &&
                o.paymentStatus === "success"
              )?.length || 0}</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};


export default Detail;
