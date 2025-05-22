
'use client';
import { useEffect, useState } from "react";
import { Button, Modal, Form, Input, Upload, Card, Tabs, Descriptions, Divider, Typography, Space, Tag, Avatar } from "antd";
import { UploadOutlined, EditOutlined, EnvironmentOutlined, PhoneOutlined,  TeamOutlined, StarOutlined, CheckCircleOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { RootStateType } from "@/models/type";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { getFootballFieldByIdUserSlice } from "@/features/footballField.slice";
import Image from "next/image";
import { FootballField } from "@/models/football_field";

const { Title, Text } = Typography;

const MyField = () => {
  const auth = useAppSelector((state) => state.auth);
  const footballFieldSlice = useAppSelector(state => state.footballField.detail) as FootballField;
  const dispatch = useAppDispatch();
  const [field, setField] = useState();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState("1");

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

  // Giả lập dữ liệu thống kê
  const stats = {
    totalBookings: 124,
    thisWeekBookings: 18,
    rating: 4.8,
    reviews: 56
  };

  // Giả lập dữ liệu tiện ích
  const amenities = [
    "Phòng thay đồ",
    "Nhà vệ sinh",
    "Chỗ để xe",
    "Quầy nước",
    "Wifi miễn phí",
    "Hệ thống đèn LED"
  ];

  // Định nghĩa các tab items theo cách mới
  const tabItems = [
    {
      key: "1",
      label: "Thông tin cơ bản",
      children: (
        <>
          <Descriptions bordered column={2} className="bg-white rounded-lg">
            <Descriptions.Item label="Tên sân" span={2}>
              <Text strong>{footballFieldSlice.name || "Chưa cập nhật"}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Địa chỉ" span={2}>
              <Space>
                <EnvironmentOutlined className="text-blue-500" />
                {/* <Text>{footballFieldSlice.address || "Chưa cập nhật"}</Text> */}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Số điện thoại" span={2}>
              <Space>
                <PhoneOutlined className="text-green-500" />
                <Text>{footballFieldSlice.phone || "Chưa cập nhật"}</Text>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Giờ mở cửa" span={2}>
              <Space>
                <ClockCircleOutlined className="text-orange-500" />
                <Text>06:00 - 22:00</Text>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái" span={2}>
              <Tag color="green">Đang hoạt động</Tag>
            </Descriptions.Item>
          </Descriptions>
          
          <div className="mt-6">
            <Title level={4}>Tiện ích</Title>
            <div className="flex flex-wrap gap-2 mt-2">
              {amenities.map((item, index) => (
                <Tag key={index} color="blue" className="px-3 py-1 text-sm">
                  <CheckCircleOutlined className="mr-1" /> {item}
                </Tag>
              ))}
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <Button 
              type="primary" 
              icon={<EditOutlined />} 
              onClick={handleEdit}
              size="large"
              className="bg-blue-500"
            >
              Chỉnh sửa thông tin
            </Button>
          </div>
        </>
      )
    },
    {
      key: "2",
      label: "Mô tả chi tiết",
      children: (
        <div className="bg-white p-4 rounded-lg">
          <Text>
            {
            // footballFieldSlice.description || 
              "Chưa có mô tả chi tiết. Hãy thêm mô tả để khách hàng hiểu rõ hơn về sân bóng của bạn."}
          </Text>
          
          <div className="mt-6">
            <Title level={4}>Quy định sân bóng</Title>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li>Vui lòng đến đúng giờ đã đặt</li>
              <li>Không hút thuốc trong khuôn viên sân</li>
              <li>Mang giày phù hợp khi vào sân</li>
              <li>Thanh toán đầy đủ trước khi sử dụng sân</li>
              <li>Giữ gìn vệ sinh chung</li>
            </ul>
          </div>
          
          <div className="mt-6 flex justify-end">
            <Button 
              type="primary" 
              icon={<EditOutlined />} 
              onClick={handleEdit}
              className="bg-blue-500"
            >
              Chỉnh sửa mô tả
            </Button>
          </div>
        </div>
      )
    },
    {
      key: "3",
      label: "Hình ảnh",
      children: (
        <div className="bg-white p-4 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {footballFieldSlice.image ? (
              <div className="relative h-48 rounded-lg overflow-hidden">
                <img 
                  src={footballFieldSlice.image} 
                  alt="Sân bóng" 
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="h-48 rounded-lg bg-gray-200 flex items-center justify-center">
                <Text className="text-gray-500">Chưa có hình ảnh</Text>
              </div>
            )}
            
            <div className="h-48 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-blue-500 transition-colors">
              <div className="text-center">
                <UploadOutlined className="text-2xl text-gray-500" />
                <div className="mt-2 text-gray-500">Thêm hình ảnh</div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <Button 
              type="primary" 
              icon={<UploadOutlined />} 
              className="bg-blue-500"
            >
              Quản lý hình ảnh
            </Button>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white p-6 rounded-lg shadow">
          <h1 className="text-xl font-semibold mb-4">Sân bóng của tôi</h1>
        
        <div className="">
          {/* Thông tin chính */}
          <div className="l">
            <Card className="shadow-md rounded-lg overflow-hidden border-0">
              <div className="relative h-64 -mx-6 -mt-6 mb-6">
                {footballFieldSlice.image ? (
                  <img 
                    src={footballFieldSlice.image} 
                    alt="Sân bóng" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-blue-500 to-green-500 flex items-center justify-center">
                    <Text className="text-white text-xl">Chưa có hình ảnh</Text>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                  <h1 className="text-white m-0 text-3xl font-medium">{footballFieldSlice.name || "Chưa có tên sân"}</h1>
                </div>
              </div>
              
              <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} className="mt-4" />
            </Card>
          </div>
        </div>
      </div>

      <Modal 
        title="Chỉnh Sửa Thông Tin Sân" 
        open={isModalOpen} 
        onOk={handleOk} 
        onCancel={() => setIsModalOpen(false)}
        width={700}
        footer={[
          <Button key="back" onClick={() => setIsModalOpen(false)}>
            Hủy
          </Button>,
          <Button key="submit" type="primary" onClick={handleOk} className="bg-blue-500">
            Lưu thay đổi
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item name="name" label="Tên Sân" rules={[{ required: true, message: "Vui lòng nhập tên sân!" }]}>
              <Input placeholder="Nhập tên sân bóng" />
            </Form.Item>
            <Form.Item name="phone" label="Số Điện Thoại" rules={[{ required: true, message: "Vui lòng nhập số điện thoại!" }]}>
              <Input placeholder="Nhập số điện thoại liên hệ" />
            </Form.Item>
          </div>
          
          <Form.Item name="address" label="Địa Chỉ" rules={[{ required: true, message: "Vui lòng nhập địa chỉ!" }]}>
            <Input placeholder="Nhập địa chỉ đầy đủ của sân bóng" />
          </Form.Item>
          
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={4} placeholder="Mô tả chi tiết về sân bóng của bạn" />
          </Form.Item>
          
          <Form.Item name="image" label="Hình Ảnh">
            <Upload 
              listType="picture-card" 
              beforeUpload={() => false}
              maxCount={5}
            >
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>Tải lên</div>
              </div>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default MyField;
