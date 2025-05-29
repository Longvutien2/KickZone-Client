'use client';
import { Form, Input, Button, TimePicker } from "antd";
import { Field, TimeSlot } from "@/models/field";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { useParams, useRouter } from "next/navigation";
import { updateFieldSlice } from "@/features/field.slice";
import { useEffect } from "react";
import { getListTimeSlots, getListTimeSlotsByFootballFieldId, updateTimeSlotSlice } from "@/features/timeSlot.slice";
import { FootballField } from "@/models/football_field";
import moment from "moment";


const EditTimeSlotPage = () => {
    const timeSlots = useAppSelector(state => state.timeSlot.value)
    console.log("timeSlots", timeSlots);

    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const { id } = useParams();
    const router = useRouter();

    const oldTimeSlot = timeSlots.find((item: TimeSlot) => item._id == id)
    console.log("oldTimeSlot", oldTimeSlot);

    // Gửi dữ liệu lên server
    const handleSubmit = async (values: any) => {
        console.log("values", values);

        // Xử lý dữ liệu time từ TimePicker
        const timeString = values.startTime && values.endTime
            ? `${values.startTime.format('HH:mm')} - ${values.endTime.format('HH:mm')}`
            : values.time;

        const updatedTimeSlot = {
            ...values,
            time: timeString, // Format: "12:00 - 13:30"
        };

        await dispatch(updateTimeSlotSlice(updatedTimeSlot));
        toast.success("Sửa ca đá thành công!");
        router.replace("/manager/field");
    }

    // Parse time string để set initial values cho TimePicker
    const parseTimeString = (timeString: string) => {
        if (!timeString || !timeString.includes(' - ')) return { startTime: null, endTime: null };

        const [startStr, endStr] = timeString.split(' - ');
        return {
            startTime: moment(startStr, 'HH:mm'),
            endTime: moment(endStr, 'HH:mm')
        };
    };

    // Set initial values cho form
    const getInitialValues = () => {
        if (!oldTimeSlot) return {};

        const { startTime, endTime } = parseTimeString(oldTimeSlot.time);
        return {
            ...oldTimeSlot,
            startTime,
            endTime
        };
    };

    useEffect(() => {
        const getData = async () => {
            await dispatch(getListTimeSlotsByFootballFieldId(id as string))
        }
        getData();
    }, [])

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <div className=" bg-white p-6 rounded-lg shadow ">
                <h2 className="text-xl font-medium mb-4">Sửa khung giờ</h2>

                <Form form={form}
                    initialValues={getInitialValues()}
                    layout="vertical" onFinish={handleSubmit}>
                    <Form.Item name="_id" hidden>
                        <Input />
                    </Form.Item>

                    {/* Giờ bắt đầu */}
                    <Form.Item
                        label="Giờ bắt đầu"
                        name="startTime"
                        rules={[{ required: true, message: "Vui lòng chọn giờ bắt đầu!" }]}
                    >
                        <TimePicker
                            format="HH:mm"
                            placeholder="Chọn giờ bắt đầu"
                            style={{ width: '100%' }}
                            minuteStep={30}
                        />
                    </Form.Item>

                    {/* Giờ kết thúc */}
                    <Form.Item
                        label="Giờ kết thúc"
                        name="endTime"
                        rules={[{ required: true, message: "Vui lòng chọn giờ kết thúc!" }]}
                    >
                        <TimePicker
                            format="HH:mm"
                            placeholder="Chọn giờ kết thúc"
                            style={{ width: '100%' }}
                            minuteStep={30}
                        />
                    </Form.Item>

                    <Form.Item
                        label="Giá tiền"
                        name="price"
                        rules={[
                            { required: true, message: "Vui lòng nhập giá tiền!" },
                            { pattern: /^\d+$/, message: "Giá tiền phải là số!" }
                        ]}
                    >
                        <Input placeholder="VD: 150000" />
                    </Form.Item>

                    <Button type="primary" htmlType="submit" block>
                        Sửa khung giờ
                    </Button>
                </Form>
            </div>
        </div>
    );
};

export default EditTimeSlotPage;
