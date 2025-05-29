'use client';
import { Form, Input, Select, Button } from "antd";
import { Field } from "@/models/field";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { RootStateType } from "@/models/type";
import { useAppDispatch } from "@/store/hook";
import { useParams, useRouter } from "next/navigation";
import { updateFieldSlice } from "@/features/field.slice";
import { useState, useEffect } from "react";

const { Option } = Select;

const EditFieldPage = () => {
    const fieldData = useSelector((state: RootStateType) => state.field.value)
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const { id } = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const oldField = fieldData.find((item) => item._id == id);

    // Set initial values khi component mount
    useEffect(() => {
        if (oldField) {
            // Map dữ liệu cũ sang format mới (chỉ 4 trường cần thiết)
            const oldFieldAny = oldField as any;
            const initialValues = {
                _id: oldField._id,
                name: oldField.name,
                people: oldFieldAny.people, // Default nếu chưa có
                surface: oldFieldAny.surface,
                status: oldField.status
            };
            form.setFieldsValue(initialValues);
        }
    }, [oldField, form]);

    // Gửi dữ liệu lên server
    const handleSubmit = async (values: any) => {
        setLoading(true);
        console.log("values", values);

        try {
            // Chuẩn bị dữ liệu để gửi (chỉ 4 trường cần thiết)
            const fieldData_submit: Partial<Field> = {
                _id: oldField?._id,
                name: values.name,
                people: values.people, // Giữ nguyên people cũ
                status: values.status,
                surface: values.surface,
                foolballFieldId: oldField?.foolballFieldId,
            };

            const data = await dispatch(updateFieldSlice(fieldData_submit as Field));
            console.log("data", data);

            if (data.payload) {
                toast.success("Sửa sân bóng thành công!");
                router.replace("/manager/field");
            } else {
                toast.error("Sửa sân bóng thất bại, vui lòng thử lại!");
            }
        } catch (error) {
            console.error("Error updating field:", error);
            toast.error("Có lỗi xảy ra khi cập nhật sân bóng!");
        } finally {
            setLoading(false);
        }
    };

    // Hiển thị loading nếu chưa có dữ liệu
    if (!oldField) {
        return (
            <div className="p-6 bg-gray-100 min-h-screen">
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="text-center">Đang tải dữ liệu...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-medium mb-4">Sửa sân bóng</h2>

                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Form.Item name="_id" hidden>
                        <Input />
                    </Form.Item>

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
                        name="people"
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
                            <Option value="Cỏ tự nhiên">Cỏ tự nhiên</Option>
                            <Option value="Cỏ nhân tạo">Cỏ nhân tạo</Option>
                            <Option value="Sân trong nhà">Sân trong nhà</Option>
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

                    <div className="flex gap-4">
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                        >
                            Cập nhật sân bóng
                        </Button>

                        <Button
                            type="default"
                            onClick={() => router.back()}
                        >
                            Hủy
                        </Button>
                    </div>
                </Form>
            </div>
        </div>
    );
};

export default EditFieldPage;
