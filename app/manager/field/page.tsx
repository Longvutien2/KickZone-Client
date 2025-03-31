'use client';
import React, { useEffect, useState } from "react";
import { Table, Button, Input, Space, Badge, Modal, Popconfirm, Form, Tabs, Card } from "antd";
import { EyeOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { Field, TimeSlot } from "@/models/field";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import Link from "next/link";
import { RootStateType } from "@/models/type";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { getListFieldsSlice, removeFieldSlice } from "@/features/field.slice";
import { addTimeSlotSlice, getListTimeSlotsByFootballFieldId, removeTimeSlot, removeTimeSlotByFieldId, updateTimeSlotSlice } from "@/features/timeSlot.slice";
import { FootballField } from "@/models/football_field";


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

    const columns = [
        { title: "#", dataIndex: "key", key: "key" },
        { title: "Tên", dataIndex: "name", key: "name" },
        { title: "Số người", dataIndex: "people", key: "people" },
        { title: "Bắt đầu lúc", dataIndex: "start_time", key: "start_time" },
        { title: "Kết thúc lúc", dataIndex: "end_time", key: "end_time" },
        {
            title: "Tình trạng",
            dataIndex: "status",
            key: "status",
            render: (status: string) => (
                <Badge status="success" text={status} />
            ),
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
                        // onConfirm={() => handleDelete(record, record._id, "field")}
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

    const subColumns = [
        { title: "Ca ", dataIndex: "time", key: "time" },
        { title: "Gía tiền", dataIndex: "price", key: "price" },
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
                                            <Input
                                                placeholder="Tìm kiếm..."
                                                onChange={(e) => setSearchText(e.target.value)}
                                                className="w-64"
                                            />
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
                                            <Input
                                                placeholder="Tìm kiếm..."
                                                onChange={(e) => setSearchText(e.target.value)}
                                                className="w-64"
                                            />
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
