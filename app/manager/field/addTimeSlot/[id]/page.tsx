'use client';
import { Form, Input, Button } from "antd";
import { Field, TimeSlot } from "@/models/field";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { useParams, useRouter } from "next/navigation";
import { updateFieldSlice } from "@/features/field.slice";
import { useEffect } from "react";
import { getListTimeSlots, getListTimeSlotsByFootballFieldId, updateTimeSlotSlice } from "@/features/timeSlot.slice";
import { FootballField } from "@/models/football_field";


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
    const handleSubmit = async (values: Field) => {
        console.log("values", values);

        await dispatch(updateTimeSlotSlice({ ...values }));
        toast.success("Sửa ca đá thành công!");
        router.replace("/manager/field");
    }

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
                    initialValues={oldTimeSlot}
                    layout="vertical" onFinish={handleSubmit}>
                    <Form.Item name="_id" hidden>
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Giờ"
                        name="time"
                        rules={[{ required: true, message: "Vui lòng nhập giờ đá!" }]}
                    >
                        <Input placeholder="VD: 12:00 - 13:30" />
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
