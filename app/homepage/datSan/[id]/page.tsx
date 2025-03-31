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
import { getFootballFieldByIdSlice } from "@/features/footballField.slice";
import { addBreadcrumb, resetBreadcrumb, setBreadcrumb } from "@/features/breadcrumb.slice";
import { FootballField } from "@/models/football_field";
import { getListTimeSlotsByFootballFieldId } from "@/features/timeSlot.slice";
import { getBookingsByFootballFieldAndDateSlice } from "@/features/booking.slice";
import { Booking } from "@/models/booking";

const { Panel } = Collapse

const Detail = () => {
    const footballField = useSelector((state: RootStateType) => state.footballField.value)
    const timeslots = useAppSelector(state => state.timeSlot.value)
    const bookings = useAppSelector(state => state.booking.value)


    const [data, setData] = useState<Field[]>([]); // Dữ liệu lọc the
    const { id } = useParams();
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
            const data = await getFieldsByIdFootball(id as string);
            setData(data.data)
            const football = await dispatch(getFootballFieldByIdSlice(id as string))
            const timeslots = await dispatch(getListTimeSlotsByFootballFieldId(id as string))
            const fetchData = async () => {
                await dispatch(getBookingsByFootballFieldAndDateSlice({ id: id as string, date: selectedDate.format('DD-MM-YYYY') }));
            };
            if (id && selectedDate) fetchData();
            const dataa = football.payload as FootballField
            dispatch(addBreadcrumb({ name: dataa.name, url: `/homepage/datSan/${id}` }));
        }
        getData();
    }, [id])

    useEffect(() => {
        const fetchData = async () => {
            await dispatch(getBookingsByFootballFieldAndDateSlice({ id: id as string, date: selectedDate.format('DD-MM-YYYY') }));
        };
        if (id && selectedDate) fetchData();
    }, [id, selectedDate])

    return (
        <div className="container mx-auto">
            {/* Chọn ngày */}
            <div className="max-w-4xl mx-auto p-2 bg-blue-50 px-12 rounded-lg w-full">
                <Tabs
                    defaultActiveKey={selectedDate.format("YYYY-MM-DD")} // Chuyển dayjs thành string
                    onChange={(item) => handleDateChange(item)}
                    centered // Canh giữa tabs
                    items={dates}
                    className=""
                    tabBarStyle={{ display: "flex", justifyContent: "space-between" }} // Căng đều tab
                    moreIcon={null} // Ẩn icon thừa của Ant Design Tabs
                />
            </div>

            {/* Tabs sân bóng + trận đấu */}
            <div className="mt-10 border-t border-gray-300 max-w-4xl mx-auto">
                {/* Danh sách sân */}
                <div className="max-w-4xl mx-auto  text-center">
                    <h2 className="text-2xl font-bold my-4"> Danh sách sân ({selectedDate.format("DD/MM/YYYY")})</h2>
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
                                                                        disabled={bookings.some(
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

            <Link href={`/homepage/datSan/${footballField._id}/detail`}>
                <div className="w-full mx-auto mt-6 max-w-4xl">
                    <Card

                        cover={<img alt="stadium" src={footballField.image} className="w-full h-64 object-cover" />}
                    >
                        <h2 className="text-2xl font-bold">{footballField.name}</h2>
                        <p className="text-gray-500 flex items-center">
                            <EnvironmentOutlined className="mr-2" /> {footballField.address}
                        </p>
                        <p className="text-gray-500 flex items-center">
                            <PhoneOutlined className="mr-2" /> {footballField.phone}
                        </p>
                    </Card>
                </div>
            </Link>
        </div>
    );
};


export default Detail;   
