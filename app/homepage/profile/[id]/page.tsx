
'use client'
import { changeuserprofile } from '@/features/auth.slice';
import { useAppDispatch, useAppSelector } from '@/store/hook';
import { upload } from '@/utils/upload';
import { UploadOutlined } from '@ant-design/icons';
import { Button, Form, Input, Upload } from 'antd'
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';


const ChangeProfile = () => {
    const auth = useAppSelector((state) => state.auth.value)
    const [form] = Form.useForm();
    const { id } = useParams();
    const dispatch = useAppDispatch();
    const [updating, setUpdating] = useState(false);
    const router = useRouter()
    
    const handleSubmit = async (values: any) => {
        let newImage = values.image;
        if (values.image) {
            setUpdating(true);
            newImage = await upload(values.image)
        }
        await dispatch(changeuserprofile({ ...auth.user, role: auth.user.role, image: newImage, name: values.name, contact: values.contact, email: values.email }));
        toast.success('Cập nhật thành công!');
        setUpdating(false);
        router.push('/homepage/profile');
    };

    return (
        <div>
            <h1 className="text-2xl font-semibold mb-8">Chỉnh sửa cá nhân</h1>
            <Form form={form}
                initialValues={auth.user}
                layout="vertical" onFinish={handleSubmit}>

                <Form.Item name="_id" hidden>
                    <Input />
                </Form.Item>

                <Form.Item
                    name="name"
                    label="Tên người dùng"
                    rules={[{ required: true, message: "Vui lòng nhập tên người dùng!" }]}
                >
                    <Input placeholder="Nhập tên người dùng..." />
                </Form.Item>

                <Form.Item
                    name="email"
                    label="Email"
                    rules={[{ required: true, message: "Vui lòng nhập email!" }]}
                >
                    <Input placeholder="Nhập email..." />
                </Form.Item>

                <Form.Item
                    name="image"
                    label="Hình ảnh"
                >
                    <Upload
                        beforeUpload={() => false}
                        maxCount={1}
                        listType="picture"
                        defaultFileList={auth.user.image ? [{ uid: '-1', name: 'image', status: 'done', url: auth.user.image }] : []}
                    >
                        <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
                    </Upload>
                </Form.Item>

                <Form.Item
                    name="contact"
                    label="Liên hệ"
                >
                    <Input placeholder="Nhập địa chỉ..." />
                </Form.Item>

                <Button
                    type="primary"
                    htmlType="submit"
                    className="bg-orange-500 text-white"
                    loading={updating}
                >
                    Cập nhật
                </Button>
            </Form>
        </div>
    )
}

export default ChangeProfile
