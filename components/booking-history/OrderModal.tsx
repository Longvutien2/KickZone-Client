import { Modal, Button, Card, Tag, Typography, Descriptions, Divider } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import { Order, PaymentStatus } from '@/models/payment';
import { FootballField } from '@/models/football_field';

const { Text } = Typography;

interface OrderModalProps {
    isVisible: boolean;
    selectedOrder: Order | null;
    footballField: FootballField;
    onClose: () => void;
    getStatusColor: (status: PaymentStatus) => string;
    calculateDuration: (timeString: string) => number;
}

const OrderModal = ({ 
    isVisible, 
    selectedOrder, 
    footballField, 
    onClose, 
    getStatusColor, 
    calculateDuration 
}: OrderModalProps) => {
    if (!selectedOrder) return null;

    return (
        <Modal
            title={
                <div className="flex items-center">
                    <CalendarOutlined className="mr-2 text-blue-500" />
                    <span className="text-base sm:text-lg font-semibold">Chi tiết đặt sân</span>
                </div>
            }
            open={isVisible}
            onCancel={onClose}
            footer={[
                <Button key="close" onClick={onClose} className="w-full sm:w-auto">
                    Đóng
                </Button>
            ]}
            width="90%"
            style={{ maxWidth: 700 }}
            centered
        >
            <div className="py-2 sm:py-4 px-1 sm:px-0">
                <Card className="mb-4 bg-gray-50 mx-0">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
                        <div className="flex items-center">
                            <CalendarOutlined className="text-blue-500 mr-2 flex-shrink-0" />
                            <Text strong className="text-base sm:text-lg break-words">
                                {selectedOrder.date} - {selectedOrder.timeStart}
                            </Text>
                        </div>
                        <Tag
                            color={getStatusColor(selectedOrder.paymentStatus || 'pending')}
                            className="text-xs sm:text-sm px-2 sm:px-3 py-1 self-start sm:self-center"
                        >
                            {selectedOrder.paymentStatus === 'success' ? 'Đã thanh toán' :
                                selectedOrder.paymentStatus === 'pending' ? 'Chờ thanh toán' : 'Thất bại'}
                        </Tag>
                    </div>

                    <Descriptions
                        bordered
                        column={1}
                        size="small"
                        labelStyle={{
                            width: '35%',
                            fontSize: '14px',
                            padding: '8px 12px'
                        }}
                        contentStyle={{
                            fontSize: '14px',
                            padding: '8px 12px'
                        }}
                    >
                        <Descriptions.Item label="Mã đơn hàng">
                            <span className="break-all text-xs sm:text-sm">
                                {selectedOrder.sepayId || selectedOrder._id}
                            </span>
                        </Descriptions.Item>
                        <Descriptions.Item label="Tên sân bóng">
                            {footballField.name || "Không có thông tin"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Số sân">
                            {selectedOrder.fieldName || "Không có thông tin"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày đặt">
                            {selectedOrder.date}
                        </Descriptions.Item>
                        <Descriptions.Item label="Giờ bắt đầu">
                            {selectedOrder.timeStart}
                        </Descriptions.Item>
                        <Descriptions.Item label="Thời lượng">
                            {calculateDuration(selectedOrder.timeStart || '')} phút
                        </Descriptions.Item>
                        <Descriptions.Item label="Số điện thoại">
                            {footballField.phone || ""}
                        </Descriptions.Item>
                    </Descriptions>
                </Card>

                <Divider orientation="left" className="text-sm sm:text-base">
                    Thông tin thanh toán
                </Divider>
                
                <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 mx-0">
                    <div className="flex flex-col sm:flex-row sm:justify-between mb-3 gap-1 sm:gap-0">
                        <Text className="text-sm sm:text-base">Tên đội:</Text>
                        <Text strong className="text-sm sm:text-base break-words">
                            {selectedOrder.teamName || ""}
                        </Text>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between mb-3 gap-1 sm:gap-0">
                        <Text className="text-sm sm:text-base">Liên hệ:</Text>
                        <Text strong className="text-sm sm:text-base break-words">
                            {selectedOrder.phoneNumber || ""}
                        </Text>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between mb-3 gap-1 sm:gap-0">
                        <Text className="text-sm sm:text-base">Phương thức thanh toán:</Text>
                        <Text strong className="text-sm sm:text-base">
                            {selectedOrder.paymentMethod || "Thanh toán online"}
                        </Text>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between mb-3 gap-1 sm:gap-0">
                        <Text className="text-sm sm:text-base">Ghi chú:</Text>
                        <Text strong className="text-sm sm:text-base break-words text-right sm:text-left">
                            {selectedOrder.description || "Không có ghi chú"}
                        </Text>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between mb-3 gap-1 sm:gap-0">
                        <Text className="text-sm sm:text-base">Thời gian thanh toán:</Text>
                        <Text strong className="text-xs sm:text-sm break-words">
                            {selectedOrder.transactionDate || "Không có thông tin"}
                        </Text>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between mb-3 gap-1 sm:gap-0">
                        <Text className="text-sm sm:text-base">Trạng thái:</Text>
                        <Tag color={getStatusColor(selectedOrder.paymentStatus || 'pending')} className="self-start sm:self-center">
                            {selectedOrder.paymentStatus === 'success' ? 'Đã thanh toán' :
                                selectedOrder.paymentStatus === 'pending' ? 'Chờ thanh toán' : 'Thất bại'}
                        </Tag>
                    </div>
                    <Divider className="my-3" />
                    <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-2 sm:gap-0">
                        <Text strong className="text-base sm:text-lg">Tổng tiền:</Text>
                        <Text strong className="text-lg sm:text-xl text-red-500">
                            {selectedOrder.amount?.toLocaleString()} VNĐ
                        </Text>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default OrderModal;
