'use client';
import { Form, Input, InputNumber, Select, Button, TimePicker } from "antd";
import { Field, TimeSlot } from "@/models/field";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { RootStateType } from "@/models/type";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { addFieldSlice } from "@/features/field.slice";
import { useRouter } from "next/navigation";
import { addTimeSlotSlice } from "@/features/timeSlot.slice";
import { FootballField } from "@/models/football_field";
import moment from "moment";

const { Option } = Select;

const AddTimeSlotPage = () => {
    const footballField = useAppSelector(state => state.footballField.detail) as FootballField
    const user = useAppSelector((state) => state.auth.value.user)
    const dispath = useAppDispatch();

    const router = useRouter();
    const [form] = Form.useForm();

    // Gửi dữ liệu lên server
    const handleSubmit = async (values: any) => {
        console.log("values", values);

        // Xử lý dữ liệu time từ TimePicker
        const timeString = values.startTime && values.endTime
            ? `${values.startTime.format('HH:mm')} - ${values.endTime.format('HH:mm')}`
            : values.time;

        const newTimeSlot = {
            ...values,
            time: timeString, // Format: "12:00 - 13:30"
            isBooked: false,
            footballField: footballField._id as string
        }
        const data = await dispath(addTimeSlotSlice(newTimeSlot));

        if (data.payload) {
            toast.success("Thêm ca đá thành công!");
            router.replace("/manager/field");
        } else {
            toast.error("Thêm ca đá thất bại, vui lòng thử lại!");
        }
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <div className=" bg-white p-6 rounded-lg shadow ">
                <h2 className="text-xl font-medium mb-4">Thêm khung giờ</h2>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
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
                        Thêm khung giờ
                    </Button>
                </Form>
            </div>
        </div>
    );
};

export default AddTimeSlotPage;
