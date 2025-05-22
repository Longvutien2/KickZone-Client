'use client';
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Button, Input, Radio, Card, Form, notification, Collapse, Modal, Alert, Result, QRCode } from 'antd';
import { useDispatch, useSelector } from "react-redux";
import { RootStateType } from "@/models/type";
import { Field, TimeSlot } from "@/models/field";
import { FootballField } from "@/models/football_field";
import { Notification } from "@/models/notification";
import { getFieldById, getFieldsByIdFootball } from "@/api/field";
import { createBooking, getBookings } from "@/api/booking";
import { getTimeSlotById } from "@/api/timeSlot";
import { updateTimeSlotSlice } from "@/features/timeSlot.slice";
import { addNotificationSlice } from "@/features/notification.slice";
import { AppDispatch } from "@/store/store";
import { useParams, useSearchParams } from "next/navigation";
import { addBreadcrumb, resetBreadcrumb } from "@/features/breadcrumb.slice";
import { useAppSelector } from "@/store/hook";
import { BankOutlined, CheckCircleOutlined, CreditCardOutlined, InfoCircleOutlined, LockOutlined, MailOutlined, MobileOutlined, PhoneOutlined, QrcodeOutlined, UserOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { toast } from 'react-toastify';
import PaymentQR from "@/components/Payment";
import { createOrder } from "@/api/payment";
import { Order } from "@/models/payment";

const paymentMethods = [
    { id: "bank", name: "Chuyển khoản / Internet Banking" },
    { id: "qr", name: "Quét mã QR" },
    { id: "momo", name: "Ví MoMo" },
    { id: "visa", name: "Thẻ Visa, Master, JCB" },
    { id: "atm", name: "Thẻ ATM (Thẻ nội địa)" },
];

interface FieldData {
    date: string;
    fieldName: string;
    address: any;
    field: string;
    timeStart: string;
    price: number;
    footballField: FootballField | string;
}

interface Information {
    teamName: string;
    phone: string;
    note?: string;
}

const BookingPage = () => {
    const user = useAppSelector((state) => state.auth)
    const [fields, setField] = useState<FieldData | null>(null);
    const [timeslots, setTimeslots] = useState<TimeSlot>();
    const { id, slotId } = useParams();
    const searchParams = useSearchParams();
    const date = searchParams.get('date');

    const [form] = Form.useForm();
    const [selectedPayment, setSelectedPayment] = useState("banking");
    const [fieldData, setFieldData] = useState<FieldData | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const [confirmModalVisible, setConfirmModalVisible] = useState(false);
    const [formValues, setFormValues] = useState<Information | null>(null);
    const [qrContent, setQrContent] = useState("");
    const [orderId, setOrderId] = useState("");
    const [orderCreated, setOrderCreated] = useState(false);
    const [newOrder, setNewOrder] = useState<any>();

    const dispatch = useDispatch<AppDispatch>();
    console.log("fieldData", fieldData);

    // Thêm state để kiểm tra sân đã được đặt chưa
    const [isFieldBooked, setIsFieldBooked] = useState(false);

    // Generate QR code when payment method changes or field data is loaded
    useEffect(() => {
        if (selectedPayment === "qr" && fieldData) {
            generateQRCode();
        }
    }, [selectedPayment, fieldData]);

    // Function to generate QR code
    const generateQRCode = () => {
        if (fieldData) {
            const bankId = "MB"; // Mã ngân hàng MB Bank
            const accountNo = "29777777729"; // Số tài khoản
            const amount = fieldData.price; // Số tiền
            const accountName = "VU TIEN LONG"; // Tên tài khoản
            const description = `${fieldData.field} ${fieldData.date} ${fieldData.timeStart}`; // Nội dung chuyển khoản

            // // Mã hóa các thông tin để đưa vào URL
            // const encodedDescription = encodeURIComponent(description);
            // const encodedAccountName = encodeURIComponent(accountName);

            const orderId = `${Date.now()}`;
            // Tạo URL VietQR
            const vietQrUrl = `https://qr.sepay.vn/img?acc=VQRQACMYR4474&bank=MBBank&amount=${amount}&des=DH${description}`;
            setOrderId(orderId);
            setQrContent(vietQrUrl);
        }
    };

    const showConfirmModal = async (values: Information) => {
        setFormValues(values);

        // Generate QR code if not already generated
        if (selectedPayment === "qr" && !qrContent) {
            generateQRCode();
        }

        // Nếu chọn thanh toán QR, tạo đơn hàng ngay khi hiển thị modal
        if (selectedPayment === "qr" && orderId && user.value.user._id && fieldData) {
            try {
                console.log("đã tạo order");
                const { data } = await createOrder({
                    sepayId: orderId,
                    userId: user.value.user._id,
                    teamName: values.teamName,
                    phoneNumber: values.phone,
                    description: values.note,
                    fieldName: fieldData.field,
                    timeStart: fieldData.timeStart,
                    date: fieldData.date,
                    gateway: "MBBank",
                    accountNumber: "29777777729",
                    amount: fieldData.price as number,
                    content: `${fieldData.field} ${fieldData.date} ${fieldData.timeStart}`,
                    paymentStatus: "pending",
                });
                setOrderCreated(true);
                data && setNewOrder(data);
            } catch (error) {
                console.error("Lỗi khi tạo đơn hàng:", error);
                toast.error("Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại!");
            }
        }

        setConfirmModalVisible(true);
    };

    const handleConfirmCancel = () => {
        setConfirmModalVisible(false);
    };

    // const handleConfirmOk = async () => {
    //     setConfirmModalVisible(false);
    //     if (formValues) {
    //         await processBooking(formValues);
    //     }
    // };

    // const processBooking = async (values: Information) => {
    //     if (fieldData) {
    //         // Không cần tạo booking và gửi thông báo ở đây nữa
    //         // Việc này đã được xử lý trong component PaymentQR
    //         setIsSuccess(true);
    //     }
    // }

    // Giả lập dữ liệu sân từ server
    useEffect(() => {
        if (id && slotId) {
            const getData = async () => {
                const timeslot = await getTimeSlotById(slotId as string);
                const field = await getFieldById(id as string);

                if (field && timeslot) {
                    const mockData = {
                        date: date as string,
                        fieldName: field.data.foolballFieldId?.name,
                        address: `${field.data.foolballFieldId?.address.detail ? `${field.data.foolballFieldId.address.detail}, ` : ""} ${field.data.foolballFieldId.address.ward}, ${field.data.foolballFieldId.address.district}, ${field.data.foolballFieldId.address.province}`,
                        field: field.data.name,
                        timeStart: timeslot.data.time,
                        price: Number(timeslot.data.price),
                        footballField: field.data.foolballFieldId._id
                    };
                    setFieldData(mockData);

                    setField(field.data)
                    setTimeslots(timeslot.data)

                    // Kiểm tra xem sân đã được đặt chưa
                    try {
                        const { data: bookings } = await getBookings();

                        const isBooked = bookings.some(booking =>
                            booking.field === field.data.name &&
                            booking.timeStart === timeslot.data.time &&
                            booking.date === date &&
                            (booking.status === "Chờ xác nhận" || booking.status === "Đã xác nhận")
                        );

                        if (isBooked) {
                            setIsFieldBooked(true);
                        }
                    } catch (error) {
                        console.error("Lỗi khi kiểm tra đặt sân:", error);
                    }
                }

                dispatch(addBreadcrumb({ name: "Thanh toán", url: `/homepage/datSan/${id}/${slotId}` }));
            }
            getData();
        }
    }, [id, slotId]);

    // Nếu đã đặt sân thành công, hiển thị trang kết quả
    if (isSuccess && formValues) {
        return (
            <div className="container mx-auto py-6 px-4">
                <Result
                    status="success"
                    title="Đặt sân thành công!"
                    subTitle="Bạn đã đặt sân thành công. Vui lòng chờ chủ sân xác nhận."
                    className="text-left"
                    extra={[
                        <div key="booking-details" className=" bg-gray-50 p-6 rounded-lg mb-6 border border-gray-200 max-w-full">
                            <h3 className="text-lg font-semibold  mb-4">Thông tin đặt sân</h3>
                            <div className="space-y-3 text-left">
                                <div className="flex gap-8">
                                    <div className="font-medium w-24">Tên sân:</div>
                                    <div>{fieldData?.fieldName}</div>
                                </div>
                                <div className="flex gap-8">
                                    <div className="font-medium w-24">Sân số:</div>
                                    <div>{fieldData?.field}</div>
                                </div>
                                <div className="flex gap-8">
                                    <div className="font-medium w-24">Ngày đá:</div>
                                    <div>{fieldData?.date}</div>
                                </div>
                                <div className="flex gap-8">
                                    <div className="font-medium w-24">Giờ đá:</div>
                                    <div>{fieldData?.timeStart}</div>
                                </div>
                                <div className="flex gap-8">
                                    <div className="font-medium w-24">Giá tiền:</div>
                                    <div className="text-red-600">{fieldData?.price?.toLocaleString()} VNĐ</div>
                                </div>
                                <div className="flex gap-8">
                                    <div className="font-medium w-24">Phương thức:</div>
                                    <div>{selectedPayment === "banking" ? "Chuyển khoản" :
                                        selectedPayment === "qr" ? "Quét mã QR" :
                                            selectedPayment === "momo" ? "Ví MoMo" :
                                                selectedPayment === "card" ? "Thẻ Visa/Master" : "Thẻ ATM"}</div>
                                </div>
                            </div>
                        </div>,
                        <Alert
                            key="payment-alert"
                            message="Thanh toán an toàn & bảo mật"
                            description={
                                <div className="space-y-2 mt-2 ">
                                    <p>• Đơn đặt sân của bạn đã được ghi nhận.</p>
                                    <p>• Vui lòng hoàn tất thanh toán để chủ sân xác nhận đặt sân.</p>
                                    <p>• Bạn có thể theo dõi trạng thái đặt sân trong mục thông báo.</p>
                                    <p>• Bạn có thể hủy đặt sân trước 24 giờ.</p>
                                </div>
                            }
                            type="info"
                            showIcon
                            className="max-w-full text-left  mb-4"
                        />,
                        <div key="buttons" className="flex justify-start space-x-4">
                            <Button type="primary" href="/homepage/thongBao">
                                Xem thông báo
                            </Button>
                            <Button href="/homepage/datSan">
                                Quay lại trang đặt sân
                            </Button>
                        </div>
                    ]}
                />
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6 px-4">
            <Form
                form={form}
                layout="vertical"
                onFinish={showConfirmModal}
                initialValues={{
                    paymentMethod: selectedPayment
                }}
            >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Cột bên trái - Thông tin đơn hàng */}
                    <div className="md:col-span-2">
                        <Card title="Thanh toán" className="mb-6">
                            {/* Tóm tắt đơn hàng */}
                            <div className="bg-gray-50 p-4 rounded-lg mb-6">
                                <h3 className="text-lg font-semibold mb-3">Tóm tắt đơn hàng</h3>
                                <div className="space-y-2">
                                    <div className="grid grid-cols-3">
                                        <div className="col-span-1 font-medium">Ngày:</div>
                                        <div className="col-span-2 text-right">{fieldData?.date}</div>
                                    </div>
                                    <div className="grid grid-cols-3">
                                        <div className="col-span-1 font-medium">Tên sân:</div>
                                        <div className="col-span-2 text-right">{fieldData?.fieldName}</div>
                                    </div>
                                    <div className="grid grid-cols-3">
                                        <div className="col-span-1 font-medium">Địa chỉ:</div>
                                        <div className="col-span-2 text-right">{fieldData?.address}</div>
                                    </div>
                                    <div className="grid grid-cols-3">
                                        <div className="col-span-1 font-medium">Sân số:</div>
                                        <div className="col-span-2 text-right">{fieldData?.field}</div>
                                    </div>
                                    <div className="grid grid-cols-3">
                                        <div className="col-span-1 font-medium">Giờ đá:</div>
                                        <div className="col-span-2 text-right">{fieldData?.timeStart}</div>
                                    </div>
                                    <div className="grid grid-cols-3">
                                        <div className="col-span-1 font-medium">Giá tiền:</div>
                                        <div className="col-span-2 text-right text-red-600 font-semibold">{fieldData?.price?.toLocaleString()} VNĐ</div>
                                    </div>
                                </div>
                            </div>

                            {/* Hình thức thanh toán */}
                            <h3 className="text-lg font-semibold mb-3">Hình thức thanh toán</h3>
                            <Form.Item
                                name="paymentMethod"
                                rules={[{ required: true, message: "Vui lòng chọn hình thức thanh toán!" }]}

                            >
                                <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                                    <Radio.Group
                                        className="w-full"
                                        onChange={(e) => setSelectedPayment(e.target.value)}
                                        defaultValue={selectedPayment}
                                    >
                                        <Collapse
                                            bordered={false}
                                            expandIconPosition="end"
                                            activeKey={selectedPayment ? [selectedPayment] : []}
                                            className="bg-white"
                                            ghost={true}
                                        >
                                            <Collapse.Panel
                                                key="banking"
                                                header={
                                                    <Radio value="banking" className="w-full flex items-center">
                                                        <BankOutlined className="text-blue-500 mr-2 text-lg" />
                                                        <span>Chuyển khoản / Internet Banking</span>
                                                    </Radio>
                                                }
                                                showArrow={false}
                                            >
                                                <div className="bg-gray-50 p-4 border-t border-gray-200">
                                                    <table className="w-full text-sm">
                                                        <tbody>
                                                            <tr>
                                                                <td className="py-1 font-medium w-1/4">Ngân hàng:</td>
                                                                <td className="text-blue-600">Vietcombank</td>
                                                            </tr>
                                                            <tr>
                                                                <td className="py-1 font-medium">Số tài khoản:</td>
                                                                <td>1234567890</td>
                                                            </tr>
                                                            <tr>
                                                                <td className="py-1 font-medium">Chủ tài khoản:</td>
                                                                <td>CÔNG TY TNHH KICKZONE</td>
                                                            </tr>
                                                            <tr>
                                                                <td className="py-1 font-medium">Nội dung:</td>
                                                                <td>{fieldData?.fieldName} {fieldData?.date} {fieldData?.timeStart}</td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </Collapse.Panel>

                                            <Collapse.Panel
                                                key="qr"
                                                header={
                                                    <Radio value="qr" className="w-full flex items-center">
                                                        <QrcodeOutlined className="text-green-500 mr-2 text-lg" />
                                                        <span>Quét mã QR</span>
                                                    </Radio>
                                                }
                                                showArrow={false}
                                            >
                                                <div className="bg-gray-50 p-4 border-t border-gray-200 flex justify-center">
                                                    <img src={qrContent} alt="QR Code thanh toán" className="h-64 w-64 border-gray-200 rounded-md mb-4" />
                                                </div>
                                            </Collapse.Panel>

                                            <Collapse.Panel
                                                key="momo"
                                                header={
                                                    <Radio value="momo" className="w-full flex items-center">
                                                        <MobileOutlined className="text-pink-500 mr-2 text-lg" />
                                                        <span>Ví MoMo</span>
                                                    </Radio>
                                                }
                                                showArrow={false}
                                            >
                                                <div className="bg-gray-50 p-4 border-t border-gray-200">
                                                    <p className="text-gray-600">Quét mã MoMo hoặc chuyển khoản đến số điện thoại: 0987654321</p>
                                                </div>
                                            </Collapse.Panel>

                                            <Collapse.Panel
                                                key="card"
                                                header={
                                                    <Radio value="card" className="w-full flex items-center">
                                                        <CreditCardOutlined className="text-orange-500 mr-2 text-lg" />
                                                        <span>Thẻ Visa, Master, JCB</span>
                                                    </Radio>
                                                }
                                                showArrow={false}
                                            >
                                                <div className="bg-gray-50 p-4 border-t border-gray-200">
                                                    <p className="text-gray-600">Bạn sẽ được chuyển đến trang thanh toán an toàn sau khi xác nhận.</p>
                                                </div>
                                            </Collapse.Panel>

                                            <Collapse.Panel
                                                key="atm"
                                                header={
                                                    <Radio value="atm" className="w-full flex items-center">
                                                        <BankOutlined className="text-blue-700 mr-2 text-lg" />
                                                        <span>Thẻ ATM (Thẻ nội địa)</span>
                                                    </Radio>
                                                }
                                                showArrow={false}
                                            >
                                                <div className="bg-gray-50 p-4 border-t border-gray-200">
                                                    <p className="text-gray-600">Bạn sẽ được chuyển đến cổng thanh toán Napas sau khi xác nhận.</p>
                                                </div>
                                            </Collapse.Panel>
                                        </Collapse>
                                    </Radio.Group>
                                </div>
                            </Form.Item>

                            {/* Thông tin cá nhân */}
                            <h3 className="text-lg font-semibold mb-3">Thông tin cá nhân</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Form.Item
                                    name="teamName"
                                    label="Tên đội bóng"
                                    labelCol={{ span: 24 }}
                                    wrapperCol={{ span: 24 }}
                                    rules={[{ required: true, message: "Vui lòng nhập họ và tên!" }]}
                                >
                                    <Input
                                        size="large"
                                        placeholder="Tên đội bóng"
                                        prefix={<UserOutlined />}
                                        className="border-gray-200"
                                    />
                                </Form.Item>

                                <Form.Item
                                    name="phone"
                                    label="Số điện thoại"
                                    labelCol={{ span: 24 }}
                                    wrapperCol={{ span: 24 }}
                                    rules={[
                                        { required: true, message: "Vui lòng nhập số điện thoại!" },
                                        { pattern: /^[0-9]{10}$/, message: "Số điện thoại không hợp lệ!" }
                                    ]}
                                >
                                    <Input
                                        size="large"
                                        placeholder="Số điện thoại"
                                        prefix={<PhoneOutlined />}
                                        className="border-gray-200"
                                    />
                                </Form.Item>
                            </div>

                            {/* <Form.Item
                                name="email"
                                label="Email"
                                labelCol={{ span: 24 }}
                                wrapperCol={{ span: 24 }}
                                rules={[
                                    { required: true, message: "Vui lòng nhập email!" },
                                    { type: 'email', message: "Email không hợp lệ!" }
                                ]}
                            >
                                <Input
                                    size="large"
                                    placeholder="Email"
                                    prefix={<MailOutlined />}
                                    className="border-gray-200"
                                />
                            </Form.Item> */}

                            <Form.Item
                                name="note"
                                label="Ghi chú"
                                labelCol={{ span: 24 }}
                                wrapperCol={{ span: 24 }}
                            >
                                <Input.TextArea placeholder="Ghi chú thêm (nếu có)" rows={3} />
                            </Form.Item>
                        </Card>
                    </div>

                    {/* Cột bên phải - Tóm tắt và thanh toán */}
                    <div className="md:col-span-1">
                        <Card title="Tóm tắt thanh toán" className="sticky top-4">
                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <span>Giá sân:</span>
                                    <span>{fieldData?.price?.toLocaleString()} VNĐ</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Phí dịch vụ:</span>
                                    <span>0 VNĐ</span>
                                </div>
                                <div className="border-t pt-2 flex justify-between font-semibold">
                                    <span>Tổng cộng:</span>
                                    <span className="text-red-600">{fieldData?.price?.toLocaleString()} VNĐ</span>
                                </div>
                            </div>

                            <div className="mt-6">
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    disabled={isSuccess || isFieldBooked}
                                    block
                                    className="h-12 text-lg"
                                    icon={<CheckCircleOutlined />}
                                >
                                    Xác nhận thanh toán
                                </Button>

                                {isFieldBooked && (
                                    <div className="mt-2 text-red-500 text-center font-medium">
                                        Khung giờ này đã có người đặt và đang chờ xác nhận. Vui lòng chọn sân khác.
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 text-sm text-gray-500">
                                <p className="mb-2">
                                    <LockOutlined className="mr-1" /> Thanh toán an toàn & bảo mật
                                </p>
                                <p className="flex items-center">
                                    <InfoCircleOutlined className="mr-1" /> Bạn có thể hủy đặt sân trước 24 giờ
                                </p>
                            </div>
                        </Card>
                    </div>
                </div>
            </Form>

            {/* Modal xác nhận thanh toán */}
            <Modal
                title={
                    <div className="flex items-center text-orange-500">
                        <ExclamationCircleOutlined className="mr-2 text-xl" />
                        <span>Xác nhận thanh toán</span>
                    </div>
                }
                open={confirmModalVisible}
                onCancel={handleConfirmCancel}
                footer={[
                    <Button key="back" onClick={handleConfirmCancel}>
                        Hủy
                    </Button>,
                    selectedPayment !== "qr" && (
                        <Button
                            key="submit"
                            type="primary"
                            onClick={() => {
                                setConfirmModalVisible(false);
                                setIsSuccess(true);
                            }}
                            className="bg-orange-500"
                        >
                            Tôi đã chuyển khoản
                        </Button>
                    ),
                ]}
                centered
            >
                <div className="py-4">
                    {selectedPayment === "qr" ? (
                        <div className="text-center">
                            <PaymentQR
                                onSuccess={(success) => {
                                    if (success) {
                                        setIsSuccess(true);
                                    }
                                }}
                                orderId={orderId}
                                userId={user.value.user._id as string}
                                qrContent={qrContent}
                                amount={fieldData?.price as number}
                                description={`${fieldData?.field} ${fieldData?.date} ${fieldData?.timeStart}`}
                                orderCreated={orderCreated}
                                fieldData={fieldData} // Truyền thêm fieldData
                                newOrder={newOrder} // Truyền thêm newOrder
                            />
                        </div>
                    ) : (
                        <div>
                            <p className="mb-4">Vui lòng thực hiện chuyển khoản với thông tin sau:</p>
                            {/* Thông tin chuyển khoản */}
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
};

export default BookingPage;
