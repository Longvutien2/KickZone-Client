'use client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Select, Button, message, Spin, Form, Input, Upload, Card } from 'antd';
import { useAppDispatch, useAppSelector } from '@/store/hook';
import { toast } from 'react-toastify';
import { UploadOutlined } from '@ant-design/icons';
import { UploadFile } from 'antd/lib';
import { upload } from '@/utils/upload';
import { updateFootballFieldSlice } from '@/features/footballField.slice';
import { getAddress } from '@/api/address';
import { Address, Districts, Wards } from '@/models/address';

const { Option } = Select;

const statusMap: Record<number, string> = {
    0: 'Chưa xác nhận',
    1: 'Vô hiệu hóa',
};

// Các lựa chọn cho trạng thái
const statusOptions = [
    { value: "Hoạt động", label: 'Hoạt động' },
    { value: "Bảo trì", label: 'Bảo trì' },
    { value: "Vô hiệu hóa", label: 'Vô hiệu hóa' },

];

const EditFootballFieldPage = () => {
    const footballFields = useAppSelector((state) => state.footballField.value)
    const { id } = useParams();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const [form] = Form.useForm();
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const footballField = footballFields.filter((item: any) => item._id === id)[0] as any
    console.log("footballField", footballField);

    const [provinces, setProvinces] = useState<Address[]>([]);
    const [districts, setDistricts] = useState<Districts[]>([]);
    const [wards, setWards] = useState<Wards[]>([]);

    const [fileList, setFileList] = useState<UploadFile[]>([
        {
            uid: '-1', // hoặc một giá trị duy nhất cho mỗi ảnh
            name: '', // Tên tệp tin, tùy chỉnh theo ảnh của bạn
            status: 'done', // Trạng thái của tệp (done, uploading, etc.)
            url: footballField ? footballField.image : "", // URL của ảnh
        },
    ]);

    useEffect(() => {
        const fetchBooking = async () => {
            const dataAddress = await getAddress();
            dataAddress && setProvinces(dataAddress)
            console.log("có vào dât");
            if (footballField) {
                setLoading(false);
                // handleProvinceChange(footballField.address.province)
            }
        };
        fetchBooking();
    }, [id]);


    const handleSubmit = async (values: any) => {
        console.log("Value", values);
        const newAddress = {
            province: values.province,
            district: values.district,
            ward: values.ward,
            detail: values.detail
        };
        console.log("address", newAddress);

        let newImage = footballField.image;
        if (footballField.image !== values.image) {
            setUpdating(true);
            newImage = await upload(values.image)
        }
        console.log("newImage", newImage);
        await dispatch(updateFootballFieldSlice({ ...values, _id: id, image: newImage, address: newAddress })).unwrap();
        toast.success('Cập nhật thành công!');
        setUpdating(false);
        router.push('/admin/footballField');
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

    if (loading) return <Spin fullscreen />;

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <Form form={form}
                initialValues={{
                    ...footballField,
                    province: footballField.address.province,
                    district: footballField.address.district,
                    ward: footballField.address.ward,
                    detail: footballField.address.detail,

                }}
                layout="vertical" onFinish={handleSubmit} className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-6">Cập nhật sân bóng</h2>

                <Form.Item
                    name="name"
                    label="Tên sân"
                    rules={[{ required: true, message: "Vui lòng nhập tên sân!" }]}
                >
                    <Input placeholder="Nhập tên sân..." />
                </Form.Item>

                <Form.Item
                    name="image"
                    label="Hình ảnh"
                    rules={[{ required: true, message: "Vui lòng nhập địa chỉ!" }]}
                >
                    <Upload
                        beforeUpload={() => false}
                        maxCount={1}
                        listType="picture"
                        fileList={fileList}
                        onChange={({ fileList: newFileList }) => setFileList(newFileList)}
                    >
                        <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
                    </Upload>
                </Form.Item>

                <Form.Item
                    name="address"
                    label="Địa chỉ"
                >
                    <Card>
                        {/* Chọn Thành phố */}
                        <Form.Item
                            name="province"
                            label="Tỉnh/Thành phố"
                            rules={[{ required: true, message: "Vui lòng chọn tỉnh/thành phố!" }]}
                        >
                            <Select
                                onChange={handleProvinceChange}
                                placeholder="Chọn tỉnh/thành phố"
                            >
                                {provinces.map((province: Address) => (
                                    <Option key={province.Id} value={province.Name}>
                                        {province.Name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>

                        {/* Chọn quận */}
                        <Form.Item
                            name="district"
                            label="Quận/Huyện"
                            rules={[{ required: true, message: "Vui lòng chọn quận/huyện!" }]}
                        >
                            <Select
                                onChange={handleDistrictChange}
                                placeholder="Chọn quận/huyện"
                                disabled={!form.getFieldValue('province')}
                            >
                                {districts.map((district) => (
                                    <Option key={district.Id} value={district.Name}>
                                        {district.Name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>

                        {/* Chọn phường */}
                        <Form.Item
                            name="ward"
                            label="Phường/Xã"
                            rules={[{ required: true, message: "Vui lòng chọn phường/xã!" }]}
                        >
                            <Select
                                placeholder="Chọn phường/xã"
                                disabled={!form.getFieldValue('district')}
                            >
                                {wards.map((ward: Wards) => (
                                    <Option key={ward.Id} value={ward.Name}>
                                        {ward.Name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="detail"
                            label="Tên đường, số nhà"
                        >
                            <Input placeholder="Nhập địa chỉ..." />
                        </Form.Item>
                    </Card>
                </Form.Item>


                <Form.Item
                    name="phone"
                    label="Liên hệ"
                    rules={[{ required: true, message: "Vui lòng nhập địa chỉ!" }]}
                >
                    <Input placeholder="Nhập địa chỉ..." />
                </Form.Item>

                <Form.Item
                    name="status"
                    label="Trạng thái"
                    rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
                >
                    <Select
                        placeholder="Chọn trạng thái mới"
                        onChange={setStatus}
                        defaultValue={footballField ? statusMap[footballField.status] : 'Chưa xác nhận'} // Hiển thị trạng thái mặc định
                    >
                        {statusOptions.map((item) => (
                            <Option key={item.value} value={item.value}>
                                {item.label}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    name="desc"
                    label="Mô tả"
                    rules={[{ message: "Vui lòng nhập mô tả!" }]}
                >
                    <Input placeholder="Nhập mô tả..." />
                </Form.Item>

                <Button
                    type="primary"
                    htmlType="submit"
                    loading={updating}
                    className='w-50'
                >
                    Cập nhật
                </Button>
            </Form>
        </div >
    );
};

export default EditFootballFieldPage;
