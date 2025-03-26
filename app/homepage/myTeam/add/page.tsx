'use client'
import { Button, Input, Select, Upload, Form } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import { upload } from '@/utils/upload'
import { useAppDispatch, useAppSelector } from '@/store/hook'
import { addTeamSlice } from '@/features/team.slice'
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'

const { Option } = Select

const AddTeamPage = () => {
    const user = useAppSelector(state => state.auth)
    const [form] = Form.useForm()
    const dispatch = useAppDispatch();
    const router = useRouter();

    const handleSubmit = async (values: any) => {
        console.log(values)
        const linkImage = await upload(values.teamImage)

        console.log("🎉 Ảnh đã upload thành công:", linkImage);
        const newData = { ...values, teamImage: linkImage, user: user.value.user._id }
        const newField = await dispatch(addTeamSlice(newData));
        if (newField.payload) {
            toast.success("Tạo câu lạc bộ thành công");
            router.push("/homepage/myTeam");
        }else{
            toast.error("Tạo câu lạc bộ thất bại")
        }
    }

    return (
        <div className="p-4 bg-white">
            <h2 className="text-xl font-semibold text-center mb-6">Tạo Câu Lạc Bộ</h2>
            <Form form={form} onFinish={handleSubmit} layout="vertical">
                {/* Ảnh đội bóng */}
                {/* Upload Ảnh đội bóng */}
                <Form.Item label="Ảnh đội bóng" name="teamImage">
                    <Upload
                        listType="picture-card"
                        beforeUpload={() => false} // Ngừng upload ảnh đến server
                        maxCount={1}
                    >
                        <div>
                            <UploadOutlined />
                            <div style={{ marginTop: 8 }}>Chọn ảnh</div>
                        </div>
                    </Upload>
                </Form.Item>

                {/* Tên câu lạc bộ */}
                <Form.Item label="Tên CLB" name="teamName" rules={[{ required: true, message: 'Vui lòng nhập tên đội bóng!' }]}>
                    <Input placeholder="Nhập tên đội bóng" />
                </Form.Item>

                {/* Mô tả */}
                <Form.Item label="Mô tả" name="description">
                    <Input.TextArea placeholder="Nhập mô tả về đội bóng" />
                </Form.Item>

                {/* Khu vực sinh hoạt */}
                <Form.Item label="Khu vực sinh hoạt" name="location" rules={[{ required: true, message: 'Vui lòng nhập khu vực sinh hoạt!' }]}>
                    <Input placeholder="Khu vực mà câu lạc bộ hay chơi" />
                </Form.Item>

                {/* Điểm trình độ */}
                <Form.Item label="Điểm trình độ" name="level" rules={[{ required: true }]}>
                    <Select
                        placeholder="Chọn mức độ"
                    >
                        <Option value="Yếu">Yếu</Option>
                        <Option value="Trung bình yếu">Trung bình yếu</Option>
                        <Option value="Trung bình">Trung bình</Option>
                        <Option value="Khá">Khá</Option>
                        <Option value="Tốt">Tốt</Option>
                    </Select>
                </Form.Item>


                {/* Độ tuổi */}
                <Form.Item label="Độ tuổi" name="ageGroup" rules={[{ required: true }]}>
                    <Select placeholder="Chọn độ tuổi">
                        <Option value="U16">U16</Option>
                        <Option value="U19">U19</Option>
                        <Option value="U23">U23</Option>
                        <Option value="U28">U28</Option>
                        <Option value="U32">U32</Option>
                        <Option value="U50">U50</Option>
                    </Select>
                </Form.Item>

                {/* Nút hoàn tất */}
                <Form.Item className="text-center">
                    <Button type="primary" htmlType="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                        Hoàn tất
                    </Button>
                </Form.Item>
            </Form>
        </div>
    )
}

export default AddTeamPage
