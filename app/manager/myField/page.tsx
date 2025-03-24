
'use client';
import { useEffect, useState } from "react";
import { Button, Modal, Form, Input, Upload, Card } from "antd";
import { UploadOutlined, EditOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { RootStateType } from "@/models/type";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { getFootballFieldByIdUserSlice } from "@/features/footballField.slice";

const MyField = () => {
  const auth = useAppSelector((state) => state.auth); // Lấy userId từ Redux
  const footballFieldSlice = useSelector((state: RootStateType) => state.footballField.value); // Lấy userId từ Redux
  console.log("footballFieldSlice", footballFieldSlice);

  const dispatch = useAppDispatch();
  const [field, setField] = useState()
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const handleEdit = () => {
    form.setFieldsValue(field);
    setIsModalOpen(true);
  };

  const handleOk = () => {
    form.validateFields().then((values) => {
      setField(values);
      setIsModalOpen(false);
    });
  };

  useEffect(() => {
    if (auth) {
      const data = async () => {
        await dispatch(getFootballFieldByIdUserSlice(auth.value.user._id as string));
      }
      data();
    }
  }, [auth.value]);

  return (
    <div className="p-6 bg-gray-100 min-h-screen w-full">
      <Card className="max-w-full">
        <h1 className="text-2xl font-medium mb-4">Sân bóng của tôi</h1>
        <img src={footballFieldSlice.image} alt="sân bóng" className=" object-cover w-5/12 mb-4 rounded-lg" />
        <p><strong>Tên Sân:</strong> {footballFieldSlice.name}</p>
        <p><strong>Địa Chỉ:</strong> {footballFieldSlice.address}</p>
        <p><strong>Số Điện Thoại:</strong> {footballFieldSlice.phone}</p>
        <Button type="primary" icon={<EditOutlined />} onClick={handleEdit} className="mt-4">
          Chỉnh Sửa
        </Button>
      </Card>

      <Modal title="Chỉnh Sửa Thông Tin Sân" open={isModalOpen} onOk={handleOk} onCancel={() => setIsModalOpen(false)}>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Tên Sân" rules={[{ required: true, message: "Vui lòng nhập tên sân!" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="address" label="Địa Chỉ" rules={[{ required: true, message: "Vui lòng nhập địa chỉ!" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="Số Điện Thoại" rules={[{ required: true, message: "Vui lòng nhập số điện thoại!" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="image" label="Hình Ảnh">
            <Upload beforeUpload={() => false} listType="picture">
              <Button icon={<UploadOutlined />}>Tải Lên</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default MyField;
