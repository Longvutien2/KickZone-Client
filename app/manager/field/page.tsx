'use client';
import React, { useEffect, useState } from "react";
import { Table, Button, Input, Space, Badge, Modal, Popconfirm, Form, Tabs, Card, Tag } from "antd";
import { EyeOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from "@ant-design/icons";
import { Field, TimeSlot } from "@/models/field";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import Link from "next/link";
import { RootStateType } from "@/models/type";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { getListFieldsSlice, removeFieldSlice } from "@/features/field.slice";
import { addTimeSlotSlice, getListTimeSlotsByFootballFieldId, removeTimeSlot, removeTimeSlotByFieldId, updateTimeSlotSlice } from "@/features/timeSlot.slice";
import { FootballField } from "@/models/football_field";
import { ColumnsType } from 'antd/es/table';

const statusMap: Record<string, { text: string, status: string }> = {
    'Bảo trì': { text: 'Bảo trì', status: 'warning' },
    'Hoạt động': { text: 'Hoạt động', status: 'success' },
    'failed': { text: 'failed', status: 'error' },
};

const ListField = () => {
    const footballField = useAppSelector((state) => state.footballField.detail) as FootballField
    const timeSLotData = useAppSelector(state => state.timeSlot.value)
    const fieldData = useSelector((state: RootStateType) => state.field.value)
    const [searchText, setSearchText] = useState("");
    const dispath = useAppDispatch();
    const [showModal, setShowModal] = useState(false);
    const [form] = Form.useForm();
    const [editingTimeSlot, setEditingTimeSlot] = useState<TimeSlot | null>(null);
    const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState("1")


    // delete timeSLot
    const handleDelete = (id: string) => {
        dispath(removeTimeSlot(id));
        toast.success("Xóa thành công!");
    };

    const handleDeleteField = (id: string) => {
        dispath(removeFieldSlice(id));
        toast.success("Xóa thành công!");
    };

    useEffect(() => {
        if (!editingTimeSlot) {
            form.resetFields(); // Reset form khi không có TimeSlot
        } else {
            form.setFieldsValue(editingTimeSlot); // Load lại dữ liệu TimeSlot khi sửa
        }
        const getData = async () => {

            await dispath(getListFieldsSlice(footballField._id as string));
            await dispath(getListTimeSlotsByFootballFieldId(footballField._id as string))
        }
        getData()
    }, [editingTimeSlot]);

    const columns: any = [
        {
            title: "#",
            dataIndex: "key",
            key: "key"
        },
        {
            title: "Tên",
            dataIndex: "name",
            key: "name",
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => (
                <div style={{ padding: 8 }}>
                    <Input
                        placeholder="Tìm kiếm tên"
                        value={selectedKeys[0]}
                        onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                        onPressEnter={() => confirm()}
                        style={{ width: 188, marginBottom: 8, display: 'block' }}
                    />
                    <Space>
                        <Button
                            type="primary"
                            onClick={() => confirm()}
                            size="small"
                            style={{ width: 90 }}
                        >
                            Lọc
                        </Button>
                        <Button onClick={() => clearFilters?.()} size="small" style={{ width: 90 }}>
                            Xóa
                        </Button>
                    </Space>
                </div>
            ),
            onFilter: (value: string, record: Field) => record.name.toLowerCase().includes(value.toLowerCase()),
            filterIcon: (filtered: boolean) => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
        },
        {
            title: "Số người",
            dataIndex: "people",
            key: "people",
            filters: [
                { text: '5 người', value: "5v5" },
                { text: '7 người', value: "7v7" },
                { text: '9 người', value: "9v9" },
                { text: '11 người', value: "11v11" },
            ],
            onFilter: (value: number, record: Field) => record.people === value,
            sorter: (a: Field, b: Field) => a.people - b.people,
        },
        {
            title: "Loại mặt sân",
            dataIndex: "surface",
            key: "surface",
            filters: [
                { text: 'Cỏ tự nhiên', value: "Cỏ tự nhiên" },
                { text: 'Cỏ nhân tạo', value: "Cỏ nhân tạo" },
                { text: 'Sân trong nhà', value: "Sân trong nhà" },
            ],
            onFilter: (value: string, record: Field) => record.surface === value,
        },
        {
            title: "Tình trạng",
            dataIndex: "status",
            key: "status",
            render: (status: string) => {
                const badge = statusMap[status];
                return <Tag color={badge?.status || 'default'}>
                    {badge?.text || status}
                </Tag>
            },
            filters: [
                { text: 'Hoạt động', value: 'Hoạt động' },
                { text: 'Bảo trì', value: 'Bảo trì' },
            ],
            onFilter: (value: string, record: Field) => record.status === value,
        },
        {
            title: "Hành động",
            key: "action",
            render: (_: string, record: Field) => (
                <Space>
                    <Link href={`/manager/field/${record._id}`}> <Button type="primary" icon={<EditOutlined />} /></Link>
                    <Popconfirm
                        title="Bạn có chắc muốn xóa?"
                        description="Hành động này không thể hoàn tác."
                        onConfirm={() => handleDeleteField(record._id)}
                        okText="Xác nhận"
                        cancelText="Hủy"
                    >
                        <Button type="primary" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];
    console.log("footballFieldfootballField", footballField);

    const subColumns: ColumnsType<TimeSlot> = [
        {
            title: "Khung giờ",
            dataIndex: "time",
            key: "time",
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                    <Input
                        placeholder="Tìm kiếm ca giờ"
                        value={selectedKeys[0]}
                        onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                        onPressEnter={() => confirm()}
                        style={{ width: 188, marginBottom: 8, display: 'block' }}
                    />
                    <Space>
                        <Button
                            type="primary"
                            onClick={() => confirm()}
                            size="small"
                            style={{ width: 90 }}
                        >
                            Lọc
                        </Button>
                        <Button onClick={() => clearFilters?.()} size="small" style={{ width: 90 }}>
                            Xóa
                        </Button>
                    </Space>
                </div>
            ),
            onFilter: (value, record) => record.time.toLowerCase().includes(value.toString().toLowerCase()),
            filterIcon: (filtered) => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
        },
        {
            title: "Giá tiền",
            dataIndex: "price",
            key: "price",
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                    <Input
                        placeholder="Tìm kiếm giá tiền"
                        value={selectedKeys[0]}
                        onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                        onPressEnter={() => confirm()}
                        style={{ width: 188, marginBottom: 8, display: 'block' }}
                    />
                    <Space>
                        <Button
                            type="primary"
                            onClick={() => confirm()}
                            size="small"
                            style={{ width: 90 }}
                        >
                            Lọc
                        </Button>
                        <Button onClick={() => clearFilters?.()} size="small" style={{ width: 90 }}>
                            Xóa
                        </Button>
                    </Space>
                </div>
            ),
            onFilter: (value, record) => record.price.toString().includes(value.toString()),
            filterIcon: (filtered) => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
            sorter: (a: any, b: any) => a.price - b.price,
            render: (price) => {
                return `${Number(price).toLocaleString('vi-VN')} VNĐ`
            }
        },
        {
            title: "Hành động",
            key: "action",
            render: (_: string, subRecord: TimeSlot) => (
                <Space>
                    <Link href={`/manager/field/addTimeSlot/${subRecord._id}`}> <Button type="primary" icon={<EditOutlined />} /></Link>
                    <Popconfirm
                        title="Bạn có chắc muốn xóa?"
                        description="Hành động này không thể hoàn tác."
                        onConfirm={() => handleDelete(subRecord._id)}
                        okText="Xác nhận"
                        cancelText="Hủy"
                    >
                        <Button type="primary" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const filteredData = fieldData?.map((item: Field, index: number) => ({
        ...item,
        key: (index + 1).toString(), // 🛠 Tạo key tự động từ index
    })) || [];

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <div className="bg-white p-6 rounded-lg shadow">
                <h1 className="text-xl font-semibold mb-4">Quản lý sân bóng</h1>
                <div>
                    <Tabs
                        activeKey={activeTab}
                        onChange={(key) => setActiveTab(key)}
                        items={[
                            {
                                key: '1',
                                label: 'Sân bóng',
                                children: (
                                    <div className="text-left">
                                        <div className="flex justify-between mb-4 ">
                                            <Button type="primary" className="bg-green-500">
                                                <Link href={`/manager/field/add`}>Thêm sân bóng</Link>
                                            </Button>
                                        </div>
                                        <Table
                                            className="border border-gray-200"
                                            columns={columns}
                                            dataSource={filteredData}
                                            pagination={{ pageSize: 5 }}
                                        />
                                    </div>
                                ),
                            },
                            {
                                key: '2',
                                label: 'Khung giờ',
                                children: (
                                    <div className="text-left">
                                        <div className="flex justify-between mb-4 ">
                                            <Button type="primary" className="bg-green-500">
                                                <Link href={`/manager/field/addTimeSlot`}>Thêm khung giờ</Link>
                                            </Button>
                                        </div>
                                        <Table
                                            className="border border-gray-200 mb-2"
                                            columns={subColumns}
                                            dataSource={timeSLotData || []}
                                            pagination={{ pageSize: 5 }} />
                                    </div>
                                ),
                            },

                        ]}
                    />
                </div>
            </div>


        </div>
    );
};

export default ListField;
