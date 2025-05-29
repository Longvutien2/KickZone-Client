'use client';
import React, { useEffect, useState } from "react";
import { Table, Button, Input, Space, Badge, Modal, Popconfirm, Form, Tabs, Card, Tag, Divider, Typography, Descriptions } from "antd";
import { EyeOutlined, EditOutlined, DeleteOutlined, SearchOutlined, CalendarOutlined, ClearOutlined } from "@ant-design/icons";
import { Field, TimeSlot } from "@/models/field";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { getListOrdersSlice } from "@/features/order.slice";
import { Order } from "@/models/payment";
import { ColumnsType } from "antd/es/table";
import { FootballField } from "@/models/football_field";
import { performOrderCleanup } from "@/utils/orderCleanup";
import { toast } from 'react-toastify';

const statusMap: Record<string, { text: string, status: string }> = {
    'pending': { text: 'pending', status: 'processing' },
    'success': { text: 'success', status: 'success' },
    'failed': { text: 'failed', status: 'error' },
};
const { Text, Title } = Typography;


const ListOrder = () => {
    const orders = useAppSelector(state => state.order.value);
    const footballField = useAppSelector(state => state.footballField.detail) as FootballField;
    const [searchText, setSearchText] = useState("");
    const [sortedOrders, setSortedOrders] = useState<Order[]>([]);
    const dispath = useAppDispatch();
    const [showModal, setShowModal] = useState(false);
    const [form] = Form.useForm();
    const [editingTimeSlot, setEditingTimeSlot] = useState<TimeSlot | null>(null);
    const [uniqueTimeSlots, setUniqueTimeSlots] = useState<string[]>([]);
    const [uniqueFields, setUniqueFields] = useState<string[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    // Hàm xử lý khi click vào biểu tượng mắt
    const handleViewOrderDetail = (record: Order) => {
        setSelectedOrder(record);
        setIsModalVisible(true);
    };

    // Hàm đóng modal
    const handleCloseModal = () => {
        setIsModalVisible(false);
    };

    // Hàm xử lý cleanup orders pending
    const handleCleanupPendingOrders = async () => {
        try {
            const result = await performOrderCleanup();
            toast.success(`Đã xóa ${result.deletedCount} orders pending cũ!`);
            // Refresh lại danh sách orders
            await dispath(getListOrdersSlice());
        } catch (error) {
            console.error("Lỗi khi cleanup orders:", error);
            toast.error("Có lỗi xảy ra khi cleanup orders!");
        }
    };

    // Sắp xếp orders theo thời gian tạo, mới nhất lên đầu
    useEffect(() => {
        if (orders && orders.length > 0) {
            // Tạo bản sao của mảng orders để không ảnh hưởng đến state gốc
            const ordersClone = [...orders];

            // Sắp xếp theo thời gian tạo (createdAt), mới nhất lên đầu
            const sorted = ordersClone.sort((a: Order, b: Order) => {
                // Nếu có trường createdAt, sử dụng nó để sắp xếp
                if (a.createdAt && b.createdAt) {
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                }
                // Nếu có trường transactionDate, sử dụng nó để sắp xếp
                else if (a.transactionDate && b.transactionDate) {
                    return new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime();
                }
                // Nếu không có cả hai trường, giữ nguyên thứ tự
                return 0;
            });

            setSortedOrders(sorted);

            // Lấy danh sách các ca giờ duy nhất
            const timeSlots = sorted
                .map((order: Order) => order.timeStart)
                .filter((timeStart): timeStart is string => !!timeStart) // Lọc bỏ undefined/null
                .filter((value, index, self) => self.indexOf(value) === index) // Lọc bỏ trùng lặp
                .sort(); // Sắp xếp theo thứ tự

            setUniqueTimeSlots(timeSlots);

            // Lấy danh sách các sân số duy nhất
            const fields = sorted
                .map((order: Order) => order.fieldName)
                .filter((fieldName): fieldName is string => !!fieldName) // Lọc bỏ undefined/null
                .filter((value, index, self) => self.indexOf(value) === index) // Lọc bỏ trùng lặp
                .sort(); // Sắp xếp theo thứ tự

            setUniqueFields(fields);
        } else {
            setSortedOrders([]);
            setUniqueTimeSlots([]);
            setUniqueFields([]);
        }
    }, [orders]);

    useEffect(() => {
        const getData = async () => {
            await dispath(getListOrdersSlice());
        }
        getData()
    }, [editingTimeSlot]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'success':
                return 'green';
            case 'pending':
                return 'orange';
            case 'failed':
                return 'red';
            default:
                return 'blue';
        }
    };

    const columns: ColumnsType<Order> = [
        {
            title: '#',
            key: 'index',
            render: (_: any, __: any, index: number) => index + 1,
        },
        {
            title: "Mã đơn hàng",
            dataIndex: "sepayId",
            key: "sepayId",
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                    <Input
                        placeholder="Tìm mã đơn hàng"
                        value={selectedKeys[0]}
                        onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                        onPressEnter={() => confirm()}
                        style={{ width: 188, marginBottom: 8, display: 'block' }}
                    />
                    <Space>
                        <Button type="primary" onClick={() => confirm()} size="small" style={{ width: 90 }}>Lọc</Button>
                        <Button onClick={() => clearFilters?.()} size="small" style={{ width: 90 }}>Xóa</Button>
                    </Space>
                </div>
            ),
            onFilter: (value, record) => record.sepayId?.toLowerCase().includes(value.toString().toLowerCase()) || false,
            filterIcon: (filtered) => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
        },
        {
            title: "Sân số",
            dataIndex: "fieldName",
            key: "fieldName",
            filters: uniqueFields.map(fieldName => ({ text: fieldName, value: fieldName })),
            onFilter: (value, record) => record.fieldName === value,
        },
        {
            title: "Ca giờ",
            dataIndex: "timeStart",
            key: "timeStart",
            filters: uniqueTimeSlots.map(timeSlot => ({ text: timeSlot, value: timeSlot })),
            onFilter: (value, record) => record.timeStart === value,
        },
        {
            title: "Ngày đặt",
            dataIndex: "transactionDate",
            key: "transactionDate",
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                    <Input
                        placeholder="Tìm theo ngày (DD-MM-YYYY)"
                        value={selectedKeys[0]}
                        onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                        onPressEnter={() => confirm()}
                        style={{ width: 188, marginBottom: 8, display: 'block' }}
                    />
                    <Space>
                        <Button type="primary" onClick={() => confirm()} size="small" style={{ width: 90 }}>Lọc</Button>
                        <Button onClick={() => clearFilters?.()} size="small" style={{ width: 90 }}>Xóa</Button>
                    </Space>
                </div>
            ),
            onFilter: (value, record) => record.transactionDate?.includes(value.toString()) || false,
            filterIcon: (filtered) => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
        },
        {
            title: "Giá tiền",
            dataIndex: "amount",
            key: "amount",
            render: (value: number) => value ? `${value.toLocaleString('vi-VN')} VNĐ` : "N/A",
            sorter: (a, b) => (a.amount || 0) - (b.amount || 0),
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                    <Input
                        placeholder="Tìm theo giá tiền"
                        value={selectedKeys[0]}
                        onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                        onPressEnter={() => confirm()}
                        style={{ width: 188, marginBottom: 8, display: 'block' }}
                    />
                    <Space>
                        <Button type="primary" onClick={() => confirm()} size="small" style={{ width: 90 }}>Lọc</Button>
                        <Button onClick={() => clearFilters?.()} size="small" style={{ width: 90 }}>Xóa</Button>
                    </Space>
                </div>
            ),
            onFilter: (value, record) => record.amount?.toString().includes(value.toString()) || false,
            filterIcon: (filtered) => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
        },
        {
            title: "Số tài khoản",
            dataIndex: "accountNumber",
            key: "accountNumber"
        },
        {
            title: "Ngân hàng",
            dataIndex: "gateway",
            key: "gateway",
            filters: [
                // { text: 'VietinBank', value: 'VietinBank' },
                // { text: 'Vietcombank', value: 'Vietcombank' },
                // { text: 'BIDV', value: 'BIDV' },
                // { text: 'Agribank', value: 'Agribank' },
                // { text: 'TPBank', value: 'TPBank' },
                { text: 'MBBank', value: 'MBBank' },
            ],
            onFilter: (value, record) => record.gateway === value,
        },
        {
            title: "Nội dung giao dịch",
            dataIndex: "content",
            key: "content"
        },
        {
            title: 'Trạng thái',
            dataIndex: 'paymentStatus',
            key: 'paymentStatus',
            render: (status: string) => {
                const badge = statusMap[status];
                return <Tag color={badge?.status || 'default'}>
                    {badge?.text || status}
                </Tag>
            },
            filters: [
                { text: 'Thành công', value: 'success' },
                { text: 'Đang xử lý', value: 'pending' },
                { text: 'Thất bại', value: 'failed' },
            ],
            onFilter: (value, record) => record.paymentStatus === value,
        },
        {
            title: "Hành động",
            key: "action",
            render: (_: string, record: Order) => (
                <Space className="flex justify-center">
                    <Button type="primary" icon={<EyeOutlined />} onClick={() => handleViewOrderDetail(record)} />
                    {/* <Popconfirm
                        title="Bạn có chắc muốn xóa?"
                        description="Hành động này không thể hoàn tác."
                        // onConfirm={() => handleDelete(record._id)}
                        okText="Xác nhận"
                        cancelText="Hủy"
                    >
                        <Button type="primary" danger icon={<DeleteOutlined />} />
                    </Popconfirm> */}
                </Space>
            ),
        },
    ];



    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-xl font-semibold">Quản lý đơn hàng</h1>
                    <Popconfirm
                        title="Xóa orders pending cũ"
                        description="Bạn có chắc muốn xóa tất cả orders pending quá 10 phút?"
                        onConfirm={handleCleanupPendingOrders}
                        okText="Xác nhận"
                        cancelText="Hủy"
                    >
                        <Button
                            type="primary"
                            danger
                            icon={<ClearOutlined />}
                            className="flex items-center"
                        >
                            Cleanup Orders Pending
                        </Button>
                    </Popconfirm>
                </div>
                <div>
                    <div className="text-left mt-8">
                        {/* <div className="flex justify-between mb-4 ">
                            <Input
                                placeholder="Tìm kiếm..."
                                onChange={(e) => setSearchText(e.target.value)}
                                className="w-64"
                            />
                        </div> */}
                        <Table
                            className="border border-gray-200"
                            columns={columns}
                            dataSource={sortedOrders}
                            pagination={{ pageSize: 10 }}
                        />
                    </div>
                </div>
            </div>
            {/* Modal chi tiết đơn hàng */}
            <Modal
                title={
                    <div className="flex items-center">
                        <CalendarOutlined className="mr-2 text-blue-500" />
                        <span className="text-lg font-semibold">Chi tiết đặt sân</span>
                    </div>
                }
                open={isModalVisible}
                onCancel={handleCloseModal}
                footer={[
                    <Button key="close" onClick={handleCloseModal}>
                        Đóng
                    </Button>
                ]}
                width={700}
            >
                {selectedOrder && (
                    <div className="py-4">
                        <Card className="mb-4 bg-gray-50">
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center">
                                    <CalendarOutlined className="text-blue-500 mr-2" />
                                    <Text strong className="text-lg">{selectedOrder.date} - {selectedOrder.timeStart}</Text>
                                </div>
                                <Tag color={getStatusColor(selectedOrder.paymentStatus || "pending")} className="text-sm px-3 py-1">
                                    {selectedOrder.paymentStatus === 'success' ? 'Đã thanh toán' :
                                        selectedOrder.paymentStatus === 'pending' ? 'Chờ thanh toán' : 'Thất bại'}
                                </Tag>
                            </div>

                            <Descriptions bordered column={1} size="small">
                                <Descriptions.Item label="Mã đơn hàng">{selectedOrder.sepayId || selectedOrder._id}</Descriptions.Item>
                                <Descriptions.Item label="Tên sân bóng">{footballField.name || "Không có thông tin"}</Descriptions.Item>
                                <Descriptions.Item label="Số sân">{selectedOrder.fieldName || "Không có thông tin"}</Descriptions.Item>
                                <Descriptions.Item label="Ngày đặt">{selectedOrder.date}</Descriptions.Item>
                                <Descriptions.Item label="Giờ bắt đầu">{selectedOrder.timeStart}</Descriptions.Item>
                                {/* <Descriptions.Item label="Thời lượng">
                                    {calculateDuration(selectedOrder.timeStart)} phút
                                </Descriptions.Item> */}
                                <Descriptions.Item label="Số điện thoại">{footballField.phone || ""}</Descriptions.Item>
                            </Descriptions>
                        </Card>

                        <Divider orientation="left">Thông tin thanh toán</Divider>
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <div className="flex justify-between mb-2">
                                <Text>Tên đội:</Text>
                                <Text strong>{selectedOrder.teamName || ""}</Text>
                            </div>
                            <div className="flex justify-between mb-2">
                                <Text>Liên hệ:</Text>
                                <Text strong>{selectedOrder.phoneNumber || ""}</Text>
                            </div>
                            <div className="flex justify-between mb-2">
                                <Text>Phương thức thanh toán:</Text>
                                <Text strong>{selectedOrder.paymentMethod || "Thanh toán online"}</Text>
                            </div>
                            <div className="flex justify-between mb-2">
                                <Text>Ghi chú:</Text>
                                <Text strong>{selectedOrder.description || "Không có ghi chú"}</Text>
                            </div>
                            <div className="flex justify-between mb-2">
                                <Text>Thời gian thanh toán:</Text>
                                <Text strong>{selectedOrder.transactionDate || "Không có thông tin"}</Text>
                            </div>
                            <div className="flex justify-between mb-2">
                                <Text>Trạng thái:</Text>
                                <Tag color={getStatusColor(selectedOrder.paymentStatus || "pending")}>
                                    {selectedOrder.paymentStatus === 'success' ? 'Đã thanh toán' :
                                        selectedOrder.paymentStatus === 'pending' ? 'Chờ thanh toán' : 'Thất bại'}
                                </Tag>
                            </div>
                            <Divider className="my-2" />
                            <div className="flex justify-between">
                                <Text strong>Tổng tiền:</Text>
                                <Text strong className="text-xl text-red-500">{selectedOrder.amount?.toLocaleString()} VNĐ</Text>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default ListOrder;
