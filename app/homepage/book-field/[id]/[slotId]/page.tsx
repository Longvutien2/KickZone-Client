'use client';
import { useEffect, useState } from "react";
import { Button, Input, Radio, Card, Form, Collapse, Alert } from 'antd';
import { useDispatch } from "react-redux";
import dynamic from 'next/dynamic';
import { Field, TimeSlot } from "@/models/field";
import { FootballField } from "@/models/football_field";
import { AppDispatch } from "@/store/store";
import { useParams, useSearchParams } from "next/navigation";
import { addBreadcrumb } from "@/features/breadcrumb.slice";
import { useAppSelector } from "@/store/hook";
import { BankOutlined, CheckCircleOutlined, CreditCardOutlined, InfoCircleOutlined, LockOutlined, MailOutlined, MobileOutlined, PhoneOutlined, QrcodeOutlined, UserOutlined, ExclamationCircleOutlined, CopyOutlined } from "@ant-design/icons";
import { toast } from 'react-toastify';
import { createOrder, getListOrders, getOrdersByUserId, updatePendingOrder } from "@/api/payment";
import { useOrderCleanup } from "@/utils/orderCleanup";
import { Order, PaymentStatus } from "@/models/payment";
import { checkOrderExists } from "@/utils/orderUtils";

// Dynamic imports - chỉ load khi cần thiết
const PaymentQR = dynamic(() => import("@/components/Payment"), {
    loading: () => (
        <div className="flex items-center justify-center p-8">
            <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-2"></div>
                <p className="text-gray-600">Đang tải thanh toán...</p>
            </div>
        </div>
    ),
    ssr: false
});

// Dynamic import cho Success Result - chỉ load khi booking thành công
const SuccessResult = dynamic(() => import("antd").then(mod => ({ default: mod.Result })), {
    loading: () => (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Đang tải kết quả...</p>
            </div>
        </div>
    ),
    ssr: false
});

// Dynamic import cho QR Code Image - chỉ load khi user chọn QR payment
const QRCodeImage = dynamic(() => Promise.resolve(({ src, alt, className }: { src: string; alt: string; className: string }) => (
    <img src={src} alt={alt} className={className} />
)), {
    loading: () => (
        <div className="h-48 w-48 sm:h-64 sm:w-64 border-2 border-green-200 rounded-xl shadow-lg mb-4 flex items-center justify-center bg-gray-100">
            <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-2"></div>
                <p className="text-gray-600 text-sm">Đang tạo mã QR...</p>
            </div>
        </div>
    ),
    ssr: false
});

// Dynamic import cho Payment Modal - chỉ load khi user click "Xác nhận thanh toán"
const PaymentModal = dynamic(() => import("antd").then(mod => ({ default: mod.Modal })), {
    loading: () => null, // Không hiển thị loading cho modal
    ssr: false
});

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
    const field = useAppSelector((state) => state.field.value)
    const timeSlot = useAppSelector((state) => state.timeSlot.value)

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

    // Thêm state để kiểm tra sân đã được đặt chưa
    const [isFieldBooked, setIsFieldBooked] = useState(false);


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
    const generateQRCode = (phoneNumber?: string) => {
        if (fieldData) {
            const amount = fieldData.price;
            const phone = phoneNumber || formValues?.phone || '';
            const description = `${fieldData.field} ${fieldData.date} ${fieldData.timeStart} ${phone}`; // Nội dung chuyển khoản

            const orderId = `${Date.now()}`;
            // Tạo URL VietQR
            const vietQrUrl = `https://qr.sepay.vn/img?acc=29777777729&bank=MBBank&amount=${amount}&des=DH${description}`;
            setOrderId(orderId);
            setQrContent(vietQrUrl);
        }
    };

    const showConfirmModal = async (values: Information) => {
        // Kiểm tra sân có bị đặt trước không
        if (fieldData) {
            const canProceed = await checkOrderExists(fieldData.field, fieldData.date, fieldData.timeStart);
            if (canProceed === false) {
                setIsFieldBooked(true);
                toast.error("Khung giờ này đã có người đặt và thanh toán thành công!");
                return; // Dừng lại nếu sân đã được đặt
            } else {
                setIsFieldBooked(false);
            }
        }

        setFormValues(values);

        // 🚀 Generate QR code sau khi có phone number từ form
        if (selectedPayment === "qr") {
            generateQRCode(values.phone); // Tạo QR với phone number từ form
        }

        // Nếu chọn thanh toán QR hoặc Banking, kiểm tra và tạo/cập nhật đơn hàng
        if ((selectedPayment === "qr" || selectedPayment === "banking") && user.value.user._id && fieldData) {
            // Generate orderId if not exists
            const currentOrderId = orderId || `${Date.now()}`;
            if (!orderId) {
                setOrderId(currentOrderId);
            }
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
                            content: `${fieldData.field} ${fieldData.date} ${fieldData.timeStart} ${values.phone}`,
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
                    const orderData = {
                        sepayId: currentOrderId,
                        userId: user.value.user._id,
                        teamName: values.teamName,
                        phoneNumber: values.phone,
                        description: values.note,
                        fieldName: fieldData.field,
                        timeStart: fieldData.timeStart,
                        date: fieldData.date,
                        gateway: "MBBank", // Cả banking và QR đều dùng MBBank
                        accountNumber: "29777777729",
                        amount: fieldData.price as number,
                        content: `${fieldData.field} ${fieldData.date} ${fieldData.timeStart} ${values.phone}`,
                        paymentStatus: "pending" as PaymentStatus,
                    };
                    const { data } = await createOrder(orderData);
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

    useEffect(() => {
        if (id && slotId) {
            const getData = async () => {
                try {
                    const fieldResponse = field.find((field:Field) => field._id === id) as any;
                    const timeslotResponse = timeSlot.find((timeSlot:TimeSlot) => timeSlot._id === slotId) as any;

                    if (fieldResponse && timeslotResponse) {
                        const mockData = {
                            date: date as string,
                            fieldName: fieldResponse.foolballFieldId?.name,
                            address: `${fieldResponse.foolballFieldId?.address.detail ? `${fieldResponse.foolballFieldId.address.detail}, ` : ""} ${fieldResponse.foolballFieldId.address.ward}, ${fieldResponse.foolballFieldId.address.district}, ${fieldResponse.foolballFieldId.address.province}`,
                            field: fieldResponse.name,
                            timeStart: timeslotResponse.time,
                            price: Number(timeslotResponse.price),
                            footballField: fieldResponse.foolballFieldId._id
                        };
                        setFieldData(mockData);
                    }


                    dispatch(addBreadcrumb({ name: "Thanh toán", url: `/homepage/book-field/${id}/${slotId}` }));
                } catch (error) {
                    console.error("Error loading field data:", error);
                    toast.error("Không thể tải thông tin sân. Vui lòng thử lại!");
                }
            }
            getData();
        }
    }, [id, slotId]);

    // Nếu đã đặt sân thành công, hiển thị trang kết quả
    if (isSuccess && formValues) {
        return (
            <div className="container mx-auto py-6 px-4">
                <SuccessResult
                    status="success"
                    title="Đặt sân thành công!"
                    subTitle="Bạn đã đặt sân thành công. Vui lòng chờ chủ sân xác nhận."
                    className="text-left"
                    extra={[
                        <div key="booking-details" className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6 max-w-full">
                            <div className="flex items-center mb-4">
                                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                                <h3 className="text-lg font-semibold text-green-800">Chúc mừng bạn đã đặt sân thành công tại Sân bóng KickZone.</h3>
                            </div>

                            {/* Thông tin đặt sân */}
                            <div className="bg-white rounded-lg p-4 mb-4 border border-green-100">
                                <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                                    Thông tin đặt sân
                                </h4>
                                <div className="text-left grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                    <div className="flex">
                                        <span className="font-medium text-gray-600 w-20 flex-shrink-0">Tên sân:</span>
                                        <span className="text-gray-800">{fieldData?.fieldName}</span>
                                    </div>
                                    <div className="flex">
                                        <span className="font-medium text-gray-600 w-20 flex-shrink-0">Thời gian:</span>
                                        <span className="text-gray-800 font-bold">{fieldData?.timeStart} , {fieldData?.date}</span>
                                    </div>
                                    <div className="flex">
                                        <span className="font-medium text-gray-600 w-20 flex-shrink-0">Sân số:</span>
                                        <span className="text-blue-600 font-semibold">{fieldData?.field}</span>
                                    </div>
                                    <div className="flex">
                                        <span className="font-medium text-gray-600 w-20 flex-shrink-0">Thanh toán:</span>
                                        <span className="text-gray-800">MBBank</span>
                                    </div>
                                    <div className="flex md:col-span-2">
                                        <span className="font-medium text-gray-600 w-20 flex-shrink-0">Địa chỉ:</span>
                                        <span className="text-gray-800">210 lê trọng tấn, Phường Bạch Đằng, Quận Hai Bà Trưng, Thành phố Hà Nội</span>
                                    </div>
                                    <div className="flex">
                                        <span className="font-medium text-gray-600 w-20 flex-shrink-0">Giá:</span>
                                        <span className="text-red-600 font-bold">{fieldData?.price?.toLocaleString()} VNĐ</span>
                                    </div>
                                    <div className="flex">
                                        <span className="font-medium text-gray-600 w-20 flex-shrink-0">Thời gian đặt:</span>
                                        <span className="text-gray-800">{new Date().toLocaleString('vi-VN')}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Thông tin người đặt */}
                            <div className="bg-white rounded-lg p-4 border border-green-100">
                                <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                                    <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                                    Thông tin người đặt
                                </h4>
                                <div className="text-left grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                    <div className="flex">
                                        <span className="font-medium text-gray-600 w-24 flex-shrink-0">Tên đội:</span>
                                        <span className="text-gray-800 font-semibold">{formValues.teamName}</span>
                                    </div>
                                    <div className="flex">
                                        <span className="font-medium text-gray-600 w-24 flex-shrink-0">Số điện thoại:</span>
                                        <span className="text-gray-800">{formValues.phone}</span>
                                    </div>
                                    {formValues.note && (
                                        <div className="flex md:col-span-2">
                                            <span className="font-medium text-gray-600 w-24 flex-shrink-0">Ghi chú:</span>
                                            <span className="text-gray-800 italic">"{formValues.note}"</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Thông báo quan trọng */}
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
                                <p className="text-sm text-yellow-800 text-center">
                                    <strong>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!</strong>
                                </p>
                            </div>
                        </div>,
                        <Alert
                            key="payment-alert"
                            message="Thanh toán an toàn & bảo mật"
                            description={
                                <div className="space-y-2 mt-2 ">
                                    <p>• Đơn đặt sân của bạn đã được ghi nhận.</p>
                                    <p>• Đơn hàng sẽ được xác nhận tự động sau khi thanh toán thành công.</p>
                                    <p>• Bạn có thể theo dõi trạng thái đặt sân trong mục thông báo.</p>
                                    <p>• Liên hệ hotline nếu cần hỗ trợ: <strong>0966724435</strong></p>
                                </div>
                            }
                            type="info"
                            showIcon
                            className="max-w-full text-left  mb-4"
                        />,
                        <div key="buttons" className="flex justify-start space-x-4">
                            <Button type="primary" href="/homepage/notification">
                                Xem thông báo
                            </Button>
                            <Button href="/homepage/book-field">
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
                                <div className="mb-6">
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
                                                            <div className="space-y-4">
                                                                {/* Thông tin ngân hàng */}
                                                                <div className="bg-white p-4 rounded-lg border border-blue-200 shadow-sm">
                                                                    <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                                                                        <BankOutlined className="mr-2" />
                                                                        Thông tin chuyển khoản
                                                                    </h4>
                                                                    <div className="space-y-3">
                                                                        <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                                                                            <span className="font-medium text-gray-700">Ngân hàng:</span>
                                                                            <span className="text-blue-600 font-semibold">MB Bank</span>
                                                                        </div>
                                                                        <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                                                                            <span className="font-medium text-gray-700">Số tài khoản:</span>
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="font-mono font-semibold text-lg bg-gray-100 px-2 py-1 rounded">29777777729</span>
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                                                                            <span className="font-medium text-gray-700">Chủ tài khoản:</span>
                                                                            <span className="font-semibold">VU TIEN LONG</span>
                                                                        </div>
                                                                        <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                                                                            <span className="font-medium text-gray-700">Số tiền:</span>
                                                                            <span className="font-bold text-xl text-red-600">{fieldData?.price?.toLocaleString()} VNĐ</span>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Hướng dẫn chuyển khoản */}
                                                                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                                                                    <h5 className="font-semibold text-blue-800 mb-2">📋 Hướng dẫn chuyển khoản:</h5>
                                                                    <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                                                                        <li>Mở ứng dụng MBBank hoặc Internet Banking</li>
                                                                        <li>Chọn chuyển khoản đến tài khoản MBBank</li>
                                                                        <li>Nhập số tài khoản: <strong>29777777729</strong></li>
                                                                        <li>Nhập số tiền: <strong>{fieldData?.price?.toLocaleString()} VNĐ</strong></li>
                                                                        <li>Nhập nội dung: <strong>{fieldData?.field} {fieldData?.date} {fieldData?.timeStart}</strong></li>
                                                                        <li>Xác nhận và hoàn tất giao dịch</li>
                                                                    </ol>
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
                                                                {qrContent ? (
                                                                    <QRCodeImage
                                                                        src={qrContent}
                                                                        alt="QR Code thanh toán"
                                                                        className="h-48 w-48 sm:h-64 sm:w-64 border-2 border-green-200 rounded-xl shadow-lg mb-4"
                                                                    />
                                                                ) : (
                                                                    <div className="h-48 w-48 sm:h-64 sm:w-64 border-2 border-dashed border-green-300 rounded-xl flex items-center justify-center mb-4 bg-white">
                                                                        <div className="text-center">
                                                                            <QrcodeOutlined className="text-4xl text-green-400 mb-2" />
                                                                            <p className="text-sm text-gray-500">
                                                                                Nhập thông tin và click<br />
                                                                                "Xác nhận thanh toán"<br />
                                                                                để tạo mã QR
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                <p className="text-center text-sm text-gray-600">
                                                                    {qrContent ?
                                                                        "Quét mã QR bằng ứng dụng ngân hàng để thanh toán" :
                                                                        "Mã QR sẽ được tạo sau khi bạn nhập đầy đủ thông tin"
                                                                    }
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </Collapse.Panel>
                                                </Collapse>
                                            </Radio.Group>
                                        </div>
                                    </Form.Item>
                                </div>

                                {/* Thông tin cá nhân */}
                                <div className="mb-6">
                                    <div className="flex items-center mb-4">
                                        <div><UserOutlined className="text-orange-500 mr-2 text-lg" /></div>
                                        <div className="text-lg sm:text-xl font-semibold text-gray-900">Thông tin cá nhân</div>
                                    </div>
                                    <Card>
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
                                </div>
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
                {confirmModalVisible && (
                    <PaymentModal
                        title={
                            <div className="flex items-center text-orange-500">
                                <ExclamationCircleOutlined className="mr-2 text-lg sm:text-xl" />
                                <span className="text-base sm:text-lg font-semibold">Xác nhận thanh toán</span>
                            </div>
                        }
                        open={confirmModalVisible}
                        onCancel={handleConfirmCancel}
                        footer={[
                            <div></div>
                        ]}
                        centered
                        width="90%"
                        style={{ maxWidth: 600 }}
                        className="payment-modal"
                    >
                        <div className="py-2 sm:py-4">
                            <div className="text-center">
                                <PaymentQR
                                    onSuccess={(success) => {
                                        if (success) {
                                            setIsSuccess(true);
                                        } else {
                                            setIsFieldBooked(true);
                                            setConfirmModalVisible(false);
                                        }
                                    }}
                                    orderId={orderId}
                                    userId={user.value.user._id as string}
                                    qrContent={qrContent}
                                    amount={fieldData?.price as number}
                                    description={`${fieldData?.field} ${fieldData?.date} ${fieldData?.timeStart} ${formValues?.phone}`}
                                    orderCreated={orderCreated}
                                    selectedPayment={selectedPayment}
                                    fieldData={fieldData}
                                    newOrder={newOrder}
                                />
                            </div>
                        </div>
                    </PaymentModal>
                )}
            </div>
        </div>
    );
};

export default BookingPage;
