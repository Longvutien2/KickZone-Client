'use client';
import { Form, Input, InputNumber, Select, Button } from "antd";
import { Field } from "@/models/field";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { RootStateType } from "@/models/type";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { addFieldSlice } from "@/features/field.slice";
import { useRouter } from "next/navigation";
import { FootballField } from "@/models/football_field";

const { Option } = Select;

const AddFieldPage = () => {
    const fieldData = useAppSelector(state => state.footballField.detail) as FootballField
    const user = useAppSelector((state) => state.auth.value.user)

    const router = useRouter();
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();

    // Gửi dữ liệu lên server
    const handleSubmit = async (values: any) => {
        console.log("values", values);

        // Chuẩn bị dữ liệu theo format Field hiện tại
        const fieldData_submit: Partial<Field> = {
            name: values.name,
            people: 10, // Default people
            start_time: "06:00", // Default start time
            end_time: "22:00", // Default end time
            status: values.status, // "Hoạt động" hoặc "Bảo trì"
            foolballFieldId: String(fieldData._id),
            // TODO: Thêm vào Field interface sau:
            // type: values.type,
            // surface: values.surface,
        };

        const data = await dispatch(addFieldSlice(fieldData_submit as Field));
        if (data.payload) {
            toast.success("Thêm sân bóng thành công!");
            router.replace("/manager/field");
        } else {
            toast.error("Thêm sân bóng thất bại, vui lòng thử lại!");
        }
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <div className=" bg-white p-6 rounded-lg shadow ">
                <h2 className="text-xl font-medium mb-4">Thêm sân bóng</h2>
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    {/* Mỗi trường một dòng */}

                    {/* Tên sân */}
                    <Form.Item
                        name="name"
                        label="Tên sân"
                        rules={[{ required: true, message: "Vui lòng nhập tên sân!" }]}
                    >
                        <Input placeholder="Sân 1, Sân 2..." />
                    </Form.Item>

                    {/* Loại sân */}
                    <Form.Item
                        name="type"
                        label="Loại sân"
                        rules={[{ required: true, message: "Vui lòng chọn loại sân!" }]}
                    >
                        <Select placeholder="Chọn loại sân">
                            <Option value="5v5">Sân 5 người</Option>
                            <Option value="7v7">Sân 7 người</Option>
                            <Option value="11v11">Sân 11 người</Option>
                        </Select>
                    </Form.Item>

                    {/* Loại mặt sân */}
                    <Form.Item
                        name="surface"
                        label="Loại mặt sân"
                        rules={[{ required: true, message: "Vui lòng chọn loại mặt sân!" }]}
                    >
                        <Select placeholder="Chọn loại mặt sân">
                            <Option value="natural">Cỏ tự nhiên</Option>
                            <Option value="artificial">Cỏ nhân tạo</Option>
                            <Option value="concrete">Sân xi măng</Option>
                            <Option value="indoor">Sân trong nhà</Option>
                        </Select>
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
                        Thêm sân bóng
                    </Button>
                </Form>
            </div>
        </div>
    );
};

export default AddFieldPage;
