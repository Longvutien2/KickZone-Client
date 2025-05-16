// 'use client';
// import { AutoComplete, Input, Pagination } from 'antd';
// import { SearchOutlined, EnvironmentOutlined } from '@ant-design/icons';
// import Link from 'next/link';
// import { FootballField } from '@/models/football_field';
// import Card from '@/components/Card';
// import { useEffect, useState } from 'react';
// import { useDispatch } from 'react-redux';
// import { getListFootballFieldSlice } from '@/features/footballField.slice';
// import { AppDispatch } from '@/store/store';
// import { addBreadcrumb, setBreadcrumb } from '@/features/breadcrumb.slice';

// const BookField = () => {
//   const [searchValue, setSearchValue] = useState<string>(''); // Dữ liệu cho tìm kiếm
//   const [selectedLocation, setSelectedLocation] = useState<string>(''); // Khu vực đã chọn
//   const [filteredData, setFilteredData] = useState<FootballField[]>([]); // Dữ liệu lọc theo search
//   const [dfData, setdfData] = useState<FootballField[]>([]); // Dữ liệu gốc để tham chiếu
//   const dispatch = useDispatch<AppDispatch>();
//   const [currentPage, setCurrentPage] = useState(1);

//   // Lấy tất cả khu vực (location) từ filteredData[]
//   const locations = [...new Set(filteredData?.map((item: FootballField) => item.address?.province))];
//   console.log("locations", filteredData);

//   // Lọc data theo khu vực đã chọn
//   const handleLocationChange = (value: string) => {
//     setSelectedLocation(value); // Lưu khu vực đã chọn
//     if (value === "") {
//       setFilteredData(dfData);
//     } else {
//       const filtered = dfData.filter((item) =>
//         item.address.province.toLowerCase().includes(value.toLowerCase())
//       );
//       setFilteredData(filtered); // Cập nhật dữ liệu lọc
//     }
//   };

//   // Lọc dữ liệu theo tên sân bóng (searchValue)
//   const handleSearch = (value: string) => {
//     setSearchValue(value); // Lưu giá trị tìm kiếm
//     if (value === "") {
//       setFilteredData(dfData);
//     } else {
//       const filtered = dfData.filter((item) =>
//         item.name.toLowerCase().includes(value.toLowerCase())
//       );
//       setFilteredData(filtered); // Cập nhật dữ liệu lọc
//     }
//   };

//   const handleSearchEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === 'Enter') {
//       // Lọc dữ liệu khi nhấn Enter
//       const filtered = dfData.filter((item) =>
//         item.name.toLowerCase().includes(searchValue.toLowerCase())
//       );
//       setFilteredData(filtered); // Cập nhật dữ liệu lọc
//     }
//   };

//   // Lấy dữ liệu và sắp xếp
//   useEffect(() => {
//     const getData = async () => {
//       const data = await dispatch(getListFootballFieldSlice());
//       setFilteredData(data.payload as FootballField[]);
//       setdfData(data.payload as FootballField[]); // Lưu dữ liệu gốc
//       dispatch(setBreadcrumb([
//         { name: 'Home', url: '/' },  // Breadcrumb gốc
//         { name: 'Đặt sân', url: '/homepage/datSan' },  // Breadcrumb cho trang này
//       ]));
//     };
//     getData();
//   }, [dispatch]);

//   return (
//     <div className="container mx-auto">
//       <h1 className="text-2xl font-semibold mb-4">Sân bóng</h1>
//       <div className="items-center w-full my-4">
//         <div className='w-full mb-2'>
//           <AutoComplete
//             value={selectedLocation}
//             onChange={handleLocationChange}
//             options={locations
//               .filter(location =>
//                 location.toLowerCase().includes(selectedLocation.toLowerCase())
//               )
//               .map((location) => ({
//                 value: location,
//               }))
//             }
//             className='w-full'
//           >
//             <Input
//               prefix={<EnvironmentOutlined />}
//               placeholder="Khu vực"
//             />
//           </AutoComplete>
//         </div>

//         <AutoComplete
//           value={searchValue}
//           onChange={handleSearch}
//           onKeyDown={handleSearchEnter}
//           className='w-full mb-2'
//         >
//           <Input
//             prefix={<SearchOutlined />}
//             placeholder="Nhập tên để tìm"
//             className="w-full"
//           />
//         </AutoComplete>
//       </div>
//       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
//         {filteredData.slice((currentPage - 1) * 12, currentPage * 12).map((item, index: number) => (
//           <div key={index + 1}>
//             <Link href={`/homepage/datSan/${item._id}`}>
//               <Card
//                 key={index + 1}
//                 name={item.name}
//                 location={`${item.address.detail ? `${item.address.detail}, ` : ""} ${item.address.ward}, ${item.address.district}, ${item.address.province}`}
//                 imageUrl={item.image}
//                 verified={true}
//               />
//             </Link>
//           </div>
//         ))}
//       </div>

//       <div className="flex justify-center mt-6 mb-8">
//               <Pagination
//                 current={currentPage}
//                 total={filteredData.length}
//                 onChange={(page) => setCurrentPage(page)}
//                 pageSize={12}
//                 showSizeChanger={false}
//               />
//             </div>
//     </div>
//   );
// };

// export default BookField;

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
import { getBookingsByFootballFieldAndDateSlice } from "@/features/booking.slice";
import { Booking } from "@/models/booking";

const { Panel } = Collapse

const Detail = () => {
  const auth = useAppSelector((state) => state.auth)
  const timeslots = useAppSelector(state => state.timeSlot.value)
  const bookings = useAppSelector(state => state.booking.value)
  const footballField = useAppSelector(state => state.footballField.detail) as FootballField



  const [data, setData] = useState<Field[]>([]); // Dữ liệu lọc the
  // const { id } = useParams();
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs()); // Ngày đang chọn
  const [activeField, setActiveField] = useState<string | null>(null); // Sân nào đang mở
  const [selectedDate2, setSelectedDate2] = useState(dayjs().format("D/M"));
  const dispatch = useAppDispatch();

  if (!data) return <p className="text-center text-red-500">Không tìm thấy sân bóng</p>;

  dayjs.locale("vi"); // Thiết lập ngôn ngữ cho Dayjs
  console.log("bookingsbookingsbookings", bookings);

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

        // Lấy danh sách booking theo ngày
        if (selectedDate) {
          await dispatch(getBookingsByFootballFieldAndDateSlice({
            id: footballField._id as string,
            date: selectedDate.format('DD-MM-YYYY')
          }));
        }

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
  }, [auth.value, selectedDate]);

  useEffect(() => {
    const fetchData = async () => {
      await dispatch(getBookingsByFootballFieldAndDateSlice({ id: footballField._id as string, date: selectedDate.format('DD-MM-YYYY') }));
    };
    if (selectedDate) fetchData();
  }, [selectedDate])

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
                                        disabled={bookings.length > 0 && bookings.some(
                                          (b: Booking) =>
                                            b.date === selectedDate.format('DD-MM-YYYY') &&
                                            b.field === field.name &&
                                            b.timeStart === slot.time &&
                                            b.status === "Đã xác nhận"
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
              <p><strong>Đã đặt hôm nay:</strong> {bookings.length > 0 && bookings?.filter((b: Booking) => b.date === dayjs().format('DD-MM-YYYY'))?.length || 0}</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};


export default Detail;   
