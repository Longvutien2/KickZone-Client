
'use client';
import { useEffect, useState } from "react";
import { Button, Modal, Form, Input, Upload, Card, Tabs, Descriptions, Divider, Typography, Space, Tag, Avatar, Select } from "antd";
import { UploadOutlined, EditOutlined, EnvironmentOutlined, PhoneOutlined, TeamOutlined, StarOutlined, CheckCircleOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { getFootballFieldByIdUserSlice, updateFootballFieldSlice } from "@/features/footballField.slice";
import { FootballField } from "@/models/football_field";
import { getAddress } from '@/api/address';
import { Address, Districts, Wards } from '@/models/address';
import { Option } from "antd/es/mentions";
import { upload } from "@/utils/upload";
import { toast } from "react-toastify";

const { Title, Text } = Typography;

const MyField = () => {
  const auth = useAppSelector((state) => state.auth);
  const footballFieldSlice = useAppSelector(state => state.footballField.detail) as FootballField;
  const dispatch = useAppDispatch();
  const [field, setField] = useState();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState("1");
  const [provinces, setProvinces] = useState<Address[]>([]);
  const [districts, setDistricts] = useState<Districts[]>([]);
  const [wards, setWards] = useState<Wards[]>([]);
  const [loading, setLoading] = useState(false);

  const handleEdit = () => {
    form.setFieldsValue(field);
    setIsModalOpen(true);
  };

  const handleOk = async () => {
    form.validateFields().then((values) => {
      setField(values);
      const update = async () => {
        setLoading(true);

        let linkImage = footballFieldSlice.image; // Default to current image
        if (values.image && values.image !== footballFieldSlice.image) {
          linkImage = await upload(values.image);
          console.log("🎉 Ảnh đã upload thành công:", linkImage);
        }
        const data = {
          ...values,
          image: linkImage,
          address: {
            province: values.province || footballFieldSlice.address.province,
            district: values.district || footballFieldSlice.address.district,
            ward: values.ward || footballFieldSlice.address.ward,
            detail: values.detail || footballFieldSlice.address.detail
          }
        }
        const newData = await dispatch(updateFootballFieldSlice(data));
        newData && toast.success("Cập nhật thành công!")
        setLoading(false);
        setIsModalOpen(false);
      }
      update();
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
                <Text>
                  {footballFieldSlice.address.detail ? `${footballFieldSlice.address.detail}, ` : ""}
                  {footballFieldSlice.address.ward}, {footballFieldSlice.address.district}, {footballFieldSlice.address.province}
                </Text>
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
                <Text>05:00 - 24:00</Text>
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
              footballFieldSlice.description || 
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

          {/* <div className="mt-6 flex justify-end">
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={handleEdit}
              className="bg-blue-500"
            >
              Chỉnh sửa mô tả
            </Button>
          </div> */}
        </div>
      )
    },
  ];

  // Thêm useEffect để lấy dữ liệu địa chỉ
  useEffect(() => {
    const fetchAddress = async () => {
      try {
        const dataAddress = await getAddress();
        dataAddress && setProvinces(dataAddress);
      } catch (error) {
        console.error("Error fetching address data:", error);
      }
    };
    fetchAddress();
  }, []);

  // Thêm hàm xử lý khi chọn tỉnh/thành phố
  const handleProvinceChange = (provinceName: string) => {
    const selectedProvince = provinces.find((p: Address) => p.Name === provinceName);
    setDistricts(selectedProvince ? selectedProvince.Districts : []);
    form.setFieldsValue({ district: "", ward: "", detail: "" });
  };

  // Thêm hàm xử lý khi chọn quận/huyện
  const handleDistrictChange = (districtName: string) => {
    const selectedDistrict = districts.find((d: Districts) => d.Name === districtName);
    setWards(selectedDistrict ? selectedDistrict.Wards : []);
    form.setFieldsValue({ ward: "", detail: "" });
  };

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
          <Button key="submit" type="primary" loading={loading} onClick={handleOk} className="bg-blue-500">
            Lưu thay đổi
          </Button>,
        ]}
      >
        <Form form={form} initialValues={{
          ...footballFieldSlice,
          province: footballFieldSlice.address.province,
          district: footballFieldSlice.address.district,
          ward: footballFieldSlice.address.ward,
          detail: footballFieldSlice.address.detail
        }} layout="vertical" className="mt-4" >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item name="_id" label="Tên Sân" hidden rules={[{ required: true, message: "Vui lòng nhập tên sân!" }]}>
              <Input placeholder="Nhập tên sân bóng" />
            </Form.Item>
            <Form.Item name="name" label="Tên Sân" rules={[{ required: true, message: "Vui lòng nhập tên sân!" }]}>
              <Input placeholder="Nhập tên sân bóng" />
            </Form.Item>
            <Form.Item name="phone" label="Số Điện Thoại" rules={[{ required: true, message: "Vui lòng nhập số điện thoại!" }]}>
              <Input placeholder="Nhập số điện thoại liên hệ" />
            </Form.Item>
          </div>

          <Form.Item label="Địa Chỉ" rules={[{ required: true, message: "Vui lòng nhập địa chỉ!" }]}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item name="province" noStyle rules={[{ required: true, message: "Vui lòng chọn tỉnh/thành phố!" }]}>
                <Select
                  placeholder="Chọn tỉnh/thành phố"
                  onChange={handleProvinceChange}
                  className="w-full mb-2"
                >
                  {provinces.map((province: Address) => (
                    <Option key={province.Name} value={province.Name}>
                      {province.Name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item name="district" noStyle rules={[{ required: true, message: "Vui lòng chọn quận/huyện!" }]}>
                <Select
                  placeholder="Chọn quận/huyện"
                  onChange={handleDistrictChange}
                  className="w-full mb-2"
                  disabled={!districts.length}
                >
                  {districts.map((district: Districts) => (
                    <Option key={district.Name} value={district.Name}>
                      {district.Name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item name="ward" noStyle rules={[{ required: true, message: "Vui lòng chọn phường/xã!" }]}>
                <Select
                  placeholder="Chọn phường/xã"
                  className="w-full mb-2"
                  disabled={!wards.length}
                >
                  {wards.map((ward: Wards) => (
                    <Option key={ward.Name} value={ward.Name}>
                      {ward.Name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item name="detail" noStyle>
                <Input placeholder="Nhập địa chỉ chi tiết (số nhà, đường...)" className="w-full" />
              </Form.Item>
            </div>
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={4} placeholder="Mô tả chi tiết về sân bóng của bạn" />
          </Form.Item>


          <Form.Item label="Ảnh Sân" name="image" rules={[{ required: true, message: "Vui lòng tải lên ảnh sân!" }]}>
            <Upload beforeUpload={() => false} maxCount={1} listType="picture">
              <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default MyField;
