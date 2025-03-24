'use client';
import { Form, Input, InputNumber, Select, Button } from "antd";
import { Field } from "@/models/field";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { RootStateType } from "@/models/type";
import { useAppDispatch } from "@/store/hook";
import { useParams, useRouter } from "next/navigation";
import { updateFieldSlice } from "@/features/field.slice";

const { Option } = Select;

const EditFieldPage = () => {
    const fieldData = useSelector((state: RootStateType) => state.field.value)
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const { id } = useParams();
    const router = useRouter();
    const oldField = fieldData.find((item) => item._id == id)

    // Gửi dữ liệu lên server
    const handleSubmit = async (values: Field) => {
        console.log("values", values);

        const data = await dispatch(updateFieldSlice(values));
        console.log("data", data);

        if (data.payload) {
            toast.success("Sửa sân bóng thành công!");
            router.replace("/manager/field"); // Chuyển hướng về trang danh sách sân
        } else {
            toast.success("Sửa sân bóng thất bại, vui lòng thử lại!");
        }

    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <div className=" bg-white p-6 rounded-lg shadow ">
                <h2 className="text-xl font-medium mb-4">Sửa sân bóng</h2>
                <Form form={form} initialValues={oldField} layout="vertical" onFinish={handleSubmit}>

                    <Form.Item name="_id" hidden>
                        <Input />
                    </Form.Item>

                    {/* Tên sân */}
                    <Form.Item
                        name="name"
                        label="Tên sân"
                        rules={[{ required: true, message: "Vui lòng nhập tên sân!" }]}
                    >
                        <Input placeholder="Nhập tên sân..." />
                    </Form.Item>

                    {/* Số người tối đa */}
                    <Form.Item
                        name="people"
                        label="Số người"
                        rules={[{ required: true, message: "Vui lòng nhập số người!" }]}
                    >
                        <InputNumber min={1} max={20} style={{ width: "100%" }} />
                    </Form.Item>

                    {/* Giờ mở cửa */}
                    <Form.Item
                        name="start_time"
                        label="Bắt đầu lúc"
                        rules={[{ required: true, message: "Vui lòng nhập giờ mở cửa!" }]}
                    >
                        <Input placeholder="Nhập giờ mở cửa (ví dụ: 7h)" />
                    </Form.Item>

                    {/* Giờ đóng cửa */}
                    <Form.Item
                        name="end_time"
                        label="Kết thúc lúc"
                        rules={[{ required: true, message: "Vui lòng nhập giờ đóng cửa!" }]}
                    >
                        <Input placeholder="Nhập giờ đóng cửa (ví dụ: 22h)" />
                    </Form.Item>

                    {/* Tình trạng sân */}
                    <Form.Item
                        name="status"
                        label="Tình trạng"
                        rules={[{ required: true, message: "Vui lòng chọn tình trạng!" }]}
                    >
                        <Select placeholder="Chọn tình trạng sân">
                            <Option value="Hoạt động">Hoạt động</Option>
                            <Option value="Bảo trì">Bảo trì</Option>
                        </Select>
                    </Form.Item>

                    <Button type="primary" htmlType="submit" block>
                        Sửa sân bóng
                    </Button>
                </Form>
            </div>
        </div>
    );
};

export default EditFieldPage;
