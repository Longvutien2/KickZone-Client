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
import { createOrder, getOrdersByUserId, updatePendingOrder } from "@/api/payment";
import { Order } from "@/models/payment";
import { useOrderCleanup } from "@/utils/orderCleanup";

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

    // Function to check existing pending order
    const checkExistingPendingOrder = async (userId: string, fieldName: string, date: string, timeStart: string) => {
        try {
            const { data: userOrders } = await getOrdersByUserId(userId);

            // Tìm order pending cho cùng sân, ngày, giờ
            const existingPendingOrder = userOrders.find((order: any) =>
                order.paymentStatus === "pending" &&
                order.fieldName === fieldName &&
                order.date === date &&
                order.timeStart === timeStart
            );

            return existingPendingOrder;
        } catch (error) {
            console.error("Lỗi khi kiểm tra order pending:", error);
            return null;
        }
    };

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

        // Nếu chọn thanh toán QR, kiểm tra và tạo/cập nhật đơn hàng
        if (selectedPayment === "qr" && orderId && user.value.user._id && fieldData) {
            try {
                // Kiểm tra xem đã có order pending cho cùng sân/thời gian chưa
                const existingOrder = await checkExistingPendingOrder(
                    user.value.user._id,
                    fieldData.field,
                    fieldData.date,
                    fieldData.timeStart
                );

                if (existingOrder) {
                    // Nếu đã có order pending, cập nhật thông tin mới
                    console.log("Cập nhật order pending:", existingOrder);
                    try {
                        const { data: updatedOrder } = await updatePendingOrder(existingOrder._id!, {
                            teamName: values.teamName,
                            phoneNumber: values.phone,
                            description: values.note,
                            content: `${fieldData.field} ${fieldData.date} ${fieldData.timeStart}`,
                        });
                        setNewOrder(updatedOrder);
                        setOrderCreated(true);
                    } catch (updateError) {
                        console.error("Lỗi khi cập nhật order:", updateError);
                        // Nếu cập nhật thất bại, sử dụng order cũ
                        setNewOrder(existingOrder);
                        setOrderCreated(true);
                    }
                } else {
                    // Nếu chưa có, tạo order mới
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
                }
            } catch (error) {
                console.error("Lỗi khi xử lý đơn hàng:", error);
                toast.error("Có lỗi xảy ra khi xử lý đơn hàng. Vui lòng thử lại!");
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

    // Auto cleanup orders pending khi component mount
    useOrderCleanup(true);

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
                                    <p>• Bạn không thể hủy sân khi đã đặt.</p>
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
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={showConfirmModal}
                    initialValues={{
                        paymentMethod: selectedPayment
                    }}
                >
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                        {/* Cột bên trái - Thông tin đơn hàng */}
                        <div className="lg:col-span-2 order-2 lg:order-1">
                            <Card
                                title={
                                    <div className="flex items-center text-lg sm:text-xl font-bold text-gray-900">
                                        <CreditCardOutlined className="mr-2 text-orange-500" />
                                        Thanh toán
                                    </div>
                                }
                                className="mb-4 sm:mb-6 shadow-lg border-0"
                            >
                                {/* Tóm tắt đơn hàng */}
                                <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 sm:p-6 rounded-xl mb-6 border border-orange-200">
                                    <div className="flex items-center mb-4">
                                        <InfoCircleOutlined className="text-orange-500 mr-2 text-lg" />
                                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Tóm tắt đơn hàng</h3>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                                            <div className="font-medium text-gray-700">Ngày:</div>
                                            <div className="font-semibold text-gray-900">{fieldData?.date}</div>
                                        </div>
                                        <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                                            <div className="font-medium text-gray-700">Tên sân:</div>
                                            <div className="font-semibold text-gray-900">{fieldData?.fieldName}</div>
                                        </div>
                                        <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                                            <div className="font-medium text-gray-700">Địa chỉ:</div>
                                            <div className="font-semibold text-gray-900 text-right sm:text-right break-words">{fieldData?.address}</div>
                                        </div>
                                        <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                                            <div className="font-medium text-gray-700">Sân số:</div>
                                            <div className="font-semibold text-gray-900">{fieldData?.field}</div>
                                        </div>
                                        <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                                            <div className="font-medium text-gray-700">Giờ đá:</div>
                                            <div className="font-semibold text-gray-900">{fieldData?.timeStart}</div>
                                        </div>
                                        <div className="border-t border-orange-200 pt-3 mt-3">
                                            <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                                                <div className="font-medium text-gray-700">Giá tiền:</div>
                                                <div className="text-xl font-bold text-orange-600">{fieldData?.price?.toLocaleString()} VNĐ</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Hình thức thanh toán */}
                                <Card className="mb-6">
                                    <div className="flex items-center mb-4">
                                        <div>
                                            <CreditCardOutlined className="text-orange-500 mr-2 text-lg" />
                                        </div>
                                        <div className="text-lg sm:text-xl font-semibold text-gray-900">Hình thức thanh toán</div>
                                    </div>
                                    <Form.Item
                                        name="paymentMethod"
                                        rules={[{ required: true, message: "Vui lòng chọn hình thức thanh toán!" }]}
                                    >
                                        <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">
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
                                                            <Radio value="banking" className="w-full flex items-center py-2">
                                                                <BankOutlined className="text-blue-500 mr-3 text-lg sm:text-xl" />
                                                                <span className="text-sm sm:text-base font-medium">Chuyển khoản / Internet Banking</span>
                                                            </Radio>
                                                        }
                                                        showArrow={false}
                                                        className="border-b border-gray-100 last:border-b-0"
                                                    >
                                                        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 sm:p-6 border-t border-blue-200">
                                                            <div className="space-y-3">
                                                                <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                                                                    <span className="font-medium text-gray-700">Ngân hàng:</span>
                                                                    <span className="text-blue-600 font-semibold">Vietcombank</span>
                                                                </div>
                                                                <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                                                                    <span className="font-medium text-gray-700">Số tài khoản:</span>
                                                                    <span className="font-mono font-semibold">1234567890</span>
                                                                </div>
                                                                <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                                                                    <span className="font-medium text-gray-700">Chủ tài khoản:</span>
                                                                    <span className="font-semibold">CÔNG TY TNHH KICKZONE</span>
                                                                </div>
                                                                <div className="border-t border-blue-200 pt-3 mt-3">
                                                                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                                                                        <span className="font-medium text-gray-700">Nội dung:</span>
                                                                        <span className="font-semibold text-orange-600 break-words">
                                                                            Sân bóng KickZone {fieldData?.date} {fieldData?.timeStart}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </Collapse.Panel>

                                                    <Collapse.Panel
                                                        key="qr"
                                                        header={
                                                            <Radio value="qr" className="w-full flex items-center py-2">
                                                                <QrcodeOutlined className="text-green-500 mr-3 text-lg sm:text-xl" />
                                                                <span className="text-sm sm:text-base font-medium">Quét mã QR</span>
                                                            </Radio>
                                                        }
                                                        showArrow={false}
                                                        className="border-b border-gray-100 last:border-b-0"
                                                    >
                                                        <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 sm:p-6 border-t border-green-200">
                                                            <div className="flex flex-col items-center">
                                                                <img
                                                                    src={qrContent}
                                                                    alt="QR Code thanh toán"
                                                                    className="h-48 w-48 sm:h-64 sm:w-64 border-2 border-green-200 rounded-xl shadow-lg mb-4"
                                                                />
                                                                <p className="text-center text-sm text-gray-600">
                                                                    Quét mã QR bằng ứng dụng ngân hàng để thanh toán
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </Collapse.Panel>

                                                    <Collapse.Panel
                                                        key="momo"
                                                        header={
                                                            <Radio value="momo" className="w-full flex items-center py-2">
                                                                <MobileOutlined className="text-pink-500 mr-3 text-lg sm:text-xl" />
                                                                <span className="text-sm sm:text-base font-medium">Ví MoMo</span>
                                                            </Radio>
                                                        }
                                                        showArrow={false}
                                                        className="border-b border-gray-100 last:border-b-0"
                                                    >
                                                        <div className="bg-gradient-to-r from-pink-50 to-pink-100 p-4 sm:p-6 border-t border-pink-200">
                                                            <p className="text-gray-700 text-center">
                                                                Quét mã MoMo hoặc chuyển khoản đến số điện thoại:
                                                                <span className="font-mono font-semibold text-pink-600 ml-1">0987654321</span>
                                                            </p>
                                                        </div>
                                                    </Collapse.Panel>

                                                    <Collapse.Panel
                                                        key="card"
                                                        header={
                                                            <Radio value="card" className="w-full flex items-center py-2">
                                                                <CreditCardOutlined className="text-orange-500 mr-3 text-lg sm:text-xl" />
                                                                <span className="text-sm sm:text-base font-medium">Thẻ Visa, Master, JCB</span>
                                                            </Radio>
                                                        }
                                                        showArrow={false}
                                                        className="border-b border-gray-100 last:border-b-0"
                                                    >
                                                        <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 sm:p-6 border-t border-orange-200">
                                                            <p className="text-gray-700 text-center">
                                                                Bạn sẽ được chuyển đến trang thanh toán an toàn sau khi xác nhận.
                                                            </p>
                                                        </div>
                                                    </Collapse.Panel>

                                                    <Collapse.Panel
                                                        key="atm"
                                                        header={
                                                            <Radio value="atm" className="w-full flex items-center py-2">
                                                                <BankOutlined className="text-blue-700 mr-3 text-lg sm:text-xl" />
                                                                <span className="text-sm sm:text-base font-medium">Thẻ ATM (Thẻ nội địa)</span>
                                                            </Radio>
                                                        }
                                                        showArrow={false}
                                                        className="border-b border-gray-100 last:border-b-0"
                                                    >
                                                        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 sm:p-6 border-t border-blue-200">
                                                            <p className="text-gray-700 text-center">
                                                                Bạn sẽ được chuyển đến cổng thanh toán Napas sau khi xác nhận.
                                                            </p>
                                                        </div>
                                                    </Collapse.Panel>
                                                </Collapse>
                                            </Radio.Group>
                                        </div>
                                    </Form.Item>
                                </Card>

                                {/* Thông tin cá nhân */}
                                <Card className="mb-6">
                                    <div className="flex items-center mb-4">
                                        <div><UserOutlined className="text-orange-500 mr-2 text-lg" /></div>
                                        <div className="text-lg sm:text-xl font-semibold text-gray-900">Thông tin cá nhân</div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <Form.Item
                                            name="teamName"
                                            label={<span className="text-sm font-medium text-gray-700">Tên đội bóng</span>}
                                            labelCol={{ span: 24 }}
                                            wrapperCol={{ span: 24 }}
                                            rules={[{ required: true, message: "Vui lòng nhập tên đội bóng!" }]}
                                        >
                                            <Input
                                                size="large"
                                                placeholder="Nhập tên đội bóng"
                                                prefix={<UserOutlined className="text-gray-400" />}
                                                className="border-gray-200 rounded-lg focus:border-orange-500 focus:ring-orange-500"
                                            />
                                        </Form.Item>

                                        <Form.Item
                                            name="phone"
                                            label={<span className="text-sm font-medium text-gray-700">Số điện thoại</span>}
                                            labelCol={{ span: 24 }}
                                            wrapperCol={{ span: 24 }}
                                            rules={[
                                                { required: true, message: "Vui lòng nhập số điện thoại!" },
                                                { pattern: /^[0-9]{10}$/, message: "Số điện thoại không hợp lệ!" }
                                            ]}
                                        >
                                            <Input
                                                size="large"
                                                placeholder="Nhập số điện thoại"
                                                prefix={<PhoneOutlined className="text-gray-400" />}
                                                className="border-gray-200 rounded-lg focus:border-orange-500 focus:ring-orange-500"
                                            />
                                        </Form.Item>
                                    </div>

                                    <Form.Item
                                        name="note"
                                        label={<span className="text-sm font-medium text-gray-700">Ghi chú</span>}
                                        labelCol={{ span: 24 }}
                                        wrapperCol={{ span: 24 }}
                                    >
                                        <Input.TextArea
                                            placeholder="Ghi chú thêm (nếu có)"
                                            rows={3}
                                            className="border-gray-200 rounded-lg focus:border-orange-500 focus:ring-orange-500"
                                        />
                                    </Form.Item>
                                </Card>

                            </Card>
                        </div>

                        {/* Cột bên phải - Tóm tắt và thanh toán */}
                        <div className="lg:col-span-1 order-1 lg:order-2">
                            <Card
                                title={
                                    <div className="flex items-center text-lg sm:text-xl font-bold text-gray-900">
                                        <CheckCircleOutlined className="mr-2 text-orange-500" />
                                        Tóm tắt thanh toán
                                    </div>
                                }
                                className="sticky top-4 shadow-lg border-0"
                            >
                                <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 sm:p-6 rounded-xl border border-gray-200">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-700 font-medium">Giá sân:</span>
                                            <span className="font-semibold text-gray-900">{fieldData?.price?.toLocaleString()} VNĐ</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-700 font-medium">Phí dịch vụ:</span>
                                            <span className="font-semibold text-green-600">0 VNĐ</span>
                                        </div>
                                        <div className="border-t border-gray-300 pt-4 flex justify-between items-center">
                                            <span className="text-lg font-bold text-gray-900">Tổng cộng:</span>
                                            <span className="text-xl font-bold text-orange-600">{fieldData?.price?.toLocaleString()} VNĐ</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        disabled={isSuccess || isFieldBooked}
                                        block
                                        size="large"
                                        className="h-12 sm:h-14 text-base sm:text-lg font-semibold bg-orange-500 hover:bg-orange-600 border-orange-500 rounded-xl shadow-lg"
                                        icon={<CheckCircleOutlined />}
                                    >
                                        Xác nhận thanh toán
                                    </Button>

                                    {isFieldBooked && (
                                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                                            <div className="text-red-600 text-center font-medium text-sm">
                                                ⚠️ Khung giờ này đã có người đặt và đang chờ xác nhận. Vui lòng chọn sân khác.
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-6 space-y-3">
                                    <div className="flex items-center text-sm text-gray-600 bg-green-50 p-3 rounded-lg border border-green-200">
                                        <LockOutlined className="mr-2 text-green-600" />
                                        <span>Thanh toán an toàn & bảo mật</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
                                        <InfoCircleOutlined className="mr-2 text-blue-600" />
                                        <span>Bạn không thể hủy sân khi đã đặt</span>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                </Form>

                {/* Modal xác nhận thanh toán */}
                <Modal
                    title={
                        <div className="flex items-center text-orange-500">
                            <ExclamationCircleOutlined className="mr-2 text-lg sm:text-xl" />
                            <span className="text-base sm:text-lg font-semibold">Xác nhận thanh toán</span>
                        </div>
                    }
                    open={confirmModalVisible}
                    onCancel={handleConfirmCancel}
                    footer={[
                        <Button
                            key="back"
                            onClick={handleConfirmCancel}
                            size="large"
                            className="rounded-lg"
                        >
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
                                size="large"
                                className="bg-orange-500 hover:bg-orange-600 border-orange-500 rounded-lg"
                            >
                                Tôi đã chuyển khoản
                            </Button>
                        ),
                    ]}
                    centered
                    width="90%"
                    style={{ maxWidth: 600 }}
                    className="payment-modal"
                >
                    <div className="py-2 sm:py-4">
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
                            <div className="p-4">
                                <p className="mb-4 text-center text-gray-700">
                                    Vui lòng thực hiện chuyển khoản với thông tin sau:
                                </p>
                                {/* Thông tin chuyển khoản sẽ được hiển thị ở đây */}
                            </div>
                        )}
                    </div>
                </Modal>
            </div>
        </div>
    );
};

export default BookingPage;
