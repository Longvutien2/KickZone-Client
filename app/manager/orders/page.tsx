'use client';
import React, { useEffect, useState } from "react";
import { Table, Button, Input, Space, Badge, Modal, Popconfirm, Form, Tabs, Card, Tag } from "antd";
import { EyeOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { Field, TimeSlot } from "@/models/field";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { addTimeSlotSlice, getListTimeSlotsByFootballFieldId, removeTimeSlot, removeTimeSlotByFieldId, updateTimeSlotSlice } from "@/features/timeSlot.slice";
import { getListOrdersSlice } from "@/features/order.slice";
import { Order } from "@/models/payment";

const statusMap: Record<string, { text: string, status: string }> = {
    'pending': { text: 'pending', status: 'processing' },
    'success': { text: 'success', status: 'success' },
    'failed': { text: 'failed', status: 'error' },
};

const ListOrder = () => {
    const orders = useAppSelector(state => state.order.value);
    const [searchText, setSearchText] = useState("");
    const [sortedOrders, setSortedOrders] = useState<Order[]>([]);
    const dispath = useAppDispatch();
    const [showModal, setShowModal] = useState(false);
    const [form] = Form.useForm();
    const [editingTimeSlot, setEditingTimeSlot] = useState<TimeSlot | null>(null);

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
        } else {
            setSortedOrders([]);
        }
    }, [orders]);

    // Lọc orders theo từ khóa tìm kiếm
    // const filteredOrders = sortedOrders.filter((order: Order) => {
    //     const searchLower = searchText.toLowerCase();
    //     return (
    //         (order.sepayId?.toLowerCase().includes(searchLower) || '') ||
    //         (order.fieldName?.toLowerCase().includes(searchLower) || '') ||
    //         (order.timeStart?.toLowerCase().includes(searchLower) || '') ||
    //         (order.content?.toLowerCase().includes(searchLower) || '') ||
    //         (order.paymentStatus?.toLowerCase().includes(searchLower) || '')
    //     );
    // });

    // delete timeSLot
    const handleDelete = (id: string) => {
        dispath(removeTimeSlot(id));
        toast.success("Xóa thành công!");
    };

    useEffect(() => {
        const getData = async () => {
            await dispath(getListOrdersSlice());
        }
        getData()
    }, [editingTimeSlot]);

    const columns = [
        {
            title: '#',
            key: 'index',
            render: (_: any, __: any, index: number) => index + 1,
        },
        { title: "Mã đơn hàng", dataIndex: "sepayId", key: "sepayId" },
        { title: "Sân số", dataIndex: "fieldName", key: "fieldName" },
        { title: "Ca giờ", dataIndex: "timeStart", key: "timeStart" },
        { title: "Ngày đặt", dataIndex: "transactionDate", key: "transactionDate" },
        {
            title: "Giá tiền",
            dataIndex: "amount",
            key: "amount",
            render: (value: number) => value ? `${value.toLocaleString()} VNĐ` : "N/A",
        },
        { title: "Số tài khoản", dataIndex: "accountNumber", key: "accountNumber" },
        { title: "Ngân hàng", dataIndex: "gateway", key: "gateway" },
        { title: "Nội dung giao dịch", dataIndex: "content", key: "content" },
        // {
        //     title: "Trạng thái",
        //     dataIndex: "paymentStatus",
        //     key: "paymentStatus",
        //     render: (status: string) => (
        //         <Badge status="success" text={status} />
        //     ),
        // },

        {
            title: 'Trạng thái',
            dataIndex: 'paymentStatus',
            key: 'paymentStatus',
            render: (status: string) => {
                const badge = statusMap[status];
                return <Tag color={badge.status}>
                    {badge.text}
                </Tag>
            },
        },
        {
            title: "Hành động",
            key: "action",
            render: (_: string, record: Order) => (
                <Space>
                    {/* <Link href={`/manager/orders/${record._id}`}>  */}
                    <Button type="primary" icon={<EyeOutlined />} />
                    {/* </Link> */}
                    <Popconfirm
                        title="Bạn có chắc muốn xóa?"
                        description="Hành động này không thể hoàn tác."
                        // onConfirm={() => handleDelete(record._id)}
                        okText="Xác nhận"
                        cancelText="Hủy"
                    >
                        <Button type="primary" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];



    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <div className="bg-white p-6 rounded-lg shadow">
                <h1 className="text-xl font-semibold mb-4">Quản lý đơn hàng</h1>
                <div>
                    <div className="text-left mt-8">
                        <div className="flex justify-between mb-4 ">
                            <Input
                                placeholder="Tìm kiếm..."
                                onChange={(e) => setSearchText(e.target.value)}
                                className="w-64"
                            />
                        </div>
                        <Table
                            className="border border-gray-200"
                            columns={columns}
                            dataSource={sortedOrders}
                            pagination={{ pageSize: 10 }}
                        />
                    </div>
                </div>
            </div>


        </div>
    );
};

export default ListOrder;
