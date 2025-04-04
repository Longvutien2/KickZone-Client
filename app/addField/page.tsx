"use client";
import { Input, Button, Form, Card, Upload, Select, Row, Col } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
// import { CldUploadButton } from "next-cloudinary";
// import { useAppDispatch, useAppSelector } from "@/app/hook";
// import { addFieldSlice } from "@/features/field/field.slice";
// import { addFootBallFieldSlice } from "@/features/footballField/footballField.slice";
import { FootballField } from "@/models/football_field";
// import { upload } from "@/utils/upload";
import { toast } from "react-toastify";
// import { useRouter } from "next/router";
import { useAppDispatch, useAppSelector } from '@/store/hook';
import { addFootBallFieldSlice } from '@/features/footballField.slice';
import { upload } from '@/utils/upload';
import { useRouter } from 'next/navigation';
import { metadata } from '@/utils/metadata';
import { useEffect, useState } from 'react';
import { Address, Districts, Wards } from '@/models/address';
import { getAddress } from '@/api/address';
const { Option } = Select;

const CreateFieldPage = () => {
  const user = useAppSelector(item => item.auth)
  const router = useRouter();
  const [provinces, setProvinces] = useState<Address[]>([]);
  const [districts, setDistricts] = useState<Districts[]>([]);
  const [wards, setWards] = useState<Wards[]>([]);
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  const [updating, setUpdating] = useState(false);

  const onFinish = async (values: any) => {
    console.log("values", values);
    const newAddress = {
      province: values.province,
      district: values.district,
      ward: values.ward,
      detail: values.detail ? values?.detail : ""
    };
    
    setUpdating(true);
    const data = await upload(values.image)
    console.log("🎉 Ảnh đã upload thành công:", data);

    const newFootbalField = {
      name: values.name,
      image: data,
      address: newAddress,
      phone: values.phone,
      desc: values.desc ? values.desc : "",
      userId: user.value.user._id
    }
    console.log("newFootbalField",newFootbalField);
    
    const newField = await dispatch(addFootBallFieldSlice(newFootbalField));
    if (newField) {
      setUpdating(false);
      toast.success("Tạo sân bóng thành công");
      router.push("/homepage");
    }
  };

  // Lấy quận khi chọn tỉnh
  const handleProvinceChange = (provinceName: string) => {
    const selectedProvince = provinces.find((p: Address) => p.Name === provinceName);
    setDistricts(selectedProvince ? selectedProvince.Districts : []);

    form.setFieldsValue({
      district: "", // Reset district
      ward: "", // Reset ward
    });
  };

  // Lấy phường khi chọn quận
  const handleDistrictChange = (districtName: string) => {
    const selectedDistrict = districts.find((d: Districts) => d.Name === districtName);
    setWards(selectedDistrict ? selectedDistrict.Wards : []);
  };

  useEffect(() => {
    const fetchBooking = async () => {
      const dataAddress = await getAddress();
      dataAddress && setProvinces(dataAddress)
    };
    fetchBooking();
  }, []);


  return (
    <div className="relative h-screen w-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('https://i.imgur.com/QCTydNo.jpeg')" }}>
      <div className="absolute inset-0 bg-black opacity-50 blur-md"></div>

      <Card className="relative w-6/12 p-6 bg-white opacity-90 shadow-lg rounded-xl">
        <h2 className="text-xl font-semibold text-center mb-4">Tạo Mới Sân Bóng</h2>
        <Form layout="vertical" onFinish={onFinish} form={form}>
          <Row gutter={24}>
            {/* Cột bên trái */}
            <Col span={12}>
              <Form.Item label="Tên Sân" name="name" rules={[{ required: true, message: "Vui lòng nhập tên sân!" }]}>
                <Input placeholder="Nhập tên sân" />
              </Form.Item>

              <Form.Item label="Ảnh Sân" name="image" rules={[{ required: true, message: "Vui lòng tải lên ảnh sân!" }]}>
                <Upload beforeUpload={() => false} maxCount={1} listType="picture">
                  <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
                </Upload>
              </Form.Item>

              <Form.Item name="address" label="Địa chỉ">
                <Card>
                  <Form.Item name="province" label="Tỉnh/Thành phố" rules={[{ required: true, message: "Vui lòng chọn tỉnh/thành phố!" }]}>
                    <Select onChange={handleProvinceChange} placeholder="Chọn tỉnh/thành phố">
                      {provinces.map((province) => (
                        <Option key={province.Id} value={province.Name}>
                          {province.Name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item name="district" label="Quận/Huyện" rules={[{ required: true, message: "Vui lòng chọn quận/huyện!" }]}>
                    <Select onChange={handleDistrictChange} placeholder="Chọn quận/huyện" disabled={!form.getFieldValue('province')}>
                      {districts.map((district) => (
                        <Option key={district.Id} value={district.Name}>
                          {district.Name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item name="ward" label="Phường/Xã" rules={[{ required: true, message: "Vui lòng chọn phường/xã!" }]}>
                    <Select placeholder="Chọn phường/xã" disabled={!form.getFieldValue('district')}>
                      {wards.map((ward) => (
                        <Option key={ward.Id} value={ward.Name}>
                          {ward.Name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item name="detail" label="Tên đường, số nhà">
                    <Input placeholder="Nhập địa chỉ..." />
                  </Form.Item>
                </Card>
              </Form.Item>
            </Col>

            {/* Cột bên phải */}
            <Col span={12}>
              <Form.Item label="Số điện thoại" name="phone" rules={[{ required: true, message: "Vui lòng nhập số điện thoại!" }]}>
                <Input placeholder="Nhập số điện thoại" />
              </Form.Item>

              <Form.Item label="Chi tiết" name="desc">
                <Input.TextArea placeholder="Nhập mô tả chi tiết về sân" rows={3} />
              </Form.Item>

              <Form.Item className="text-center">
                <Button type="primary" htmlType="submit" className="w-full"
                  loading={updating}
                >
                  Tạo sân bóng
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
}
export default CreateFieldPage
