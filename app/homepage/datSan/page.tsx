'use client';
import { useEffect, useState } from "react";
import { Card, Tabs, Button, Collapse } from "antd";
import { EnvironmentOutlined, PhoneOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/vi"; // Import tiếng Việt cho Day.js
import Link from "next/link";
import { useSelector } from "react-redux";
import { Field, TimeSlot } from "@/models/field";
import { RootStateType } from "@/models/type";
import { getFieldsByIdFootball } from "@/api/field";
import { useParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { getFootballFieldByIdSlice, getFootballFieldByIdUserSlice } from "@/features/footballField.slice";
import { addBreadcrumb, resetBreadcrumb, setBreadcrumb } from "@/features/breadcrumb.slice";
import { FootballField } from "@/models/football_field";
import { getListTimeSlotsByFootballFieldId } from "@/features/timeSlot.slice";
// Thay đổi import - sử dụng orders thay vì bookings
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
  // const { id } = useParams();
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs()); // Ngày đang chọn
  const [activeField, setActiveField] = useState<string | null>(null); // Sân nào đang mở
  const [selectedDate2, setSelectedDate2] = useState(dayjs().format("D/M"));
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

  // Tạo danh sách 7 ngày tiếp theo
  const dates = Array.from({ length: 30 }, (_, index) => {
    const date = dayjs().add(index, "day");
    return {
      key: date.format("D/M/YYYY"), //2025-03-04
      label: (
        <div className="flex flex-col items-center w-full">
          <div className="text-lg">{date.format("D/M")}</div>
          <div className="text-sm text-gray-500">
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
      // Nếu có API lấy orders theo ngày, sử dụng API đó
      // await dispatch(getOrdersByFootballFieldAndDateSlice({ 
      //   id: footballField._id as string, 
      //   date: selectedDate.format('DD-MM-YYYY') 
      // }));

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
          {/* Chọn ngày */}
          <div className="p-2 bg-blue-50 px-12 rounded-lg w-full">
            <Tabs
              defaultActiveKey={selectedDate.format("YYYY-MM-DD")}
              onChange={(item) => handleDateChange(item)}
              centered
              items={dates}
              className=""
              tabBarStyle={{ display: "flex", justifyContent: "space-between" }}
              moreIcon={null}
            />
          </div>

          {/* Danh sách sân */}
          <div className="mt-10 border-t border-gray-300">
            <div className="text-center">
              <h2 className="text-2xl font-bold my-4">Danh sách sân ({selectedDate.format("DD/MM/YYYY")})</h2>
              {data &&
                <div className="space-y-4">
                  {data.map((field: Field, index: number) => (
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
